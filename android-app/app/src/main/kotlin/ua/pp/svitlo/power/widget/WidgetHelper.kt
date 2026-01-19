package ua.pp.svitlo.power.widget

import android.content.Context
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.updateAll
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import ua.pp.svitlo.power.data.model.OutageScheduleResponse
import ua.pp.svitlo.power.data.preferences.PreferencesManager
import ua.pp.svitlo.power.data.repository.PowerRepository

/**
 * Helper для быстрого обновления виджета из других частей приложения
 */
object WidgetHelper {
    
    private val repository = PowerRepository()
    
    /**
     * Обновить виджет с текущими данными из приложения
     */
    suspend fun updateWidget(context: Context) {
        withContext(Dispatchers.IO) {
            try {
                // Получаем текущую очередь из настроек
                val preferencesManager = PreferencesManager(context)
                // Здесь можно получить очередь из настроек, если она там сохранена
                // Пока используем дефолтную
                val queue = "6.2"
                
                // Запускаем обновление через WorkManager
                OutagesWidgetUpdater.enqueueUpdate(context, queue)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
    
    /**
     * Обновить виджет с уже загруженными данными
     * (полезно, когда данные уже есть в OutagesScreen)
     */
    suspend fun updateWidgetWithData(
        context: Context,
        response: OutageScheduleResponse,
        queue: String
    ) {
        withContext(Dispatchers.IO) {
            try {
                val widgetData = processOutagesData(response, queue)
                WidgetDataStore.saveData(context, widgetData)
                OutagesWidget().updateAll(context)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
    
    /**
     * Обрабатываем данные расписания для виджета
     * (Дублирует логику из Worker для прямого использования)
     */
    private fun processOutagesData(response: OutageScheduleResponse, queue: String): WidgetData {
        val today = java.time.LocalDate.now()
        val now = java.time.LocalTime.now()
        val currentMinutes = now.hour * 60 + now.minute
        
        // Find today's schedule
        val todaySchedule = response.days.firstOrNull { day ->
            val scheduleDate = java.time.ZonedDateTime.parse(day.date).toLocalDate()
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
            
            TodayStats(
                completed = completed,
                active = active,
                upcoming = upcoming,
                totalMinutes = totalMinutes
            )
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
     * Обновить очередь в виджете
     */
    fun updateWidgetQueue(context: Context, queue: String) {
        OutagesWidgetUpdater.updateQueue(context, queue)
    }
}

