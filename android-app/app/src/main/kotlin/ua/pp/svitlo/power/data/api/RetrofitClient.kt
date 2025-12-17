package ua.pp.svitlo.power.data.api

import android.util.Log
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Response
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import ua.pp.svitlo.power.data.firebase.FirebaseConfigManager
import java.io.IOException
import java.util.concurrent.TimeUnit

object RetrofitClient {
    private const val TAG = "RetrofitClient"
    private const val DEFAULT_BASE_URL = "https://svitlo-power.pp.ua/api/"
    
    @Volatile
    private var currentBaseUrl: String? = null
    
    @Volatile
    private var availableBaseUrls: List<String> = emptyList()
    
    @Volatile
    private var isInitialized = false
    
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BASIC
    }
    

    private val failoverInterceptor = object : Interceptor {
        override fun intercept(chain: Interceptor.Chain): Response {
            val originalRequest = chain.request()
            var lastException: IOException? = null
            
            val baseUrl = currentBaseUrl ?: DEFAULT_BASE_URL
            
            // Try with current URL
            try {
                val response = chain.proceed(originalRequest)
                if (response.isSuccessful) {
                    return response
                }
                // Close unsuccessful response
                response.close()
            } catch (e: IOException) {
                Log.w(TAG, "Request failed with current URL: $baseUrl", e)
                lastException = e
            }
            
            // Try backup URLs
            val backupUrls = availableBaseUrls.filter { url ->
                ensureTrailingSlash(url) != baseUrl
            }
            
            for (backupUrl in backupUrls) {
                try {
                    val newUrl = originalRequest.url.toString().replace(baseUrl, ensureTrailingSlash(backupUrl))
                    val newRequest = originalRequest.newBuilder().url(newUrl).build()
                    
                    val response = chain.proceed(newRequest)
                    
                    if (response.isSuccessful) {
                        Log.i(TAG, "Successfully switched to backup URL: $backupUrl")
                        currentBaseUrl = ensureTrailingSlash(backupUrl)
                        return response
                    }
                    // Close unsuccessful response
                    response.close()
                } catch (e: IOException) {
                    Log.w(TAG, "Request failed with backup URL: $backupUrl", e)
                    lastException = e
                }
            }
            
            // All attempts failed
            throw (lastException ?: IOException("All URLs failed"))
        }
    }
    
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(failoverInterceptor)
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()
    
    @Volatile
    private var retrofit: Retrofit? = null
    
    @Volatile
    private var _apiService: ApiService? = null
    
    val apiService: ApiService
        get() {
            if (!isInitialized) {
                Log.w(TAG, "ApiService accessed before initialization, initializing synchronously...")
                initializeBaseUrlSync()
            }
            return _apiService ?: throw IllegalStateException("ApiService not initialized")
        }
    
   
    suspend fun initializeBaseUrl() {
        if (isInitialized) {
            Log.d(TAG, "Already initialized, skipping")
            return
        }


        // 🔧 TEST SOLUTION
        //currentBaseUrl = "http://localhost:5050/api/"
        //availableBaseUrls = listOf("http://localhost:5050/api/")
        //createRetrofitWithCurrentUrl()
        //isInitialized = true
        //return
        
        try {
            Log.d(TAG, "Loading configuration from Firebase...")
            val config = FirebaseConfigManager.getAppConfig()
            
            // URL in Firebase with /api
            availableBaseUrls = config.baseUrls.map { ensureTrailingSlash(it) }
            
            if (availableBaseUrls.isNotEmpty()) {
                currentBaseUrl = availableBaseUrls.first()
                Log.i(TAG, "✅ Initialized base URL from Firebase: $currentBaseUrl")
                Log.i(TAG, "Available backup URLs: ${availableBaseUrls.drop(1)}")
                createRetrofitWithCurrentUrl()
                isInitialized = true
            } else {
                Log.w(TAG, "⚠️ No base URLs received from Firebase, using default: $DEFAULT_BASE_URL")
                currentBaseUrl = DEFAULT_BASE_URL
                createRetrofitWithCurrentUrl()
                isInitialized = true
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Failed to initialize base URL from Firebase, using default: $DEFAULT_BASE_URL", e)
            currentBaseUrl = DEFAULT_BASE_URL
            createRetrofitWithCurrentUrl()
            isInitialized = true
        }
    }
    
    private fun createRetrofit(baseUrl: String): Retrofit {
        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    
    private fun createRetrofitWithCurrentUrl() {
        val url = currentBaseUrl ?: DEFAULT_BASE_URL
        retrofit = createRetrofit(url)
        _apiService = retrofit?.create(ApiService::class.java)
    }
    
    private fun ensureTrailingSlash(url: String): String {
        return if (url.endsWith("/")) url else "$url/"
    }
    

    fun initializeBaseUrlSync() {
        runBlocking {
            initializeBaseUrl()
        }
    }
}
