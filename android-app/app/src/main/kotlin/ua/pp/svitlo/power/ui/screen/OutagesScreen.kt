package ua.pp.svitlo.power.ui.screen

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.PowerOff
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.repeatOnLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.delay
import ua.pp.svitlo.power.data.model.DaySchedule
import ua.pp.svitlo.power.data.model.TimeSlot
import ua.pp.svitlo.power.ui.components.ErrorContent
import ua.pp.svitlo.power.ui.theme.PowerRed
import ua.pp.svitlo.power.ui.theme.PowerGreen
import ua.pp.svitlo.power.ui.theme.PowerYellow
import ua.pp.svitlo.power.ui.theme.PowerOrange
import ua.pp.svitlo.power.ui.viewmodel.OutagesViewModel
import ua.pp.svitlo.power.ui.viewmodel.UiState
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.time.format.TextStyle
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OutagesScreen(
    viewModel: OutagesViewModel = viewModel()
) {
    val outagesState by viewModel.outagesState.collectAsState()
    val currentQueue by viewModel.currentQueue.collectAsState()
    val lifecycleOwner = LocalLifecycleOwner.current
    
    // Refresh data when screen becomes visible (app returns from background)
    LaunchedEffect(lifecycleOwner) {
        lifecycleOwner.lifecycle.repeatOnLifecycle(Lifecycle.State.RESUMED) {
            viewModel.loadOutages(silent = true) // Silent refresh in background
        }
    }
    
    // Real-time updates
    var currentTime by remember { mutableStateOf(System.currentTimeMillis()) }
    LaunchedEffect(Unit) {
        while (true) {
            delay(1000) // Update every second
            currentTime = System.currentTimeMillis()
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Outages Schedule - Queue $currentQueue") },
                actions = {
                    IconButton(onClick = { viewModel.loadOutages() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                }
            )
        }
    ) { padding ->
        when (val state = outagesState) {
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
                val data = state.data
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Updated info
                    item {
                        Text(
                            text = "Last updated: ${formatUpdateTime(data.updatedOn)}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )
                    }
                    
                    // Today's summary if available
                    item {
                        val todaySchedule = data.days.firstOrNull { day ->
                            val scheduleDate = ZonedDateTime.parse(day.date).toLocalDate()
                            scheduleDate.isEqual(LocalDate.now())
                        }
                        
                        todaySchedule?.let { day ->
                            TodaySummaryCard(day, currentTime)
                        }
                    }
                    
                    // Days list
                    items(data.days) { day ->
                        DayScheduleCard(day, currentTime)
                    }
                }
            }
            is UiState.Error -> {
                ErrorContent(
                    message = state.message,
                    onRetry = { viewModel.loadOutages() },
                    modifier = Modifier.padding(padding)
                )
            }
        }
    }
}

