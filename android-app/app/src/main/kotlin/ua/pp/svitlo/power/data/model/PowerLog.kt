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

    fun getPaddedPeriods(selectedDate: java.time.LocalDate = java.time.LocalDate.now()): List<PowerPeriod> {
        if (periods.isEmpty()) return periods
        
        val systemZone = java.time.ZoneId.systemDefault()
        val dayStart = selectedDate.atStartOfDay(systemZone)
        
        val adjustedPeriods = mutableListOf<PowerPeriod>()
        
        periods.forEach { period ->
            val periodStart = java.time.ZonedDateTime.parse(period.startTime).withZoneSameInstant(systemZone)
            val periodEnd = java.time.ZonedDateTime.parse(period.endTime).withZoneSameInstant(systemZone)
            
            if (periodStart.isBefore(dayStart)) {
                // Если период заканчивается до начала выбранного дня - пропускаем
                if (periodEnd.isBefore(dayStart) || periodEnd.isEqual(dayStart)) {
                    return@forEach
                }
                
                val adjustedDuration = java.time.Duration.between(dayStart, periodEnd).seconds.toInt()
                adjustedPeriods.add(
                    PowerPeriod(
                        startTime = dayStart.toString(),
                        endTime = periodEnd.toString(),
                        durationSeconds = adjustedDuration,
                        isAvailable = period.isAvailable
                    )
                )
            } else {
                adjustedPeriods.add(
                    PowerPeriod(
                        startTime = periodStart.toString(),
                        endTime = periodEnd.toString(),
                        durationSeconds = period.durationSeconds,
                        isAvailable = period.isAvailable
                    )
                )
            }
        }
        
        return adjustedPeriods
    }

    fun isLastPeriodOngoing(): Boolean {
        if (periods.isEmpty()) return false

        val systemZone = java.time.ZoneId.systemDefault()
        val now = java.time.ZonedDateTime.now(systemZone)
        val lastPeriod = periods.last()
        
        val lastEnd = java.time.ZonedDateTime.parse(lastPeriod.endTime).withZoneSameInstant(systemZone)
        val lastStart = java.time.ZonedDateTime.parse(lastPeriod.startTime).withZoneSameInstant(systemZone)

        return now.isAfter(lastStart) && (lastEnd.isAfter(now) || lastEnd.hour >= 21)
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
            val systemZone = java.time.ZoneId.systemDefault()
            val time = java.time.ZonedDateTime.parse(startTime).withZoneSameInstant(systemZone)
            time.format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss"))
        } catch (e: Exception) {
            startTime
        }
    }

    fun getEndTimeFormatted(isOngoing: Boolean = false): String {
        return try {
            val systemZone = java.time.ZoneId.systemDefault()
            if (isOngoing) {
                val now = java.time.ZonedDateTime.now(systemZone)
                now.format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss"))
            } else {
                val time = java.time.ZonedDateTime.parse(endTime).withZoneSameInstant(systemZone)
                time.format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss"))
            }
        } catch (e: Exception) {
            endTime
        }
    }

    fun getCurrentDuration(): Int {
        return try {
            val systemZone = java.time.ZoneId.systemDefault()
            val start = java.time.ZonedDateTime.parse(startTime).withZoneSameInstant(systemZone)
            val now = java.time.ZonedDateTime.now(systemZone)
            java.time.Duration.between(start, now).seconds.toInt()
        } catch (e: Exception) {
            durationSeconds
        }
    }
}
