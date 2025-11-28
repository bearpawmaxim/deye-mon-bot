package ua.pp.svitlo.power.fcm

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import ua.pp.svitlo.power.MainActivity
import ua.pp.svitlo.power.R

class MyFirebaseMessagingService : FirebaseMessagingService() {
    
    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    
    companion object {
        private const val TAG = "FCM_Service"
        private const val CHANNEL_ID = "svitlo_power_notifications"
        private const val CHANNEL_NAME = "Power Notifications"
    }
    
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "New FCM Token: $token")
        
        // Save token locally and send to backend
        serviceScope.launch {
            FcmTokenManager.registerToken(applicationContext, token)
        }
    }
    
    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)
        
        Log.d(TAG, "Message received from: ${message.from}")
        
        // Проверяем настройки уведомлений
        serviceScope.launch {
            val preferencesManager = ua.pp.svitlo.power.data.preferences.PreferencesManager(applicationContext)
            val notificationsEnabled = preferencesManager.notificationsEnabledFlow.first()
            
            if (!notificationsEnabled) {
                Log.d(TAG, "Notifications are disabled by user, skipping")
                return@launch
            }
            
            // Check if message contains notification
            message.notification?.let { notification ->
                val title = notification.title ?: "Svitlo Power"
                val body = notification.body ?: ""
                
                showNotification(title, body, message.data)
            }
            
            // Check if message contains data payload
            if (message.data.isNotEmpty()) {
                Log.d(TAG, "Message data: ${message.data}")
                handleDataPayload(message.data)
            }
        }
    }
    
    private fun showNotification(title: String, body: String, data: Map<String, String>) {
        createNotificationChannel()
        
        // Выбираем иконку в зависимости от типа уведомления
        val icon = when (data["type"]) {
            "power_outage", "power_restored" -> R.drawable.ic_notification_power
            "battery_low" -> R.drawable.ic_notification_battery
            "schedule_updated" -> R.drawable.ic_notification_schedule
            else -> R.drawable.ic_notification
        }
        
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            
            // Add data to intent if needed
            data["buildingId"]?.let { putExtra("buildingId", it.toIntOrNull()) }
            data["type"]?.let { putExtra("notificationType", it) }
        }
        
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        
        val notificationBuilder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(icon)
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
        
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(System.currentTimeMillis().toInt(), notificationBuilder.build())
    }
    
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications about power status and outages"
                enableLights(true)
                enableVibration(true)
            }
            
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
    
    private fun handleDataPayload(data: Map<String, String>) {
        // Handle different notification types
        when (data["type"]) {
            "power_outage" -> {
                Log.d(TAG, "Power outage notification for building: ${data["buildingId"]}")
            }
            "power_restored" -> {
                Log.d(TAG, "Power restored for building: ${data["buildingId"]}")
            }
            "battery_low" -> {
                Log.d(TAG, "Battery low in building: ${data["buildingId"]}")
            }
            "schedule_updated" -> {
                Log.d(TAG, "Outage schedule updated")
            }
        }
    }
}
