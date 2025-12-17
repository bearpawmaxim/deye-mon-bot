package ua.pp.svitlo.power.data.api

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import ua.pp.svitlo.power.data.model.Building
import ua.pp.svitlo.power.data.model.DashboardConfig
import ua.pp.svitlo.power.data.model.OutageScheduleResponse
import ua.pp.svitlo.power.data.model.PowerLogRequest
import ua.pp.svitlo.power.data.model.PowerLogResponse

interface ApiService {
    @GET("buildings/buildings")
    suspend fun getBuildings(): List<Building>
    
    @GET("buildings/dashboardConfig")
    suspend fun getDashboardConfig(): List<DashboardConfig>
    
    @GET("outagesSchedule/outagesSchedule/{queue}")
    suspend fun getOutagesSchedule(@Path("queue") queue: String): OutageScheduleResponse
    
    @POST("buildings/{buildingId}/power-logs")
    suspend fun getPowerLogs(
        @Path("buildingId") buildingId: String,
        @Body request: PowerLogRequest
    ): PowerLogResponse
}

