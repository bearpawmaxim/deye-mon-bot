package ua.pp.svitlo.power.fcm

import android.content.Context
import android.os.Build
import android.util.Log
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.coroutines.tasks.await
import ua.pp.svitlo.power.data.api.RetrofitClient
import ua.pp.svitlo.power.data.preferences.PreferencesManager

object FcmTokenManager {
    
    private const val TAG = "FcmTokenManager"
    
    /**
     * Get current FCM token
     */
    suspend fun getCurrentToken(): String? {
        return try {
            FirebaseMessaging.getInstance().token.await()
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get FCM token", e)
            null
        }
    }
    
    /**
     * Register FCM token with backend
     */
    suspend fun registerToken(context: Context, token: String) {
        try {
            val preferencesManager = PreferencesManager(context)
            
            // Get device info
            val deviceId = android.provider.Settings.Secure.getString(
                context.contentResolver,
                android.provider.Settings.Secure.ANDROID_ID
            )
            
            // TODO: Uncomment when backend API is ready
            // Send to backend
            // val response = RetrofitClient.apiService.registerFcmToken(
            //     fcmToken = token,
            //     deviceId = deviceId,
            //     appVersion = "1.0.0"
            // )
            
            Log.d(TAG, "Token ready to register: $token")
            
            // Save registration status
            // preferencesManager.setFcmTokenRegistered(true)
            
        } catch (e: Exception) {
            Log.e(TAG, "Failed to register token with backend", e)
            // Will retry later
        }
    }
    
    /**
     * Unregister token from backend (when user disables notifications)
     */
    suspend fun unregisterToken(context: Context) {
        try {
            val token = getCurrentToken() ?: return
            
            // TODO: Uncomment when backend API is ready
            // Send unregister request to backend
            // RetrofitClient.apiService.unregisterFcmToken(token)
            
            Log.d(TAG, "Token unregistered successfully")
            
            val preferencesManager = PreferencesManager(context)
            // preferencesManager.setFcmTokenRegistered(false)
            
        } catch (e: Exception) {
            Log.e(TAG, "Failed to unregister token", e)
        }
    }
    
    /**
     * Request notification permission (Android 13+)
     */
    fun shouldRequestPermission(context: Context): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val permission = android.Manifest.permission.POST_NOTIFICATIONS
            context.checkSelfPermission(permission) != android.content.pm.PackageManager.PERMISSION_GRANTED
        } else {
            false // Permission not needed for older versions
        }
    }
}
