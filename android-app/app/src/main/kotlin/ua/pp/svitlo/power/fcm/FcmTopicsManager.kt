package ua.pp.svitlo.power.fcm

import android.util.Log
import com.google.firebase.messaging.FirebaseMessaging

/**
 * Helper object for managing FCM topics (themes) subscriptions
 */
object FcmTopicsManager {
    
    private const val TAG = "FcmTopicsManager"
    
    // Available topics
    object Topics {
        const val ALL_USERS = "all_users"
        const val POWER_ALERTS = "power_alerts"
        const val SCHEDULE_UPDATES = "schedule_updates"
        const val BATTERY_ALERTS = "battery_alerts"
        
        // Region-specific topics (можно добавить по регионам)
        fun forRegion(regionId: String) = "region_$regionId"
        
        // Building-specific topics
        fun forBuilding(buildingId: Int) = "building_$buildingId"
    }
    
    /**
     * Subscribe to a topic
     */
    fun subscribeToTopic(topic: String, onComplete: ((Boolean) -> Unit)? = null) {
        FirebaseMessaging.getInstance().subscribeToTopic(topic)
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    Log.d(TAG, "Successfully subscribed to topic: $topic")
                    onComplete?.invoke(true)
                } else {
                    Log.e(TAG, "Failed to subscribe to topic: $topic", task.exception)
                    onComplete?.invoke(false)
                }
            }
    }
    
    /**
     * Unsubscribe from a topic
     */
    fun unsubscribeFromTopic(topic: String, onComplete: ((Boolean) -> Unit)? = null) {
        FirebaseMessaging.getInstance().unsubscribeFromTopic(topic)
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    Log.d(TAG, "Successfully unsubscribed from topic: $topic")
                    onComplete?.invoke(true)
                } else {
                    Log.e(TAG, "Failed to unsubscribe from topic: $topic", task.exception)
                    onComplete?.invoke(false)
                }
            }
    }
    
    /**
     * Subscribe to all default topics
     */
    fun subscribeToDefaultTopics() {
        subscribeToTopic(Topics.ALL_USERS)
        subscribeToTopic(Topics.POWER_ALERTS)
        subscribeToTopic(Topics.SCHEDULE_UPDATES)
        subscribeToTopic(Topics.BATTERY_ALERTS)
    }
    
    /**
     * Subscribe to notifications for specific building
     */
    fun subscribeToBuilding(buildingId: Int) {
        subscribeToTopic(Topics.forBuilding(buildingId))
    }
    
    /**
     * Unsubscribe from notifications for specific building
     */
    fun unsubscribeFromBuilding(buildingId: Int) {
        unsubscribeFromTopic(Topics.forBuilding(buildingId))
    }
    
    /**
     * Subscribe to notifications for specific region
     */
    fun subscribeToRegion(regionId: String) {
        subscribeToTopic(Topics.forRegion(regionId))
    }
    
    /**
     * Unsubscribe from notifications for specific region
     */
    fun unsubscribeFromRegion(regionId: String) {
        unsubscribeFromTopic(Topics.forRegion(regionId))
    }
}

