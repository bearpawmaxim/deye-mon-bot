package ua.pp.svitlo.power

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.google.firebase.analytics.FirebaseAnalytics
import com.google.firebase.analytics.ktx.analytics
import com.google.firebase.analytics.logEvent
import com.google.firebase.ktx.Firebase
import kotlinx.coroutines.launch
import ua.pp.svitlo.power.data.api.RetrofitClient
import ua.pp.svitlo.power.data.preferences.PreferencesManager
import ua.pp.svitlo.power.fcm.FcmTokenManager
import ua.pp.svitlo.power.fcm.FcmTopicsManager
import ua.pp.svitlo.power.ui.components.UpdateDialog
import ua.pp.svitlo.power.ui.navigation.Screen
import ua.pp.svitlo.power.ui.screen.BuildingDetailScreen
import ua.pp.svitlo.power.ui.screen.OutagesScreen
import ua.pp.svitlo.power.ui.screen.PowerScreen
import ua.pp.svitlo.power.ui.screen.SettingsScreen
import ua.pp.svitlo.power.ui.theme.SvitloPowerTheme
import ua.pp.svitlo.power.update.UpdateManager

class MainActivity : ComponentActivity() {
    private lateinit var preferencesManager: PreferencesManager
    private var lastUpdateCheckTime = 0L
    private val updateCheckInterval = 6 * 60 * 60 * 1000L // 6 hours in milliseconds
    
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            Log.d("MainActivity", "Notification permission granted")
            initializeFcm()
        } else {
            Log.d("MainActivity", "Notification permission denied")
        }
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        preferencesManager = PreferencesManager(this)
        
        // Initialize base URL from Firebase
        initializeBaseUrl()
        
        // Request notification permission for Android 13+
        requestNotificationPermission()
        
        setContent {
            val systemInDarkTheme = isSystemInDarkTheme()
            val savedDarkMode by preferencesManager.darkModeFlow.collectAsState(initial = null)
            
            val darkMode = savedDarkMode ?: systemInDarkTheme
            
            SvitloPowerTheme(darkTheme = darkMode) {
                MainScreen(
                    darkMode = darkMode,
                    onDarkModeChange = { newValue ->
                        lifecycleScope.launch {
                            preferencesManager.setDarkMode(newValue)
                        }
                    }
                )
            }
        }
    }
    
    override fun onResume() {
        super.onResume()
        // Check for updates when app is resumed
        checkForUpdatesOnResume()
    }
    
    private fun checkForUpdatesOnResume() {
        val currentTime = System.currentTimeMillis()
        
        // Check only if enough time has passed since last check
        if (currentTime - lastUpdateCheckTime < updateCheckInterval) {
            Log.d("MainActivity", "Skipping update check, last check was ${(currentTime - lastUpdateCheckTime) / 1000 / 60} minutes ago")
            return
        }
        
        lifecycleScope.launch {
            try {
                Log.d("MainActivity", "Checking for updates on resume...")
                val updateInfo = UpdateManager.checkForUpdate()
                lastUpdateCheckTime = currentTime
                
                if (updateInfo.isUpdateAvailable) {
                    Log.i("MainActivity", "Update available on resume: ${updateInfo.currentVersion} -> ${updateInfo.latestVersion}")
                } else {
                    Log.d("MainActivity", "No updates available")
                }
            } catch (e: Exception) {
                Log.e("MainActivity", "Error checking for updates on resume", e)
            }
        }
    }
    
    private fun initializeBaseUrl() {
        lifecycleScope.launch {
            try {
                RetrofitClient.initializeBaseUrl()
                Log.d("MainActivity", "Base URL initialized from Firebase")
                
                // Check for app updates after base URL is initialized
                checkForUpdates()
            } catch (e: Exception) {
                Log.e("MainActivity", "Error initializing base URL", e)
            }
        }
    }
    
    private fun checkForUpdates() {
        lifecycleScope.launch {
            try {
                val updateInfo = UpdateManager.checkForUpdate()
                if (updateInfo.isUpdateAvailable) {
                    Log.i("MainActivity", "Update available: ${updateInfo.currentVersion} -> ${updateInfo.latestVersion}")
                    // Update dialog will be shown in MainScreen
                }
            } catch (e: Exception) {
                Log.e("MainActivity", "Error checking for updates", e)
            }
        }
    }
    
    private fun requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            when {
                ContextCompat.checkSelfPermission(
                    this,
                    Manifest.permission.POST_NOTIFICATIONS
                ) == PackageManager.PERMISSION_GRANTED -> {
                    // Permission already granted
                    initializeFcm()
                }
                else -> {
                    // Request permission
                    requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                }
            }
        } else {
            // No permission needed for older versions
            initializeFcm()
        }
    }
    
    private fun initializeFcm() {
        lifecycleScope.launch {
            try {
                val token = FcmTokenManager.getCurrentToken()
                if (token != null) {
                    Log.d("MainActivity", "FCM Token: $token")
                    FcmTokenManager.registerToken(this@MainActivity, token)
                    
                    // Subscribe to default topics
                    FcmTopicsManager.subscribeToDefaultTopics()
                } else {
                    Log.w("MainActivity", "Failed to get FCM token")
                }
            } catch (e: Exception) {
                Log.e("MainActivity", "Error initializing FCM", e)
            }
        }
    }
}

