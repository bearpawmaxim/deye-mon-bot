package ua.pp.svitlo.power.data.model

data class Building(
    val id: Int,
    val name: String,
    val batteryPercent: Double,
    val color: String,
    val consumptionPower: String,
    val isCharging: Boolean,
    val isDischarging: Boolean,
    val isGridAvailable: Boolean? = null,
    val batteryDischargeTime: String? = null
) {
    fun getBatteryLevel(): Int = batteryPercent.toInt()
    
    fun getPowerStatus(): PowerStatus {
        return when {
            isCharging -> PowerStatus.CHARGING
            isDischarging -> PowerStatus.DISCHARGING
            isGridAvailable == true -> PowerStatus.GRID_AVAILABLE
            else -> PowerStatus.IDLE
        }
    }
    
    fun getConsumption(): String {
        return "$consumptionPower kW"
    }
    
    fun getDischargeTimeFormatted(): String? {
        return batteryDischargeTime?.let {
            // Assuming format like "02:30:45" (HH:MM:SS)
            try {
                val parts = it.split(":")
                if (parts.size == 3) {
                    val hours = parts[0].toInt()
                    val minutes = parts[1].toInt()
                    when {
                        hours > 0 -> "${hours}h ${minutes}m"
                        minutes > 0 -> "${minutes}m"
                        else -> "< 1m"
                    }
                } else {
                    it
                }
            } catch (e: Exception) {
                it
            }
        }
    }
}

enum class PowerStatus {
    CHARGING,
    DISCHARGING,
    GRID_AVAILABLE,
    IDLE
}

