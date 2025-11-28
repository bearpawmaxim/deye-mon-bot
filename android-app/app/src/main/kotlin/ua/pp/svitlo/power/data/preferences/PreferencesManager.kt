package ua.pp.svitlo.power.data.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

class PreferencesManager(private val context: Context) {
    
    companion object {
        private val DARK_MODE_KEY = booleanPreferencesKey("dark_mode")
        private val DARK_MODE_SET_KEY = booleanPreferencesKey("dark_mode_set")
    }
    
  
    val darkModeFlow: Flow<Boolean?> = context.dataStore.data.map { preferences ->
        val isSet = preferences[DARK_MODE_SET_KEY] ?: false
        if (isSet) {
            preferences[DARK_MODE_KEY] ?: false
        } else {
            null // if not ser use system
        }
    }
    
    suspend fun setDarkMode(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[DARK_MODE_KEY] = enabled
            preferences[DARK_MODE_SET_KEY] = true 
        }
    }
    
    suspend fun resetToSystemTheme() {
        context.dataStore.edit { preferences ->
            preferences.remove(DARK_MODE_KEY)
            preferences[DARK_MODE_SET_KEY] = false
        }
    }
}

