package ua.pp.svitlo.power.ui.screen

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.repeatOnLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import ua.pp.svitlo.power.data.model.Building
import ua.pp.svitlo.power.data.model.PowerStatus
import ua.pp.svitlo.power.ui.components.ErrorContent
import ua.pp.svitlo.power.ui.theme.PowerGreen
import ua.pp.svitlo.power.ui.theme.PowerRed
import ua.pp.svitlo.power.ui.theme.PowerYellow
import ua.pp.svitlo.power.ui.theme.PowerOrange
import ua.pp.svitlo.power.ui.viewmodel.PowerViewModel
import ua.pp.svitlo.power.ui.viewmodel.UiState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PowerScreen(
    onBuildingClick: (String, String) -> Unit,
    viewModel: PowerViewModel = viewModel()
) {
    val buildingsState by viewModel.buildingsState.collectAsState()
    val configState by viewModel.configState.collectAsState()
    val lifecycleOwner = LocalLifecycleOwner.current
    
    // Refresh data when screen becomes visible (app returns from background)
    LaunchedEffect(lifecycleOwner) {
        lifecycleOwner.lifecycle.repeatOnLifecycle(Lifecycle.State.RESUMED) {
            viewModel.loadBuildings(silent = true) // Silent refresh in background
        }
    }
    
    val appTitle = when (val state = configState) {
        //is UiState.Success -> state.data.title
        is UiState.Success -> "Power Grid"
        else -> "Power Grid"
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(appTitle) },
                actions = {
                    IconButton(onClick = { viewModel.loadBuildings() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                }
            )
        }
    ) { padding ->
        when (val state = buildingsState) {
            is UiState.Loading -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            is UiState.Success -> {
                BuildingsList(
                    buildings = state.data,
                    onBuildingClick = onBuildingClick,
                    modifier = Modifier.padding(padding)
                )
            }
            is UiState.Error -> {
                ErrorContent(
                    message = state.message,
                    onRetry = { viewModel.loadBuildings() },
                    modifier = Modifier.padding(padding)
                )
            }
        }
    }
}

@Composable
fun BuildingsList(
    buildings: List<Building>,
    onBuildingClick: (String, String) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(buildings) { building ->
            BuildingCard(
                building = building,
                onClick = { onBuildingClick(building.id, building.name) }
            )
        }
    }
}

@Composable
fun BuildingCard(
    building: Building,
    onClick: () -> Unit
) {
    val hasMixedStates = building.hasMixedReporterStates == true
    val isGridOff = building.isGridAvailable == false
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        colors = CardDefaults.cardColors(
            containerColor = when {
                isGridOff -> PowerRed.copy(alpha = 0.1f)
                hasMixedStates -> PowerOrange.copy(alpha = 0.1f)
                else -> MaterialTheme.colorScheme.surface
            }
        ),
        onClick = onClick
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp)
        ) {
            // Header with name and status
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    modifier = Modifier.weight(1f),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Apartment,
                        contentDescription = "Building",
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(24.dp)
                    )
                    Text(
                        text = building.name,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
                PowerStatusBadge(building.getPowerStatus())
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Battery Section - компактная версия
            BatteryIndicatorCompact(
                batteryLevel = building.getBatteryLevel(),
                dischargeTime = building.getDischargeTimeFormatted()
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Stats Row - компактная версия
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Consumption
                CompactStatItem(
                    icon = Icons.Default.Bolt,
                    label = "Consumption",
                    value = building.getConsumption(),
                    iconTint = PowerYellow
                )
                
                // Grid Status
                if (building.isGridAvailable != null) {
                    val hasMixedStates = building.hasMixedReporterStates == true
                    val (icon, label, iconTint) = when {
                        hasMixedStates -> Triple(
                            Icons.Default.PowerInput,
                            "Partially Available",
                            PowerOrange
                        )
                        building.isGridAvailable == true -> Triple(
                            Icons.Default.PowerInput,
                            "Available",
                            PowerGreen
                        )
                        else -> Triple(
                            Icons.Default.PowerOff,
                            "Unavailable",
                            PowerRed
                        )
                    }
                    
                    CompactStatItem(
                        icon = icon,
                        label = "Apartment grid",
                        value = label,
                        iconTint = iconTint
                    )
                }
            }
        }
    }
}

@Composable
fun BatteryIndicatorCompact(
    batteryLevel: Int,
    dischargeTime: String?
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Icon(
                    imageVector = when {
                        batteryLevel >= 80 -> Icons.Default.BatteryFull
                        batteryLevel >= 20 -> Icons.Default.BatteryStd
                        else -> Icons.Default.BatteryAlert
                    },
                    contentDescription = "Battery",
                    tint = when {
                        batteryLevel >= 50 -> PowerGreen
                        batteryLevel >= 20 -> PowerYellow
                        else -> PowerRed
                    },
                    modifier = Modifier.size(20.dp)
                )
                
                Text(
                    text = "$batteryLevel%",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold
                )
                
                // Discharge time if available
                if (dischargeTime != null) {
                    Text(
                        text = "⏱ $dischargeTime",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
        
        Spacer(modifier = Modifier.height(6.dp))
        
        // Battery progress bar
        LinearProgressIndicator(
            progress = batteryLevel / 100f,
            modifier = Modifier
                .fillMaxWidth()
                .height(8.dp)
                .background(
                    color = MaterialTheme.colorScheme.surfaceVariant,
                    shape = MaterialTheme.shapes.small
                ),
            color = when {
                batteryLevel >= 50 -> PowerGreen
                batteryLevel >= 20 -> PowerYellow
                else -> PowerRed
            },
            trackColor = MaterialTheme.colorScheme.surfaceVariant
        )
    }
}

@Composable
fun CompactStatItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    value: String,
    iconTint: Color
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            tint = iconTint,
            modifier = Modifier.size(18.dp)
        )
        Column {
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
                text = value,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
fun CompactStatusChip(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    text: String,
    color: Color
) {
    Surface(
        color = color.copy(alpha = 0.15f),
        shape = MaterialTheme.shapes.small,
        border = androidx.compose.foundation.BorderStroke(1.dp, color)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = text,
                tint = color,
                modifier = Modifier.size(14.dp)
            )
            Text(
                text = text,
                style = MaterialTheme.typography.labelSmall,
                fontWeight = FontWeight.Bold,
                color = color
            )
        }
    }
}

@Composable
fun PowerStatusBadge(status: PowerStatus) {
    val (text, color, icon) = when (status) {
        PowerStatus.CHARGING -> Triple("Charging", PowerGreen, Icons.Default.BatteryChargingFull)
        PowerStatus.DISCHARGING -> Triple("Discharging", PowerYellow, Icons.Default.BatteryAlert)
        PowerStatus.GRID_AVAILABLE -> Triple("Grid", PowerGreen, Icons.Default.Power)
        PowerStatus.IDLE -> Triple("Idle", MaterialTheme.colorScheme.outline, Icons.Default.PowerOff)
    }
    
    Surface(
        color = color.copy(alpha = 0.15f),
        shape = MaterialTheme.shapes.small,
        border = androidx.compose.foundation.BorderStroke(1.5.dp, color)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = text,
                tint = color,
                modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = text,
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.Bold,
                color = color
            )
        }
    }
}


