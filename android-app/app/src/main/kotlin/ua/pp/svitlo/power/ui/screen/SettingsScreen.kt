package ua.pp.svitlo.power.ui.screen

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.LifecycleStartEffect
import kotlinx.coroutines.launch
import ua.pp.svitlo.power.BuildConfig
import ua.pp.svitlo.power.data.preferences.PreferencesManager
import ua.pp.svitlo.power.fcm.FcmTopicsManager

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    darkMode: Boolean = false,
    onDarkModeChange: (Boolean) -> Unit = {}
) {
    val context = LocalContext.current
    val preferencesManager = remember { PreferencesManager(context) }
    val coroutineScope = rememberCoroutineScope()
    val systemInDarkTheme = isSystemInDarkTheme()
    val savedDarkMode by preferencesManager.darkModeFlow.collectAsState(initial = null)
    val autoRefreshInterval by preferencesManager.autoRefreshIntervalFlow.collectAsState(initial = 300)
    val notificationsEnabled by preferencesManager.notificationsEnabledFlow.collectAsState(initial = true)
    
    var showIntervalDialog by remember { mutableStateOf(false) }
    
    // Show of system tema shows
    val isUsingSystemTheme = savedDarkMode == null
    val themeDescription = if (isUsingSystemTheme) {
        "Following system theme (currently ${if (systemInDarkTheme) "dark" else "light"})"
    } else {
        "Custom theme selected"
    }
    
    val intervalText = when (autoRefreshInterval) {
        30 -> "30 seconds"
        60 -> "1 minute"
        180 -> "3 minutes"
        300 -> "5 minutes"
        600 -> "10 minutes"
        900 -> "15 minutes"
        else -> "Never"
    }
    
    val notificationsDescription = if (notificationsEnabled) {
        "You will receive alerts about power outages"
    } else {
        "Notifications are disabled"
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings") }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            item {
                Text(
                    text = "General",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(vertical = 8.dp)
                )
            }
            
            item {
                SettingsCard {
                    SettingSelector(
                        title = "Auto Refresh",
                        description = "Automatically refresh data: $intervalText",
                        onClick = { showIntervalDialog = true }
                    )
                }
            }
            
            item {
                SettingsCard {
                    SettingSwitch(
                        title = "Notifications",
                        description = notificationsDescription,
                        checked = notificationsEnabled,
                        onCheckedChange = { enabled ->
                            coroutineScope.launch {
                                preferencesManager.setNotificationsEnabled(enabled)
                                
                                // Управление подписками на топики
                                if (enabled) {
                                    // Подписаться на все топики
                                    FcmTopicsManager.subscribeToDefaultTopics()
                                } else {
                                    // Отписаться от всех топиков
                                    FcmTopicsManager.unsubscribeFromTopic(FcmTopicsManager.Topics.ALL_USERS)
                                    FcmTopicsManager.unsubscribeFromTopic(FcmTopicsManager.Topics.POWER_ALERTS)
                                    FcmTopicsManager.unsubscribeFromTopic(FcmTopicsManager.Topics.SCHEDULE_UPDATES)
                                    FcmTopicsManager.unsubscribeFromTopic(FcmTopicsManager.Topics.BATTERY_ALERTS)
                                }
                            }
                        }
                    )
                }
            }
            
            item {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Appearance",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(vertical = 8.dp)
                )
            }
            
            item {
                SettingsCard {
                    SettingSwitch(
                        title = "Dark Mode",
                        description = themeDescription,
                        checked = darkMode,
                        onCheckedChange = onDarkModeChange
                    )
                }
            }
            
            item {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "About",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(vertical = 8.dp)
                )
            }
            
            item {
                SettingsCard {
                    SettingItem(
                        icon = Icons.Default.Info,
                        title = "App Version",
                        description = "${BuildConfig.VERSION_NAME} (${BuildConfig.VERSION_CODE})"
                    )
                }
            }
            
            item {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Authors",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(vertical = 8.dp)
                )
            }
            
            item {
                SettingsCard {
                    AuthorItem(
                        name = "@bearpawmaxim",
                        telegramUrl = "https://t.me/bearpawmaxim"
                    )
                }
            }
            
            item {
                SettingsCard {
                    AuthorItem(
                        name = "@gizmoboss",
                        telegramUrl = "https://t.me/gizmoboss"
                    )
                }
            }
            
            item {
                Spacer(modifier = Modifier.height(16.dp))
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    )
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            Icons.Default.Info,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Svitlo Power Monitor",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Track power status and outage schedules",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                }
            }
        }
    }
    
    // Auto Refresh Interval Dialog
    if (showIntervalDialog) {
        AlertDialog(
            onDismissRequest = { showIntervalDialog = false },
            title = { Text("Auto Refresh Interval") },
            text = {
                Column {
                    val intervals = listOf(
                        -1 to "Never",
                        30 to "30 seconds",
                        60 to "1 minute",
                        180 to "3 minutes",
                        300 to "5 minutes",
                        600 to "10 minutes",
                        900 to "15 minutes"
                    )
                    
                    intervals.forEach { (seconds, label) ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    coroutineScope.launch {
                                        preferencesManager.setAutoRefreshInterval(seconds)
                                        showIntervalDialog = false
                                    }
                                }
                                .padding(vertical = 12.dp, horizontal = 8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(
                                selected = autoRefreshInterval == seconds,
                                onClick = {
                                    coroutineScope.launch {
                                        preferencesManager.setAutoRefreshInterval(seconds)
                                        showIntervalDialog = false
                                    }
                                }
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = label,
                                style = MaterialTheme.typography.bodyLarge
                            )
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showIntervalDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
fun SettingsCard(content: @Composable () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        content()
    }
}

@Composable
fun SettingSwitch(
    title: String,
    description: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    enabled: Boolean = true
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Medium,
                color = if (enabled) MaterialTheme.colorScheme.onSurface 
                       else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f)
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = description,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(
                    alpha = if (enabled) 1f else 0.38f
                )
            )
        }
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            enabled = enabled
        )
    }
}

@Composable
fun SettingItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    description: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            icon,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.width(16.dp))
        Column {
            Text(
                text = title,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Medium
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = description,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun AuthorItem(
    name: String,
    telegramUrl: String
) {
    val context = LocalContext.current
    
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(telegramUrl))
                context.startActivity(intent)
            }
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            Icons.Default.Person,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(24.dp)
        )
        Spacer(modifier = Modifier.width(16.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = name,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Medium
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Tap to open Telegram",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        Icon(
            Icons.AutoMirrored.Filled.ArrowForward,
            contentDescription = "Open",
            tint = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.size(20.dp)
        )
    }
}

@Composable
fun SettingSelector(
    title: String,
    description: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Medium
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = description,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        Icon(
            Icons.Default.ArrowDropDown,
            contentDescription = "Select",
            tint = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

