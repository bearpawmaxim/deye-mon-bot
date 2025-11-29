package ua.pp.svitlo.power.update

import android.app.DownloadManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.util.Log
import ua.pp.svitlo.power.BuildConfig
import ua.pp.svitlo.power.data.firebase.FirebaseConfigManager

object UpdateManager {
    private const val TAG = "UpdateManager"
    
    data class UpdateInfo(
        val currentVersion: String,
        val latestVersion: String,
        val updateUrl: String,
        val isUpdateAvailable: Boolean
    )
    
    /**
     * Checks for available updates
     */
    suspend fun checkForUpdate(): UpdateInfo {
        val currentVersion = BuildConfig.VERSION_NAME
        val config = FirebaseConfigManager.getAppConfig()
        
        val latestVersion = config.version
        val updateUrl = config.updateUrl
        
        val isUpdateAvailable = isNewerVersion(currentVersion, latestVersion)
        
        Log.d(TAG, "Current version: $currentVersion, Latest version: $latestVersion")
        if (isUpdateAvailable) {
            Log.i(TAG, "Update available! $currentVersion -> $latestVersion")
        } else {
            Log.d(TAG, "App is up to date")
        }
        
        return UpdateInfo(
            currentVersion = currentVersion,
            latestVersion = latestVersion,
            updateUrl = updateUrl,
            isUpdateAvailable = isUpdateAvailable
        )
    }
    
    /**
     * Compares versions in X.Y.Z format
     * @return true if newVersion is newer than currentVersion
     */
    private fun isNewerVersion(currentVersion: String, newVersion: String): Boolean {
        if (currentVersion == newVersion) return false
        
        try {
            val current = parseVersion(currentVersion)
            val new = parseVersion(newVersion)
            
            // Compare major.minor.patch
            return when {
                new[0] > current[0] -> true  // Major version
                new[0] < current[0] -> false
                new[1] > current[1] -> true  // Minor version
                new[1] < current[1] -> false
                new[2] > current[2] -> true  // Patch version
                else -> false
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error comparing versions", e)
            return false
        }
    }
    
    /**
     * Parses version in X.Y.Z format into a list of numbers
     */
    private fun parseVersion(version: String): List<Int> {
        return version.split(".")
            .take(3)
            .map { it.toIntOrNull() ?: 0 }
            .plus(listOf(0, 0, 0))
            .take(3)
    }
    
    /**
     * Downloads and installs APK
     */
    fun downloadAndInstallUpdate(context: Context, updateUrl: String) {
        // Use application context to prevent activity destruction issues
        val appContext = context.applicationContext
        
        try {
            Log.i(TAG, "Starting download from: $updateUrl")
            
            val request = DownloadManager.Request(Uri.parse(updateUrl)).apply {
                setTitle("Svitlo Power Update")
                setDescription("Downloading new version...")
                setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                setDestinationInExternalPublicDir(
                    Environment.DIRECTORY_DOWNLOADS,
                    "svitlopower_update.apk"
                )
                setMimeType("application/vnd.android.package-archive")
                
                // Allow download over any network (WiFi or Mobile)
                setAllowedNetworkTypes(
                    DownloadManager.Request.NETWORK_WIFI or DownloadManager.Request.NETWORK_MOBILE
                )
                setAllowedOverMetered(true)  // Allow on metered connections
                setAllowedOverRoaming(true)   // Allow on roaming
            }
            
            val downloadManager = appContext.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            val downloadId = downloadManager.enqueue(request)
            
            Log.i(TAG, "Download enqueued with ID: $downloadId")
            
            // Register receiver to track download completion
            val onComplete = object : BroadcastReceiver() {
                override fun onReceive(receiverContext: Context, intent: Intent) {
                    Log.d(TAG, "BroadcastReceiver triggered")
                    val id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1)
                    Log.d(TAG, "Received download ID: $id, Expected: $downloadId")
                    
                    if (id == downloadId) {
                        Log.i(TAG, "Download completed for our request")
                        installApk(appContext, downloadId, downloadManager)
                        try {
                            appContext.unregisterReceiver(this)
                            Log.d(TAG, "Receiver unregistered")
                        } catch (e: Exception) {
                            Log.w(TAG, "Failed to unregister receiver", e)
                        }
                    }
                }
            }
            
            val filter = IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE)
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                appContext.registerReceiver(onComplete, filter, Context.RECEIVER_NOT_EXPORTED)
            } else {
                appContext.registerReceiver(onComplete, filter)
            }
            
            Log.i(TAG, "BroadcastReceiver registered successfully on application context")
            