@Composable
fun TodaySummaryCard(day: DaySchedule, currentTime: Long) {
    val passed = day.slots.count { getSlotStatus(it, true) == SlotStatus.PASSED }
    val active = day.slots.count { getSlotStatus(it, true) == SlotStatus.ACTIVE }
    val upcoming = day.slots.count { getSlotStatus(it, true) == SlotStatus.UPCOMING }
    
    val totalMinutes = day.slots.sumOf { it.end - it.start }
    val hours = totalMinutes / 60
    val minutes = totalMinutes % 60
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(bottom = 6.dp)
            ) {
                Icon(
                    Icons.Default.Schedule,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onSurface,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "Today's Outages",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                SummaryItem(
                    count = passed,
                    label = "Completed",
                    color = MaterialTheme.colorScheme.outline,
                    icon = Icons.Default.CheckCircle,
                    modifier = Modifier.weight(1f)
                )
                SummaryItem(
                    count = active,
                    label = "Active",
                    color = PowerOrange,
                    icon = Icons.Default.PowerOff,
                    modifier = Modifier.weight(1f)
                )
                SummaryItem(
                    count = upcoming,
                    label = "Upcoming",
                    color = PowerRed,
                    icon = Icons.Default.Schedule,
                    modifier = Modifier.weight(1f)
                )
            }
            
            if (totalMinutes > 0) {
                Spacer(modifier = Modifier.height(6.dp))
                Divider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.1f))
                Spacer(modifier = Modifier.height(4.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.PowerOff,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(12.dp)
                    )
                    Spacer(modifier = Modifier.width(3.dp))
                    Text(
                        text = "Total: ${if (hours > 0) "$hours h " else ""}$minutes min",
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

@Composable
fun SummaryItem(
    count: Int,
    label: String,
    color: Color,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier,
        color = color.copy(alpha = 0.15f),
        shape = MaterialTheme.shapes.small,
        border = androidx.compose.foundation.BorderStroke(1.dp, color)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Icon(
                icon,
                contentDescription = null,
                tint = color,
                modifier = Modifier.size(18.dp)
            )
            Column {
                Text(
                    text = count.toString(),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = color
                )
                Text(
                    text = label,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
fun DayScheduleCard(day: DaySchedule, currentTime: Long) {
    val dateTime = ZonedDateTime.parse(day.date)
    val today = LocalDate.now()
    val scheduleDate = dateTime.toLocalDate()
    val isToday = scheduleDate.isEqual(today)
    
    // Format date
    val dayOfWeek = scheduleDate.dayOfWeek.getDisplayName(TextStyle.FULL, Locale.getDefault())
    val dateFormatted = scheduleDate.format(DateTimeFormatter.ofPattern("MMM dd, yyyy"))
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = if (isToday) 6.dp else 2.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isToday) 
                MaterialTheme.colorScheme.primaryContainer 
            else 
                MaterialTheme.colorScheme.surface
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            // Date header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = dayOfWeek,
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = if (isToday) 
                                MaterialTheme.colorScheme.onPrimaryContainer 
                            else 
                                MaterialTheme.colorScheme.onSurface
                        )
                        if (isToday) {
                            Spacer(modifier = Modifier.width(8.dp))
                            Surface(
                                color = MaterialTheme.colorScheme.primary,
                                shape = MaterialTheme.shapes.small
                            ) {
                                Text(
                                    text = "TODAY",
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onPrimary
                                )
                            }
                        }
                    }
                    Text(
                        text = dateFormatted,
                        style = MaterialTheme.typography.bodyMedium,
                        color = if (isToday) 
                            MaterialTheme.colorScheme.onPrimaryContainer 
                        else 
                            MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                StatusBadge(day.status)
            }
            
            if (day.slots.isNotEmpty()) {
                Spacer(modifier = Modifier.height(12.dp))
                Divider(color = if (isToday) 
                    MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.2f) 
                else 
                    MaterialTheme.colorScheme.onSurface.copy(alpha = 0.2f)
                )
                Spacer(modifier = Modifier.height(12.dp))
                
                // Time slots
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    day.slots.forEach { slot ->
                        TimeSlotRow(slot, isToday, currentTime)
                    }
                }
            } else {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "No outages scheduled",
                    style = MaterialTheme.typography.bodyMedium,
                    color = if (isToday) 
                        MaterialTheme.colorScheme.onPrimaryContainer 
                    else 
                        MaterialTheme.colorScheme.onSurfaceVariant,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}

enum class SlotStatus {
    PASSED, ACTIVE, UPCOMING
}

data class SlotColors(
    val bgColor: Color,
    val iconColor: Color,
    val icon: androidx.compose.ui.graphics.vector.ImageVector,
    val textColor: Color
)

fun getSlotStatus(slot: TimeSlot, isToday: Boolean): SlotStatus {
    if (!isToday) return SlotStatus.UPCOMING
    
    val now = LocalTime.now()
    val currentMinutes = now.hour * 60 + now.minute
    
    return when {
        currentMinutes >= slot.end -> SlotStatus.PASSED
        currentMinutes >= slot.start -> SlotStatus.ACTIVE
        else -> SlotStatus.UPCOMING
    }
}

fun getSlotProgress(slot: TimeSlot): Float {
    val now = LocalTime.now()
    val currentMinutes = now.hour * 60 + now.minute
    
    if (currentMinutes < slot.start) return 0f
    if (currentMinutes >= slot.end) return 1f
    
    val elapsed = currentMinutes - slot.start
    val total = slot.end - slot.start
    return elapsed.toFloat() / total.toFloat()
}

fun getRemainingTime(slot: TimeSlot): String {
    val now = LocalTime.now()
    val currentMinutes = now.hour * 60 + now.minute
    val remaining = slot.end - currentMinutes
    
    if (remaining <= 0) return "Ended"
    
    val hours = remaining / 60
    val minutes = remaining % 60
    
    return when {
        hours > 0 -> "$hours h $minutes m remaining"
        else -> "$minutes m remaining"
    }
}

fun getFormattedDuration(durationInMinutes: Int): String {
    if (durationInMinutes <= 0) return "0 minutes"

    val hours = durationInMinutes / 60
    val minutes = durationInMinutes % 60

    return buildString {
        if (hours > 0) {
            append(if (hours > 1) "$hours hours" else "$hours hour")
        }
        if (minutes > 0) {
            if (isNotEmpty()) append(" ")
            append(if (minutes > 1) "$minutes minutes" else "$minutes minute")
        }
    }
}

@Composable
fun TimeSlotRow(slot: TimeSlot, isToday: Boolean, currentTime: Long) {
    val status = getSlotStatus(slot, isToday)
    val progress = if (status == SlotStatus.ACTIVE) getSlotProgress(slot) else 0f
    
    // Animate pulse for active slot
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val alpha by infiniteTransition.animateFloat(
        initialValue = 0.3f,
        targetValue = 0.8f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "alpha"
    )
    
    val colors = when (status) {
        SlotStatus.PASSED -> SlotColors(
            bgColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f),
            iconColor = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
            icon = Icons.Default.CheckCircle,
            textColor = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
        )
        SlotStatus.ACTIVE -> SlotColors(
            bgColor = PowerOrange.copy(alpha = alpha),
            iconColor = Color.White,
            icon = Icons.Default.PowerOff,
            textColor = Color.White
        )
        SlotStatus.UPCOMING -> SlotColors(
            bgColor = PowerRed.copy(alpha = 0.1f),
            iconColor = PowerRed,
            icon = Icons.Default.Schedule,
            textColor = MaterialTheme.colorScheme.onSurface
        )
    }
    
    Column(
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    color = colors.bgColor,
                    shape = MaterialTheme.shapes.small
                )
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = colors.icon,
                        contentDescription = null,
                        tint = colors.iconColor,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = slot.getTimeRange(),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = if (status == SlotStatus.ACTIVE) FontWeight.Bold else FontWeight.Normal,
                        color = colors.textColor
                    )
                    
                    if (status == SlotStatus.ACTIVE) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Surface(
                            color = PowerOrange,
                            shape = MaterialTheme.shapes.small
                        ) {
                            Text(
                                text = "NOW",
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }
                }
                Spacer(modifier = Modifier.height(4.dp))
                
                when (status) {
                    SlotStatus.PASSED -> Text(
                        text = "Completed • ${getFormattedDuration(slot.end - slot.start)}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                    )
                    SlotStatus.ACTIVE -> Text(
                        text = getRemainingTime(slot),
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    SlotStatus.UPCOMING -> Text(
                        text = "Duration: ${getFormattedDuration(slot.end - slot.start)}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            
            Surface(
                color = when (status) {
                    SlotStatus.PASSED -> MaterialTheme.colorScheme.surfaceVariant
                    SlotStatus.ACTIVE -> PowerOrange
                    SlotStatus.UPCOMING -> PowerRed
                },
                shape = MaterialTheme.shapes.small
            ) {
                Text(
                    text = if (slot.type == "Definite") "Planned" else slot.type,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.Bold,
                    color = when (status) {
                        SlotStatus.PASSED -> MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                        SlotStatus.ACTIVE -> Color.White
                        SlotStatus.UPCOMING -> MaterialTheme.colorScheme.onPrimary
                    }
                )
            }
        }
        
        // Progress bar for active slot
        if (status == SlotStatus.ACTIVE) {
            Spacer(modifier = Modifier.height(4.dp))
            LinearProgressIndicator(
                progress = progress,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(4.dp),
                color = PowerOrange,
                trackColor = MaterialTheme.colorScheme.surfaceVariant
            )
        }
    }
}

@Composable
fun StatusBadge(status: String) {
    val (text, color, icon) = when (status) {
        "ScheduleApplies" -> Triple("Active", MaterialTheme.colorScheme.primary, null)
        "WaitingForSchedule" -> Triple("Pending", MaterialTheme.colorScheme.tertiary, null)
        "EmergencyShutdowns" -> Triple("Emergency", PowerRed, Icons.Default.Warning)
        else -> Triple(status, MaterialTheme.colorScheme.secondary, null)
    }
    
    Surface(
        color = color.copy(alpha = 0.15f),
        shape = MaterialTheme.shapes.small,
        border = androidx.compose.foundation.BorderStroke(1.dp, color)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            if (icon != null) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = color,
                    modifier = Modifier.size(14.dp)
                )
            }
            Text(
                text = text,
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.Bold,
                color = color
            )
        }
    }
}

fun formatUpdateTime(isoTime: String): String {
    return try {
        val dateTime = ZonedDateTime.parse(isoTime)
        dateTime.format(DateTimeFormatter.ofPattern("MMM dd, HH:mm"))
    } catch (e: Exception) {
        isoTime
    }
}
