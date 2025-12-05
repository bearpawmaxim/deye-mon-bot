package ua.pp.svitlo.power.widget

import ua.pp.svitlo.power.data.model.TimeSlot
import java.time.LocalTime

/**
 * Data class representing widget state
 */
data class WidgetData(
    val queue: String = "6.2",
    val updatedOn: String = "",
    val currentSlot: SlotInfo? = null,
    val nextSlot: SlotInfo? = null,
    val upcomingSlots: List<SlotInfo> = emptyList(), // All upcoming slots for large widget
    val todayStats: TodayStats = TodayStats(),
    val isError: Boolean = false,
    val errorMessage: String = ""
)

data class SlotInfo(
    val timeRange: String,
    val status: SlotStatus,
    val remainingMinutes: Int? = null,
    val type: String
)

data class TodayStats(
    val completed: Int = 0,
    val active: Int = 0,
    val upcoming: Int = 0,
    val totalMinutes: Int = 0
)

enum class SlotStatus {
    PASSED, ACTIVE, UPCOMING
}

/**
 * Helper functions to determine slot status
 */
fun getSlotStatus(slot: TimeSlot, isToday: Boolean): SlotStatus {
    if (!isToday) return SlotStatus.UPCOMING
    
    val now = LocalTime.now()
    val currentMinutes = now.hour * 60 + now.minute
    
    return when {
        currentMinutes >= slot.end -> SlotStatus.PASSED
        currentMinutes >= slot.start -> SlotStatus.ACTIVE
        else -> SlotStatus.UPCOMING
    }
}

fun getRemainingMinutes(slot: TimeSlot): Int {
    val now = LocalTime.now()
    val currentMinutes = now.hour * 60 + now.minute
    val remaining = slot.end - currentMinutes
    return if (remaining > 0) remaining else 0
}

