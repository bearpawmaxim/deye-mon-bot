package ua.pp.svitlo.power

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.lifecycleScope
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import kotlinx.coroutines.launch
import ua.pp.svitlo.power.data.preferences.PreferencesManager
import ua.pp.svitlo.power.ui.navigation.Screen
import ua.pp.svitlo.power.ui.screen.BuildingDetailScreen
import ua.pp.svitlo.power.ui.screen.OutagesScreen
import ua.pp.svitlo.power.ui.screen.PowerScreen
import ua.pp.svitlo.power.ui.screen.SettingsScreen
import ua.pp.svitlo.power.ui.theme.SvitloPowerTheme

class MainActivity : ComponentActivity() {
    private lateinit var preferencesManager: PreferencesManager
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        preferencesManager = PreferencesManager(this)
        
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
}

sealed class BottomNavItem(
    val route: String,
    val icon: ImageVector,
    val label: String
) {
    object Power : BottomNavItem(Screen.Power.route, Icons.Default.Home, "Power")
    object Outages : BottomNavItem(Screen.Outages.route, Icons.Default.Schedule, "Outages")
    object Settings : BottomNavItem(Screen.Settings.route, Icons.Default.Settings, "Settings")
}

@Composable
fun MainScreen(
    darkMode: Boolean,
    onDarkModeChange: (Boolean) -> Unit
) {
    val navController = rememberNavController()
    val items = listOf(
        BottomNavItem.Outages,
        BottomNavItem.Power,
        BottomNavItem.Settings
    )
    
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    
    // Show bottom bar only on main screens
    val showBottomBar = currentRoute in listOf(
        Screen.Power.route,
        Screen.Outages.route,
        Screen.Settings.route
    )
    
    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar {
                    val currentDestination = navBackStackEntry?.destination
                    
                    items.forEach { item ->
                        NavigationBarItem(
                            icon = { Icon(item.icon, contentDescription = item.label) },
                            label = { Text(item.label) },
                            selected = currentDestination?.hierarchy?.any { it.route == item.route } == true,
                            onClick = {
                                navController.navigate(item.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
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

