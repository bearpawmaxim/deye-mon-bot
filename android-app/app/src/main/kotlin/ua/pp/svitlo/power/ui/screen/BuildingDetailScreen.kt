package ua.pp.svitlo.power.ui.screen

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Cancel
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.repeatOnLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import ua.pp.svitlo.power.data.model.PowerPeriod
import ua.pp.svitlo.power.ui.components.ErrorContent
import ua.pp.svitlo.power.ui.theme.PowerGreen
import ua.pp.svitlo.power.ui.theme.PowerRed
import ua.pp.svitlo.power.ui.theme.PowerOrange
import ua.pp.svitlo.power.ui.viewmodel.BuildingDetailViewModel
import ua.pp.svitlo.power.ui.viewmodel.UiState
import java.time.LocalDate
import java.time.format.DateTimeFormatter

enum class DateSelection {
    TODAY, YESTERDAY, CUSTOM
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BuildingDetailScreen(
    buildingId: Int,
    buildingName: String,
    onNavigateBack: () -> Unit,
    viewModel: BuildingDetailViewModel = viewModel()
) {
    val powerLogsState by viewModel.powerLogsState.collectAsState()
    val selectedDate by viewModel.selectedDate.collectAsState()
    val lifecycleOwner = LocalLifecycleOwner.current
    
    // Real-time updates for ongoing period
    var currentTime by remember { mutableStateOf(System.currentTimeMillis()) }
    
    // Date selection state
    val today = remember { LocalDate.now() }
    val yesterday = remember { today.minusDays(1) }
    var dateSelection by remember { mutableStateOf(DateSelection.TODAY) }
    var showDatePicker by remember { mutableStateOf(false) }
    var customDate by remember { mutableStateOf<LocalDate?>(null) }
    
    // DatePicker state
    val datePickerState = rememberDatePickerState(
        initialSelectedDateMillis = System.currentTimeMillis()
    )
    
    LaunchedEffect(buildingId) {
        viewModel.loadPowerLogs(buildingId, date = today)
    }
    
    // Refresh data when screen becomes visible (app returns from background)
    LaunchedEffect(lifecycleOwner, buildingId, selectedDate) {
        lifecycleOwner.lifecycle.repeatOnLifecycle(Lifecycle.State.RESUMED) {
            viewModel.loadPowerLogs(buildingId, silent = true, date = selectedDate)
        }
    }
    
    // Update time every second for ongoing periods
    LaunchedEffect(Unit) {
        while (true) {
            kotlinx.coroutines.delay(1000)
            currentTime = System.currentTimeMillis()
        }
    }
    
    // Date picker dialog
    if (showDatePicker) {
        DatePickerDialog(
            onDismissRequest = { showDatePicker = false },
            confirmButton = {
                TextButton(
                    onClick = {
                        datePickerState.selectedDateMillis?.let { millis ->
                            val selected = java.time.Instant.ofEpochMilli(millis)
                                .atZone(java.time.ZoneId.systemDefault())
                                .toLocalDate()
                            customDate = selected
                            dateSelection = DateSelection.CUSTOM
                            viewModel.loadPowerLogs(buildingId, date = selected)
                        }
                        showDatePicker = false
                    }
                ) {
                    Text("OK")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDatePicker = false }) {
                    Text("Cancel")
                }
            }
        ) {
            DatePicker(state = datePickerState)
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Column {
                        Text(
                            text = buildingName,
                            style = MaterialTheme.typography.titleLarge
                        )
                        Text(
                            text = "Apartment Grid",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.loadPowerLogs(buildingId, date = selectedDate) }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                }
            )
        },
        bottomBar = {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                tonalElevation = 3.dp,
                shadowElevation = 8.dp
            ) {
                DateSelectionChips(
                    dateSelection = dateSelection,
                    customDate = customDate,
                    onSelectToday = {
                        dateSelection = DateSelection.TODAY
                        viewModel.loadPowerLogs(buildingId, date = today)
                    },
                    onSelectYesterday = {
                        dateSelection = DateSelection.YESTERDAY
                        viewModel.loadPowerLogs(buildingId, date = yesterday)
                    },
                    onSelectCustom = {
                        showDatePicker = true
                    },
                    modifier = Modifier.padding(12.dp)
                )
            }
        }
    ) { padding ->
        when (val state = powerLogsState) {
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
                val paddedPeriods = state.data.getPaddedPeriods(selectedDate)
                val isOngoing = state.data.isLastPeriodOngoing() && selectedDate == today
                
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    contentPadding = PaddingValues(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Summary Card
                    item {
                        val dateLabel = when (dateSelection) {
                            DateSelection.TODAY -> "Today's Statistics"
                            DateSelection.YESTERDAY -> "Yesterday's Statistics"
                            DateSelection.CUSTOM -> customDate?.format(DateTimeFormatter.ofPattern("dd MMM yyyy")) ?: "Statistics"
                        }
                        Text(
                            text = dateLabel,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    
                    item {
                        SummaryCard(
                            allPeriods = paddedPeriods,
                            isOngoing = isOngoing,
                            currentTime = currentTime
                        )
                    }
                    
                    // Periods Header
                    item {
                        Text(
                            text = "Power Periods (${paddedPeriods.size})",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    
                    // Periods List (reversed - newest first)
                    items(paddedPeriods.reversed()) { period ->
                        val isLastPeriod = period == paddedPeriods.last()
                        val isPeriodOngoing = isLastPeriod && isOngoing
                        
                        PowerPeriodCard(
                            period = period,
                            isOngoing = isPeriodOngoing,
                            currentTime = currentTime
                        )
                    }
                }
            }
            is UiState.Error -> {
                ErrorContent(
                    message = state.message,
                    onRetry = { viewModel.loadPowerLogs(buildingId) },
                    modifier = Modifier.padding(padding)
                )
            }
        }
    }
}

@Composable
fun SummaryCard(
    allPeriods: List<PowerPeriod>,
    isOngoing: Boolean,
    currentTime: Long
) {
    // Full day in seconds (24 hours)
    val fullDaySeconds = 86400
    
    // Calculate totals by summing ALL periods (including padding)
    var availableSeconds = 0
    var unavailableSeconds = 0
    
    allPeriods.forEachIndexed { index, period ->
        val isLastPeriod = index == allPeriods.size - 1
        val duration = if (isOngoing && isLastPeriod) {
            period.getCurrentDuration()
        } else {
            period.durationSeconds
        }
        
        if (period.isAvailable) {
            availableSeconds += duration
        } else {
            unavailableSeconds += duration
        }
    }
    
    // Calculate percentage from full day (24 hours = 86400 seconds)
    val totalSeconds = availableSeconds + unavailableSeconds
    
    // Unavailable 
    val unavailablePercentage = if (fullDaySeconds > 0) {
        ((unavailableSeconds.toDouble() / fullDaySeconds) * 100).toInt()
    } else 0
    
    // Available 
    val availablePercentage = 100 - unavailablePercentage
    
    val formatDuration: (Int) -> String = { seconds ->
        val hours = seconds / 3600
        val minutes = (seconds % 3600) / 60
        when {
            hours > 0 -> "${hours}h ${minutes}m"
            minutes > 0 -> "${minutes}m"
            else -> "${seconds}s"
        }
    }
    
    val availableTime = formatDuration(availableSeconds)
    val unavailableTime = formatDuration(unavailableSeconds)
    
    val availablePerc = availablePercentage
    val unavailablePerc = unavailablePercentage
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp)
        ) {
            // Percentage display - компактный
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                CompactStatItem(
                    icon = Icons.Default.CheckCircle,
                    iconTint = PowerGreen,
                    label = "Available",
                    value = "$availablePerc%",
                    subValue = availableTime,
                    isLive = isOngoing && allPeriods.isNotEmpty() && allPeriods.last().isAvailable,
                    modifier = Modifier.weight(1f)
                )
                
                CompactStatItem(
                    icon = Icons.Default.Cancel,
                    iconTint = PowerRed,
                    label = "Unavailable",
                    value = "$unavailablePerc%",
                    subValue = unavailableTime,
                    isLive = isOngoing && allPeriods.isNotEmpty() && !allPeriods.last().isAvailable,
                    modifier = Modifier.weight(1f)
                )
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Progress bar - компактный
            LinearProgressIndicator(
                progress = availablePerc / 100f,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .background(
                        color = PowerRed.copy(alpha = 0.3f),
                        shape = MaterialTheme.shapes.small
                    ),
                color = PowerGreen,
                trackColor = PowerRed.copy(alpha = 0.3f)
            )
        }
    }
}

