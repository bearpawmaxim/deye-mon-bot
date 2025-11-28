package ua.pp.svitlo.power.data.model

import com.google.gson.annotations.SerializedName

data class OutageScheduleResponse(
    val days: List<DaySchedule>,
    val updatedOn: String
)

data class DaySchedule(
    val date: String,
    val status: String,
    val slots: List<TimeSlot>
)

data class TimeSlot(
    val start: Int,  // Minutes from midnight
    val end: Int,    // Minutes from midnight
    val type: String
) {
    // Convert minutes to HH:MM format
    fun getStartTime(): String {
        val hours = start / 60
        val minutes = start % 60
        return String.format("%02d:%02d", hours, minutes)
    }
    
    fun getEndTime(): String {
        val hours = end / 60
        val minutes = end % 60
        return String.format("%02d:%02d", hours, minutes)
    }
    
    fun getTimeRange(): String = "${getStartTime()} - ${getEndTime()}"
}