            // Fallback: Check download status periodically
            startDownloadStatusChecker(appContext, downloadId, downloadManager)
            
        } catch (e: Exception) {
            Log.e(TAG, "Error downloading update", e)
        }
    }
    
    /**
     * Periodically checks download status as fallback if BroadcastReceiver doesn't work
     */
    private fun startDownloadStatusChecker(context: Context, downloadId: Long, downloadManager: DownloadManager) {
        val handler = Handler(Looper.getMainLooper())
        val checkInterval = 2000L // Check every 2 seconds
        var checkCount = 0
        val maxChecks = 60 // Max 2 minutes
        
        val checker = object : Runnable {
            override fun run() {
                checkCount++
                Log.d(TAG, "Checking download status... (attempt $checkCount/$maxChecks)")
                
                try {
                    val query = DownloadManager.Query().setFilterById(downloadId)
                    val cursor = downloadManager.query(query)
                    
                    Log.d(TAG, "Cursor count: ${cursor.count}")
                    
                    if (cursor.moveToFirst()) {
                        val statusIndex = cursor.getColumnIndex(DownloadManager.COLUMN_STATUS)
                        val status = if (statusIndex >= 0) cursor.getInt(statusIndex) else -1
                        
                        Log.d(TAG, "Download status code: $status")
                        Log.d(TAG, "STATUS_PENDING=${ DownloadManager.STATUS_PENDING}, STATUS_RUNNING=${DownloadManager.STATUS_RUNNING}, STATUS_SUCCESSFUL=${DownloadManager.STATUS_SUCCESSFUL}, STATUS_FAILED=${DownloadManager.STATUS_FAILED}")
                        
                        when (status) {
                            DownloadManager.STATUS_SUCCESSFUL -> {
                                Log.i(TAG, "Download completed (detected by status checker)")
                                cursor.close()
                                installApk(context, downloadId, downloadManager)
                                return // Stop checking
                            }
                            DownloadManager.STATUS_FAILED -> {
                                val reasonIndex = cursor.getColumnIndex(DownloadManager.COLUMN_REASON)
                                val reason = if (reasonIndex >= 0) cursor.getInt(reasonIndex) else -1
                                Log.e(TAG, "Download failed with reason: $reason")
                                cursor.close()
                                return // Stop checking
                            }
                            DownloadManager.STATUS_RUNNING -> {
                                Log.d(TAG, "Download status: RUNNING")
                            }
                            DownloadManager.STATUS_PENDING -> {
                                Log.d(TAG, "Download status: PENDING")
                            }
                            DownloadManager.STATUS_PAUSED -> {
                                val reasonIndex = cursor.getColumnIndex(DownloadManager.COLUMN_REASON)
                                val reason = if (reasonIndex >= 0) cursor.getInt(reasonIndex) else -1
                                Log.d(TAG, "Download status: PAUSED, reason code: $reason")
                                when (reason) {
                                    DownloadManager.PAUSED_QUEUED_FOR_WIFI -> Log.d(TAG, "Reason: Queued for WiFi")
                                    DownloadManager.PAUSED_WAITING_FOR_NETWORK -> Log.d(TAG, "Reason: Waiting for network")
                                    DownloadManager.PAUSED_WAITING_TO_RETRY -> Log.d(TAG, "Reason: Waiting to retry")
                                    else -> Log.d(TAG, "Reason: Unknown ($reason)")
                                }
                            }
                            else -> {
                                Log.w(TAG, "Unknown download status: $status")
                            }
                        }
                    } else {
                        Log.w(TAG, "Cursor is empty - download not found")
                    }
                    cursor.close()
                    
                    // Continue checking if not finished and not exceeded max checks
                    if (checkCount < maxChecks) {
                        handler.postDelayed(this, checkInterval)
                    } else {
                        Log.w(TAG, "Max check attempts reached, stopping status checker")
                    }
                    
                } catch (e: Exception) {
                    Log.e(TAG, "Error checking download status", e)
                }
            }
        }
        
        handler.postDelayed(checker, checkInterval)
        Log.i(TAG, "Started download status checker as fallback")
    }
    
    /**
     * Installs downloaded APK
     */
    private fun installApk(context: Context, downloadId: Long, downloadManager: DownloadManager) {
        try {
            Log.d(TAG, "installApk() called with downloadId: $downloadId")
            
            val query = DownloadManager.Query().setFilterById(downloadId)
            val cursor = downloadManager.query(query)
            
            Log.d(TAG, "Cursor count: ${cursor.count}")
            
            if (cursor.moveToFirst()) {
                val columnIndex = cursor.getColumnIndex(DownloadManager.COLUMN_STATUS)
                val status = if (columnIndex >= 0) cursor.getInt(columnIndex) else -1
                
                Log.d(TAG, "Download status: $status (SUCCESS=${DownloadManager.STATUS_SUCCESSFUL})")
                
                if (columnIndex >= 0 && status == DownloadManager.STATUS_SUCCESSFUL) {
                    // Get content URI from DownloadManager
                    val contentUri = downloadManager.getUriForDownloadedFile(downloadId)
                    
                    if (contentUri != null) {
                        Log.i(TAG, "APK downloaded, URI: $contentUri")
                        installApkFromUri(context, contentUri)
                    } else {
                        Log.e(TAG, "Failed to get URI for downloaded file")
                    }
                } else {
                    Log.e(TAG, "Download not successful. Status: $status")
                }
            } else {
                Log.e(TAG, "Cursor is empty, no download found")
            }
            cursor.close()
        } catch (e: Exception) {
            Log.e(TAG, "Error installing APK", e)
        }
    }
    
    /**
     * Launches APK installation
     */
    private fun installApkFromUri(context: Context, contentUri: Uri) {
        try {
            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(contentUri, "application/vnd.android.package-archive")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            
            context.startActivity(intent)
            Log.i(TAG, "Installation intent launched")
        } catch (e: Exception) {
            Log.e(TAG, "Error launching installation", e)
        }
    }
}