@Composable
fun CompactStatItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    iconTint: androidx.compose.ui.graphics.Color,
    label: String,
    value: String,
    subValue: String,
    isLive: Boolean = false,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier,
        color = iconTint.copy(alpha = 0.15f),
        shape = MaterialTheme.shapes.small,
        border = androidx.compose.foundation.BorderStroke(1.dp, iconTint)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = iconTint,
                modifier = Modifier.size(24.dp)
            )
            Column {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = value,
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = iconTint
                    )
                    if (isLive) {
                        Text(
                            text = "●",
                            color = iconTint,
                            style = MaterialTheme.typography.titleSmall
                        )
                    }
                }
                Text(
                    text = label,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = subValue,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DateSelectionChips(
    dateSelection: DateSelection,
    customDate: LocalDate?,
    onSelectToday: () -> Unit,
    onSelectYesterday: () -> Unit,
    onSelectCustom: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        FilterChip(
            selected = dateSelection == DateSelection.TODAY,
            onClick = onSelectToday,
            label = { Text("Today") },
            modifier = Modifier.weight(1f)
        )
        
        FilterChip(
            selected = dateSelection == DateSelection.YESTERDAY,
            onClick = onSelectYesterday,
            label = { Text("Yesterday") },
            modifier = Modifier.weight(1f)
        )
        
        FilterChip(
            selected = dateSelection == DateSelection.CUSTOM,
            onClick = onSelectCustom,
            label = { 
                Text(
                    if (dateSelection == DateSelection.CUSTOM && customDate != null) {
                        customDate.format(DateTimeFormatter.ofPattern("dd.MM"))
                    } else {
                        "Custom"
                    }
                )
            },
            leadingIcon = {
                Icon(
                    imageVector = Icons.Default.CalendarMonth,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp)
                )
            },
            modifier = Modifier.weight(1f)
        )
    }
}

