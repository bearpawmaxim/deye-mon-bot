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
    
    // Pad periods to full day (24 hours)
    fun getPaddedPeriods(): List<PowerPeriod> {
        if (periods.isEmpty()) return periods
        
        val now = java.time.ZonedDateTime.now()
        val dayStart = now.withHour(0).withMinute(0).withSecond(0).withNano(0)
        val dayEnd = now.withHour(23).withMinute(59).withSecond(59).withNano(999000000)
        
        val result = mutableListOf<PowerPeriod>()
        
        val firstPeriod = periods.first()
        val firstStart = java.time.ZonedDateTime.parse(firstPeriod.startTime)
        
        // Add padding at the beginning if needed
        if (firstStart.isAfter(dayStart)) {
            val paddingSeconds = java.time.Duration.between(dayStart, firstStart).seconds.toInt()
            result.add(
                PowerPeriod(
                    startTime = dayStart.toString(),
                    endTime = firstPeriod.startTime,
                    durationSeconds = paddingSeconds,
                    isAvailable = !firstPeriod.isAvailable
                )
            )
        }
        
        // Add all original periods
        result.addAll(periods)
        
        // Add padding at the end if needed (only if not near end of day)
        val lastPeriod = periods.last()
        val lastEnd = java.time.ZonedDateTime.parse(lastPeriod.endTime)
        val endOfDayThreshold = now.withHour(23).withMinute(50).withSecond(0).withNano(0)
        
        if (lastEnd.isBefore(dayEnd) && lastEnd.isBefore(endOfDayThreshold)) {
            val paddingSeconds = java.time.Duration.between(lastEnd, dayEnd).seconds.toInt()
            result.add(
                PowerPeriod(
                    startTime = lastPeriod.endTime,
                    endTime = dayEnd.toString(),
                    durationSeconds = paddingSeconds,
                    isAvailable = !lastPeriod.isAvailable
                )
            )
        }
        
        return result
    }
    
    // Check if last period is ongoing (for today)
    fun isLastPeriodOngoing(): Boolean {
        if (periods.isEmpty()) return false
        
        val now = java.time.ZonedDateTime.now()
        val lastPeriod = periods.last()
        val lastEnd = java.time.ZonedDateTime.parse(lastPeriod.endTime)
        val endOfDayThreshold = now.withHour(23).withMinute(50).withSecond(0).withNano(0)
        
        return lastEnd.isAfter(endOfDayThreshold) && now.isAfter(java.time.ZonedDateTime.parse(lastPeriod.startTime))
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

