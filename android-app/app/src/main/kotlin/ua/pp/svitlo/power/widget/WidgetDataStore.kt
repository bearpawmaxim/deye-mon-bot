package ua.pp.svitlo.power.widget

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking

/**
 * DataStore для хранения данных виджета
 */
private val Context.widgetDataStore: DataStore<Preferences> by preferencesDataStore(name = "widget_data")

object WidgetDataStore {
    
    private val QUEUE_KEY = stringPreferencesKey("queue")
    private val UPDATED_ON_KEY = stringPreferencesKey("updated_on")
    private val IS_ERROR_KEY = booleanPreferencesKey("is_error")
    private val ERROR_MESSAGE_KEY = stringPreferencesKey("error_message")
    
    // Current slot
    private val CURRENT_SLOT_TIME_RANGE_KEY = stringPreferencesKey("current_slot_time_range")
    private val CURRENT_SLOT_STATUS_KEY = stringPreferencesKey("current_slot_status")
    private val CURRENT_SLOT_REMAINING_KEY = intPreferencesKey("current_slot_remaining")
    private val CURRENT_SLOT_TYPE_KEY = stringPreferencesKey("current_slot_type")
    
    // Next slot
    private val NEXT_SLOT_TIME_RANGE_KEY = stringPreferencesKey("next_slot_time_range")
    private val NEXT_SLOT_STATUS_KEY = stringPreferencesKey("next_slot_status")
    private val NEXT_SLOT_TYPE_KEY = stringPreferencesKey("next_slot_type")
    
    // Today stats
    private val TODAY_COMPLETED_KEY = intPreferencesKey("today_completed")
    private val TODAY_ACTIVE_KEY = intPreferencesKey("today_active")
    private val TODAY_UPCOMING_KEY = intPreferencesKey("today_upcoming")
    private val TODAY_TOTAL_MINUTES_KEY = intPreferencesKey("today_total_minutes")
    
    /**
     * Сохранить данные виджета
     */
    suspend fun saveData(context: Context, data: WidgetData) {
        context.widgetDataStore.edit { prefs ->
            prefs[QUEUE_KEY] = data.queue
            prefs[UPDATED_ON_KEY] = data.updatedOn
            prefs[IS_ERROR_KEY] = data.isError
            prefs[ERROR_MESSAGE_KEY] = data.errorMessage
            
            // Current slot
            data.currentSlot?.let { slot ->
                prefs[CURRENT_SLOT_TIME_RANGE_KEY] = slot.timeRange
                prefs[CURRENT_SLOT_STATUS_KEY] = slot.status.name
                slot.remainingMinutes?.let { prefs[CURRENT_SLOT_REMAINING_KEY] = it }
                prefs[CURRENT_SLOT_TYPE_KEY] = slot.type
            } ?: run {
                prefs.remove(CURRENT_SLOT_TIME_RANGE_KEY)
                prefs.remove(CURRENT_SLOT_STATUS_KEY)
                prefs.remove(CURRENT_SLOT_REMAINING_KEY)
                prefs.remove(CURRENT_SLOT_TYPE_KEY)
            }
            
            // Next slot
            data.nextSlot?.let { slot ->
                prefs[NEXT_SLOT_TIME_RANGE_KEY] = slot.timeRange
                prefs[NEXT_SLOT_STATUS_KEY] = slot.status.name
                prefs[NEXT_SLOT_TYPE_KEY] = slot.type
            } ?: run {
                prefs.remove(NEXT_SLOT_TIME_RANGE_KEY)
                prefs.remove(NEXT_SLOT_STATUS_KEY)
                prefs.remove(NEXT_SLOT_TYPE_KEY)
            }
            
            // Today stats
            prefs[TODAY_COMPLETED_KEY] = data.todayStats.completed
            prefs[TODAY_ACTIVE_KEY] = data.todayStats.active
            prefs[TODAY_UPCOMING_KEY] = data.todayStats.upcoming
            prefs[TODAY_TOTAL_MINUTES_KEY] = data.todayStats.totalMinutes
        }
    }
    
    /**
     * Получить данные виджета (синхронно для использования в provideGlance)
     */
    fun getData(context: Context): WidgetData {
        return runBlocking {
            context.widgetDataStore.data.map { prefs ->
                val currentSlot = if (prefs.contains(CURRENT_SLOT_TIME_RANGE_KEY)) {
                    SlotInfo(
                        timeRange = prefs[CURRENT_SLOT_TIME_RANGE_KEY] ?: "",
                        status = SlotStatus.valueOf(prefs[CURRENT_SLOT_STATUS_KEY] ?: "UPCOMING"),
                        remainingMinutes = prefs[CURRENT_SLOT_REMAINING_KEY],
                        type = prefs[CURRENT_SLOT_TYPE_KEY] ?: ""
                    )
                } else null
                
                val nextSlot = if (prefs.contains(NEXT_SLOT_TIME_RANGE_KEY)) {
                    SlotInfo(
                        timeRange = prefs[NEXT_SLOT_TIME_RANGE_KEY] ?: "",
                        status = SlotStatus.valueOf(prefs[NEXT_SLOT_STATUS_KEY] ?: "UPCOMING"),
                        type = prefs[NEXT_SLOT_TYPE_KEY] ?: ""
                    )
                } else null
                
                WidgetData(
                    queue = prefs[QUEUE_KEY] ?: "6.2",
                    updatedOn = prefs[UPDATED_ON_KEY] ?: "",
                    currentSlot = currentSlot,
                    nextSlot = nextSlot,
                    todayStats = TodayStats(
                        completed = prefs[TODAY_COMPLETED_KEY] ?: 0,
                        active = prefs[TODAY_ACTIVE_KEY] ?: 0,
                        upcoming = prefs[TODAY_UPCOMING_KEY] ?: 0,
                        totalMinutes = prefs[TODAY_TOTAL_MINUTES_KEY] ?: 0
                    ),
                    isError = prefs[IS_ERROR_KEY] ?: false,
                    errorMessage = prefs[ERROR_MESSAGE_KEY] ?: ""
                )
            }.first()
        }
    }
    
    /**
     * Очистить данные виджета
     */
    suspend fun clearData(context: Context) {
        context.widgetDataStore.edit { it.clear() }
    }
}