@Composable
fun PowerPeriodCard(
    period: PowerPeriod,
    isOngoing: Boolean = false,
    currentTime: Long = 0L
) {
    val color = if (period.isAvailable) PowerGreen else PowerRed
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = color.copy(alpha = 0.1f)
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Icon and Status
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                Icon(
                    imageVector = if (period.isAvailable) Icons.Default.CheckCircle else Icons.Default.Cancel,
                    contentDescription = if (period.isAvailable) "Available" else "Unavailable",
                    tint = color,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = if (period.isAvailable) "Available" else "Unavailable",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold
                        )
                        if (isOngoing) {
                            Surface(
                                color = if (period.isAvailable) PowerGreen else PowerOrange,
                                shape = MaterialTheme.shapes.small
                            ) {
                                Text(
                                    text = "LIVE",
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = androidx.compose.ui.graphics.Color.White
                                )
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "${period.getStartTimeFormatted()} - ${period.getEndTimeFormatted(isOngoing)}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            
            // Duration
            Surface(
                color = color,
                shape = MaterialTheme.shapes.small
            ) {
                val displayDuration = if (isOngoing) {
                    period.getCurrentDuration()
                } else {
                    period.durationSeconds
                }
                
                Text(
                    text = period.getDurationFormatted(displayDuration),
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.Bold,
                    color = androidx.compose.ui.graphics.Color.White
                )
            }
        }
    }
}

