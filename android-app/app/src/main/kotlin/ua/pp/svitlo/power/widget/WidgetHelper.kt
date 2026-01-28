package ua.pp.svitlo.power.widget

import android.content.Context
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.updateAll
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import ua.pp.svitlo.power.data.firebase.FirebaseConfigManager
import ua.pp.svitlo.power.data.model.OutageScheduleResponse
import ua.pp.svitlo.power.data.repository.PowerRepository

object WidgetHelper {
    
    private val repository = PowerRepository()
    
    suspend fun updateWidget(context: Context) {
        withContext(Dispatchers.IO) {
            try {
                val queue = FirebaseConfigManager.getYasnoQueue()
                OutagesWidgetUpdater.enqueueUpdate(context, queue)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
    
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
    
    fun updateWidgetQueue(context: Context, queue: String) {
        OutagesWidgetUpdater.updateQueue(context, queue)
    }
}

