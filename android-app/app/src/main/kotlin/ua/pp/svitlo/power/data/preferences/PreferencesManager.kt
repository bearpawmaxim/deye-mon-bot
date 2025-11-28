package ua.pp.svitlo.power.data.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

class PreferencesManager(private val context: Context) {
    
    companion object {
        private val DARK_MODE_KEY = booleanPreferencesKey("dark_mode")
        private val DARK_MODE_SET_KEY = booleanPreferencesKey("dark_mode_set")
        private val AUTO_REFRESH_INTERVAL_KEY = intPreferencesKey("auto_refresh_interval")
        private val NOTIFICATIONS_ENABLED_KEY = booleanPreferencesKey("notifications_enabled")
    }
    
  
    val darkModeFlow: Flow<Boolean?> = context.dataStore.data.map { preferences ->
        val isSet = preferences[DARK_MODE_SET_KEY] ?: false
        if (isSet) {
            preferences[DARK_MODE_KEY] ?: false
        } else {
            null // if not ser use system
        }
    }
    
    val autoRefreshIntervalFlow: Flow<Int> = context.dataStore.data.map { preferences ->
        preferences[AUTO_REFRESH_INTERVAL_KEY] ?: 300 // 300 = 5 minutes (default)
    }
    
    val notificationsEnabledFlow: Flow<Boolean> = context.dataStore.data.map { preferences ->
        preferences[NOTIFICATIONS_ENABLED_KEY] ?: true // По умолчанию включены
    }
    
    suspend fun setDarkMode(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[DARK_MODE_KEY] = enabled
            preferences[DARK_MODE_SET_KEY] = true 
        }
    }
    
    suspend fun setAutoRefreshInterval(seconds: Int) {
        context.dataStore.edit { preferences ->
            preferences[AUTO_REFRESH_INTERVAL_KEY] = seconds
        }
    }
    
    suspend fun setNotificationsEnabled(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[NOTIFICATIONS_ENABLED_KEY] = enabled
        }
    }
    
    suspend fun resetToSystemTheme() {
        context.dataStore.edit { preferences ->
            preferences.remove(DARK_MODE_KEY)
            preferences[DARK_MODE_SET_KEY] = false
        }
    }
}

