package ua.pp.svitlo.power.data.model

data class PowerLogRequest(
    val startDate: String,
    val endDate: String
)

data class PowerLogResponse(
    val periods: List<PowerPeriod>,
    val totalAvailableSeconds: Int,
    val totalSeconds: Int,
    val totalUnavailableSeconds: Int
) {
    fun getAvailabilityPercentage(): Int {
        return if (totalSeconds > 0) {
            ((totalAvailableSeconds.toDouble() / totalSeconds) * 100).toInt()
        } else {
            0
        }
    }
    
    fun getUnavailabilityPercentage(): Int {
        return if (totalSeconds > 0) {
            ((totalUnavailableSeconds.toDouble() / totalSeconds) * 100).toInt()
        } else {
            0
        }
    }
    
    fun getTotalAvailableTime(): String {
        return formatDuration(totalAvailableSeconds)
    }
    
    fun getTotalUnavailableTime(): String {
        return formatDuration(totalUnavailableSeconds)
    }
    
    private fun formatDuration(seconds: Int): String {
        val hours = seconds / 3600
        val minutes = (seconds % 3600) / 60
        return when {
            hours > 0 -> "${hours}h ${minutes}m"
            minutes > 0 -> "${minutes}m"
            else -> "${seconds}s"
        }
    }
    
    fun getPaddedPeriods(): List<PowerPeriod> {
        // Backend now handles start padding with correct status from last known state
        return periods
    }
    
    fun isLastPeriodOngoing(): Boolean {
        if (periods.isEmpty()) return false
        
        val now = java.time.ZonedDateTime.now()
        val lastPeriod = periods.last()
        val lastEnd = java.time.ZonedDateTime.parse(lastPeriod.endTime)
        
        return lastEnd.hour >= 23 && now.isAfter(java.time.ZonedDateTime.parse(lastPeriod.startTime))
    }
}

data class PowerPeriod(
    val startTime: String,
    val endTime: String,
    val durationSeconds: Int,
    val isAvailable: Boolean
) {
    fun getDurationFormatted(currentSeconds: Int? = null): String {
        val seconds = currentSeconds ?: durationSeconds
        val hours = seconds / 3600
        val minutes = (seconds % 3600) / 60
        val secs = seconds % 60
        
        return when {
            hours > 0 -> String.format("%dh %dm %ds", hours, minutes, secs)
            minutes > 0 -> String.format("%dm %ds", minutes, secs)
            else -> String.format("%ds", secs)
        }
    }
    
    fun getStartTimeFormatted(): String {
        return try {
            val time = java.time.ZonedDateTime.parse(startTime)
            time.format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss"))
        } catch (e: Exception) {
            startTime
        }
    }
    
    fun getEndTimeFormatted(isOngoing: Boolean = false): String {
        return try {
            if (isOngoing) {
                val now = java.time.ZonedDateTime.now()
                now.format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss"))
            } else {
                val time = java.time.ZonedDateTime.parse(endTime)
                time.format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss"))
            }
        } catch (e: Exception) {
            endTime
        }
    }
    
    fun getCurrentDuration(): Int {
        return try {
            val start = java.time.ZonedDateTime.parse(startTime)
            val now = java.time.ZonedDateTime.now()
            java.time.Duration.between(start, now).seconds.toInt()
        } catch (e: Exception) {
            durationSeconds
        }
    }
}

