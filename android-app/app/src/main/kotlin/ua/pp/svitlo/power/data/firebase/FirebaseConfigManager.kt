package ua.pp.svitlo.power.data.firebase

import android.util.Log
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine

object FirebaseConfigManager {
    private const val TAG = "FirebaseConfigManager"
    private const val COLLECTION_SITES = "sites"
    private const val DOCUMENT_APP = "app"
    private const val FIELD_BASE_URLS = "baseUrl"
    private const val FIELD_VERSION = "ver"
    private const val FIELD_UPDATE_URL = "updateUrl"
    private const val FIELD_YASNO_QUEUE = "yasno"
    
    const val DEFAULT_QUEUE = "25.1"
    
    private val DEFAULT_BASE_URLS = listOf(
        "https://svitlo-power.pp.ua/api",
        "https://backup.svitlo-power.pp.ua/api"
    )
    
    private val firestore: FirebaseFirestore by lazy {
        FirebaseFirestore.getInstance()
    }
    
    data class AppConfig(
        val baseUrls: List<String>,
        val version: String,
        val updateUrl: String,
        val yasnoQueue: String
    )
    

    suspend fun getAppConfig(): AppConfig {
        return try {
            val document = firestore.collection(COLLECTION_SITES)
                .document(DOCUMENT_APP)
                .get()
                .await()
            
            if (document.exists()) {
                val baseUrls = document.get(FIELD_BASE_URLS) as? List<*>
                val urlsList = baseUrls?.mapNotNull { it as? String } ?: DEFAULT_BASE_URLS
                
                val version = document.getString(FIELD_VERSION) ?: "1.0.0"
                val updateUrl = document.getString(FIELD_UPDATE_URL) ?: ""
                val yasnoRaw = document.get(FIELD_YASNO_QUEUE)
                val yasnoQueue = when (yasnoRaw) {
                    is String -> yasnoRaw
                    is Number -> yasnoRaw.toString()
                    else -> DEFAULT_QUEUE
                }
                
                Log.d(TAG, "Loaded config from Firebase: baseUrls=$urlsList, version=$version, yasno=$yasnoQueue")
                
                AppConfig(
                    baseUrls = urlsList,
                    version = version,
                    updateUrl = updateUrl,
                    yasnoQueue = yasnoQueue
                )
            } else {
                Log.w(TAG, "Document does not exist, using defaults")
                AppConfig(
                    baseUrls = DEFAULT_BASE_URLS,
                    version = "1.0.0",
                    updateUrl = "",
                    yasnoQueue = DEFAULT_QUEUE
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error loading config from Firebase", e)
            AppConfig(
                baseUrls = DEFAULT_BASE_URLS,
                version = "1.0.0",
                updateUrl = "",
                yasnoQueue = DEFAULT_QUEUE
            )
        }
    }
    

    suspend fun getBaseUrls(): List<String> {
        return getAppConfig().baseUrls
    }
    

    suspend fun getPrimaryBaseUrl(): String {
        val urls = getBaseUrls()
        return urls.firstOrNull() ?: DEFAULT_BASE_URLS.first()
    }
    
    suspend fun getYasnoQueue(): String {
        return getAppConfig().yasnoQueue
    }
}