sealed class BottomNavItem(
    val route: String,
    val icon: ImageVector,
    val label: String
) {
    object Power : BottomNavItem(Screen.Power.route, Icons.Default.FlashOn, "Power")
    object Outages : BottomNavItem(Screen.Outages.route, Icons.Default.Schedule, "Outages")
    object Settings : BottomNavItem(Screen.Settings.route, Icons.Default.Settings, "Settings")
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun MainScreen(
    darkMode: Boolean,
    onDarkModeChange: (Boolean) -> Unit
) {
    val context = LocalContext.current
    val firebaseAnalytics = remember { Firebase.analytics }
    val navController = rememberNavController()
    val items = listOf(
        BottomNavItem.Outages,
        BottomNavItem.Power,
        BottomNavItem.Settings
    )
    
    // Track screen views
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    
    LaunchedEffect(currentRoute) {
        currentRoute?.let { route ->
            val screenName = when {
                route.startsWith(Screen.Power.route) -> "power_screen"
                route.startsWith(Screen.Outages.route) -> "outages_screen"
                route.startsWith(Screen.Settings.route) -> "settings_screen"
                route.startsWith("building_detail") -> "building_detail_screen"
                else -> route
            }
            
            firebaseAnalytics.logEvent(FirebaseAnalytics.Event.SCREEN_VIEW) {
                param(FirebaseAnalytics.Param.SCREEN_NAME, screenName)
                param(FirebaseAnalytics.Param.SCREEN_CLASS, "MainActivity")
            }
            
            Log.d("Analytics", "Screen view logged: $screenName")
        }
    }
    
    // Check for updates
    var updateInfo by remember { mutableStateOf<UpdateManager.UpdateInfo?>(null) }
    var showUpdateDialog by remember { mutableStateOf(false) }
    
    LaunchedEffect(Unit) {
        try {
            val info = UpdateManager.checkForUpdate()
            if (info.isUpdateAvailable) {
                updateInfo = info
                showUpdateDialog = true
            }
        } catch (e: Exception) {
            Log.e("MainScreen", "Error checking for updates", e)
        }
    }
    
    // Show update dialog
    if (showUpdateDialog && updateInfo != null) {
        UpdateDialog(
            currentVersion = updateInfo!!.currentVersion,
            latestVersion = updateInfo!!.latestVersion,
            updateUrl = updateInfo!!.updateUrl,
            onDismiss = { showUpdateDialog = false }
        )
    }
    
    // Show bottom bar only on main screens
    val showBottomBar = currentRoute in listOf(
        Screen.Power.route,
        Screen.Outages.route,
        Screen.Settings.route
    )
    
    // Pager state for swipe navigation
    val pagerState = rememberPagerState(
        initialPage = 0,
        pageCount = { items.size }
    )
    val coroutineScope = rememberCoroutineScope()
    
    // Synchronize pager with navigation clicks
    LaunchedEffect(currentRoute) {
        when (currentRoute) {
            Screen.Outages.route -> {
                if (pagerState.currentPage != 0) {
                    pagerState.animateScrollToPage(0)
                }
            }
            Screen.Power.route -> {
                if (pagerState.currentPage != 1) {
                    pagerState.animateScrollToPage(1)
                }
            }
            Screen.Settings.route -> {
                if (pagerState.currentPage != 2) {
                    pagerState.animateScrollToPage(2)
                }
            }
        }
    }
    
    // Synchronize navigation with pager swipes
    LaunchedEffect(pagerState.currentPage) {
        val targetRoute = items[pagerState.currentPage].route
        if (currentRoute != targetRoute) {
            navController.navigate(targetRoute) {
                popUpTo(navController.graph.findStartDestination().id) {
                    saveState = true
                }
                launchSingleTop = true
                restoreState = true
            }
        }
    }
    
    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar {
                    items.forEachIndexed { index, item ->
                        NavigationBarItem(
                            icon = { Icon(item.icon, contentDescription = item.label) },
                            label = { Text(item.label) },
                            selected = pagerState.currentPage == index,
                            onClick = {
                                coroutineScope.launch {
                                    pagerState.animateScrollToPage(index)
                                }
                            }
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        if (showBottomBar) {
            // Main screens with swipe navigation
            HorizontalPager(
                state = pagerState,
                modifier = Modifier.padding(innerPadding)
            ) { page ->
                when (page) {
                    0 -> OutagesScreen()
                    1 -> PowerScreen(
                        onBuildingClick = { buildingId, buildingName ->
                            navController.navigate(Screen.BuildingDetail.createRoute(buildingId, buildingName))
                        }
                    )
                    2 -> SettingsScreen(
                        darkMode = darkMode,
                        onDarkModeChange = onDarkModeChange
                    )
                }
            }
        } else {
            // Detail screens without pager
            NavHost(
                navController = navController,
                startDestination = Screen.Outages.route,
                modifier = Modifier.padding(innerPadding)
            ) {
                composable(Screen.Power.route) {
                    PowerScreen(
                        onBuildingClick = { buildingId, buildingName ->
                            navController.navigate(Screen.BuildingDetail.createRoute(buildingId, buildingName))
                        }
                    )
                }
                composable(Screen.Outages.route) {
                    OutagesScreen()
                }
                composable(Screen.Settings.route) {
                    SettingsScreen(
                        darkMode = darkMode,
                        onDarkModeChange = onDarkModeChange
                    )
                }
                composable(
                    route = Screen.BuildingDetail.route,
                    arguments = listOf(
                        navArgument("buildingId") { type = NavType.IntType },
                        navArgument("buildingName") { type = NavType.StringType }
                    )
                ) { backStackEntry ->
                    val buildingId = backStackEntry.arguments?.getInt("buildingId") ?: 0
                    val buildingName = backStackEntry.arguments?.getString("buildingName") ?: ""
                    BuildingDetailScreen(
                        buildingId = buildingId,
                        buildingName = buildingName,
                        onNavigateBack = { navController.popBackStack() }
                    )
                }
            }
        }
    }
}

