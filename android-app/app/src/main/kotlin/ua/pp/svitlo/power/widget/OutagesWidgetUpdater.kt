package ua.pp.svitlo.power.widget

import android.content.Context
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.updateAll
import androidx.work.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import ua.pp.svitlo.power.data.model.DaySchedule
import ua.pp.svitlo.power.data.model.OutageScheduleResponse
import ua.pp.svitlo.power.data.repository.PowerRepository
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZonedDateTime
import java.util.concurrent.TimeUnit

/**
 * Worker для обновления данных виджета
 */
class OutagesWidgetUpdateWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {
    
    private val repository = PowerRepository()
    
    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            // Получаем текущую очередь (можно сохранять в PreferencesManager)
            val queue = inputData.getString(KEY_QUEUE) ?: "6.2"
            
            // Загружаем расписание
            repository.getOutagesSchedule(queue)
                .onSuccess { response ->
                    val widgetData = processOutagesData(response, queue)
                    WidgetDataStore.saveData(applicationContext, widgetData)
                    
                    // Обновляем все виджеты
                    OutagesWidget().updateAll(applicationContext)
                }
                .onFailure { error ->
                    // В случае ошибки сохраняем информацию об ошибке
                    val errorData = WidgetData(
                        queue = queue,
                        isError = true,
                        errorMessage = error.message ?: "Невідома помилка"
                    )
                    WidgetDataStore.saveData(applicationContext, errorData)
                    OutagesWidget().updateAll(applicationContext)
                }
            
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
    
    /**
     * Обрабатываем данные расписания для виджета
     */
    private fun processOutagesData(response: OutageScheduleResponse, queue: String): WidgetData {
        val today = LocalDate.now()
        val now = LocalTime.now()
        val currentMinutes = now.hour * 60 + now.minute
        
        // Find today's schedule
        val todaySchedule = response.days.firstOrNull { day ->
            val scheduleDate = ZonedDateTime.parse(day.date).toLocalDate()
            scheduleDate.isEqual(today)
        }
        
        // Check if today has Emergency status
        val isEmergency = todaySchedule?.status == "EmergencyShutdowns"
        
        // If emergency - no scheduled outages apply
        if (isEmergency) {
            return WidgetData(
                queue = queue,
                updatedOn = response.updatedOn,
                currentSlot = null,
                nextSlot = null,
                upcomingSlots = emptyList(),
                todayStats = TodayStats(),
                isError = false,
                isEmergency = true
            )
        }
        
        var currentSlot: SlotInfo? = null
        var nextSlot: SlotInfo? = null
        val upcomingSlots = mutableListOf<SlotInfo>()
        
        todaySchedule?.let { day ->
            // Ищем текущий и следующий слот
            day.slots.forEach { slot ->
                val status = getSlotStatus(slot, true)
                
                when (status) {
                    SlotStatus.ACTIVE -> {
                        currentSlot = SlotInfo(
                            timeRange = slot.getTimeRange(),
                            status = status,
                            remainingMinutes = getRemainingMinutes(slot),
                            type = slot.type
                        )
                    }
                    SlotStatus.UPCOMING -> {
                        val slotInfo = SlotInfo(
                            timeRange = slot.getTimeRange(),
                            status = status,
                            type = slot.type
                        )
                        upcomingSlots.add(slotInfo)
                        if (nextSlot == null) {
                            nextSlot = slotInfo
                        }
                    }
                    else -> {}
                }
            }
        }
        
        // Today's statistics
        val todayStats = todaySchedule?.let { day ->
            calculateTodayStats(day)
        } ?: TodayStats()
        
        return WidgetData(
            queue = queue,
            updatedOn = response.updatedOn,
            currentSlot = currentSlot,
            nextSlot = nextSlot,
            upcomingSlots = upcomingSlots,
            todayStats = todayStats,
            isError = false,
            isEmergency = false
        )
    }
    
    /**
     * Calculate today's statistics
     */
    private fun calculateTodayStats(day: DaySchedule): TodayStats {
        var completed = 0
        var active = 0
        var upcoming = 0
        var totalMinutes = 0
        
        day.slots.forEach { slot ->
            val status = getSlotStatus(slot, true)
            when (status) {
                SlotStatus.PASSED -> completed++
                SlotStatus.ACTIVE -> active++
                SlotStatus.UPCOMING -> upcoming++
            }
            totalMinutes += slot.end - slot.start
        }
        
        return TodayStats(
            completed = completed,
            active = active,
            upcoming = upcoming,
            totalMinutes = totalMinutes
        )
    }
    
    companion object {
        const val WORK_NAME = "outages_widget_update"
        const val PERIODIC_WORK_NAME = "outages_widget_periodic_update"
        const val KEY_QUEUE = "queue"
    }
}

/**
 * Утилита для запуска обновлений виджета
 */
object OutagesWidgetUpdater {
    
    /**
     * Запустить одноразовое обновление
     */
    fun enqueueUpdate(context: Context, queue: String = "6.2") {
        val updateRequest = OneTimeWorkRequestBuilder<OutagesWidgetUpdateWorker>()
            .setInputData(
                workDataOf(OutagesWidgetUpdateWorker.KEY_QUEUE to queue)
            )
            .setConstraints(
                Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .build()
            )
            .build()
        
        WorkManager.getInstance(context)
            .enqueueUniqueWork(
                OutagesWidgetUpdateWorker.WORK_NAME,
                ExistingWorkPolicy.REPLACE,
                updateRequest
            )
    }
    
    /**
     * Настроить периодическое обновление (каждые 30 минут)
     */
    fun enqueuePeriodicUpdates(context: Context, queue: String = "6.2") {
        val periodicRequest = PeriodicWorkRequestBuilder<OutagesWidgetUpdateWorker>(
            30, TimeUnit.MINUTES,
            15, TimeUnit.MINUTES // Flex interval
        )
            .setInputData(
                workDataOf(OutagesWidgetUpdateWorker.KEY_QUEUE to queue)
            )
            .setConstraints(
                Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .build()
            )
            .build()
        
        WorkManager.getInstance(context)
            .enqueueUniquePeriodicWork(
                OutagesWidgetUpdateWorker.PERIODIC_WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP,
                periodicRequest
            )
    }
    
    /**
     * Отменить все обновления
     */
    fun cancelUpdates(context: Context) {
        WorkManager.getInstance(context).apply {
            cancelUniqueWork(OutagesWidgetUpdateWorker.WORK_NAME)
            cancelUniqueWork(OutagesWidgetUpdateWorker.PERIODIC_WORK_NAME)
        }
    }
    
    /**
     * Обновить очередь и перезапустить периодические обновления
     */
    fun updateQueue(context: Context, queue: String) {
        // Отменяем старые обновления
        cancelUpdates(context)
        
        // Запускаем новое обновление с новой очередью
        enqueueUpdate(context, queue)
        enqueuePeriodicUpdates(context, queue)
    }
}

