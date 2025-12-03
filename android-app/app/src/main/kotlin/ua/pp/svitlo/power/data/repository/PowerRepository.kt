package ua.pp.svitlo.power.data.repository

import ua.pp.svitlo.power.data.api.RetrofitClient
import ua.pp.svitlo.power.data.model.Building
import ua.pp.svitlo.power.data.model.DashboardSettings
import ua.pp.svitlo.power.data.model.OutageScheduleResponse
import ua.pp.svitlo.power.data.model.PowerLogRequest
import ua.pp.svitlo.power.data.model.PowerLogResponse
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

class PowerRepository {
    private val apiService = RetrofitClient.apiService
    
    suspend fun getBuildings(): Result<List<Building>> {
        return try {
            val response = apiService.getBuildings()
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getDashboardConfig(): Result<DashboardSettings> {
        return try {
            val response = apiService.getDashboardConfig()
            Result.success(DashboardSettings.fromConfigList(response))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getOutagesSchedule(queue: String): Result<OutageScheduleResponse> {
        return try {
            val response = apiService.getOutagesSchedule(queue)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getPowerLogs(buildingId: Int, startDate: String, endDate: String): Result<PowerLogResponse> {
        return try {
            val request = PowerLogRequest(startDate, endDate)
            val response = apiService.getPowerLogs(buildingId, request)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    fun getTodayDateRange(): Pair<String, String> {
        return getDateRangeForDate(java.time.LocalDate.now())
    }
    
    fun getDateRangeForDate(date: java.time.LocalDate): Pair<String, String> {
        val zone = java.time.ZoneId.systemDefault()
        
        // Get start of the day in local timezone, then convert to UTC
        val startOfDayLocal = date.atStartOfDay(zone)
        val startOfDayUtc = startOfDayLocal.withZoneSameInstant(java.time.ZoneOffset.UTC)
        
        // Get end of the day in local timezone, then convert to UTC
        val endOfDayLocal = date.atTime(23, 59, 59, 999000000).atZone(zone)
        val endOfDayUtc = endOfDayLocal.withZoneSameInstant(java.time.ZoneOffset.UTC)
        
        val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
        return Pair(
            startOfDayUtc.format(formatter),
            endOfDayUtc.format(formatter)
        )
    }
}

