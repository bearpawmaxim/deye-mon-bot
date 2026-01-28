package ua.pp.svitlo.power.data.model

data class BuildingName(
    val en: String? = null,
    val uk: String? = null
)

enum class ChargeSource {
    None,
    Grid,
    Generator,
    Solar,
    Recuperation
}

// Response from GET /api/dashboard/buildings
data class BuildingBasicInfo(
    val id: String,
    val name: BuildingName,
    val color: String,
    val hasBoundStation: Boolean? = null
)

// Response from POST /api/dashboard/buildings/summary
data class BuildingSummary(
    val id: String,
    val isGridAvailable: Boolean? = null,
    val gridAvailabilityPct: Int? = null,
    val hasMixedReporterStates: Boolean? = null,
    val isCharging: Boolean? = null,
    val isDischarging: Boolean? = null,
    val isOffline: Boolean? = null,
    val batteryPercent: Double? = null,
    val consumptionPower: String? = null,
    val batteryDischargeTime: String? = null,
    val batteryChargeTime: String? = null,
    val chargeSource: ChargeSource? = null,
    val chargePower: Double? = null
)

// Request for POST /api/dashboard/buildings/summary
data class BuildingsSummaryRequest(
    val buildingIds: List<String>
)

data class Building(
    val id: String,
    val name: BuildingName,
    val batteryPercent: Double? = null,
    val color: String,
    val consumptionPower: String? = null,
    val isCharging: Boolean? = null,
    val isDischarging: Boolean? = null,
    val isGridAvailable: Boolean? = null,
    val batteryDischargeTime: String? = null,
    val batteryChargeTime: String? = null,
    val hasMixedReporterStates: Boolean? = null,
    val isOffline: Boolean? = null,
    val hasBoundStation: Boolean? = null,
    val chargeSource: ChargeSource? = null,
    val chargePower: Double? = null,
    val gridAvailabilityPct: Int? = null
) {
    companion object {
        fun fromBasicAndSummary(basic: BuildingBasicInfo, summary: BuildingSummary?): Building {
            return Building(
                id = basic.id,
                name = basic.name,
                color = basic.color,
                hasBoundStation = basic.hasBoundStation,
                batteryPercent = summary?.batteryPercent,
                consumptionPower = summary?.consumptionPower,
                isCharging = summary?.isCharging,
                isDischarging = summary?.isDischarging,
                isGridAvailable = summary?.isGridAvailable,
                batteryDischargeTime = summary?.batteryDischargeTime,
                batteryChargeTime = summary?.batteryChargeTime,
                hasMixedReporterStates = summary?.hasMixedReporterStates,
                isOffline = summary?.isOffline,
                chargeSource = summary?.chargeSource,
                chargePower = summary?.chargePower,
                gridAvailabilityPct = summary?.gridAvailabilityPct
            )
        }
    }
    
    fun getDisplayName(): String = name.en ?: name.uk ?: "Unknown"
    
    fun getBatteryLevel(): Int = batteryPercent?.toInt() ?: 0
    
    fun getPowerStatus(): PowerStatus {
        return when {
            isOffline == true -> PowerStatus.OFFLINE
            isCharging == true -> PowerStatus.CHARGING
            isDischarging == true -> PowerStatus.DISCHARGING
            isGridAvailable == true -> PowerStatus.GRID_AVAILABLE
            else -> PowerStatus.IDLE
        }
    }
    
    fun getConsumption(): String {
        return "${consumptionPower ?: "0"} kW"
    }
    
    fun getChargeTimeFormatted(): String? {
        return batteryChargeTime
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
    IDLE,
    OFFLINE
}

