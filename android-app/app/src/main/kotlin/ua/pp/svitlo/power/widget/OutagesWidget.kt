package ua.pp.svitlo.power.widget

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.*
import androidx.glance.action.ActionParameters
import androidx.glance.action.actionStartActivity
import androidx.glance.action.clickable
import androidx.glance.appwidget.action.ActionCallback
import androidx.glance.appwidget.action.actionRunCallback
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.provideContent
import androidx.glance.layout.*
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import ua.pp.svitlo.power.MainActivity
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

/**
 * Main Glance AppWidget for power outages schedule
 * Supports multiple sizes
 */
class OutagesWidget : GlanceAppWidget() {
    
    override val sizeMode = SizeMode.Responsive(
        setOf(
            SMALL_SQUARE,
            HORIZONTAL_RECTANGLE,
            BIG_SQUARE
        )
    )
    
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            val widgetData = loadWidgetData(context)
            
            GlanceTheme {
                when (LocalSize.current) {
                    SMALL_SQUARE -> SmallWidgetContent(widgetData)
                    HORIZONTAL_RECTANGLE -> MediumWidgetContent(widgetData)
                    BIG_SQUARE -> LargeWidgetContent(widgetData)
                    else -> SmallWidgetContent(widgetData)
                }
            }
        }
    }
    
    companion object {
        private val SMALL_SQUARE = DpSize(120.dp, 120.dp)
        private val HORIZONTAL_RECTANGLE = DpSize(250.dp, 120.dp)
        private val BIG_SQUARE = DpSize(250.dp, 250.dp)
    }
}

/**
 * Action callback for refreshing widget
 */
class RefreshWidgetCallback : ActionCallback {
    override suspend fun onAction(
        context: Context,
        glanceId: GlanceId,
        parameters: ActionParameters
    ) {
        // Trigger immediate update
        OutagesWidgetUpdater.enqueueUpdate(context)
    }
}

/**
 * Small widget: Shows only current status
 */
@Composable
private fun SmallWidgetContent(data: WidgetData) {
    Box(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(ColorProvider(Color(0xFF1C1B1F)))
            .padding(12.dp)
            .cornerRadius(16.dp)
            .clickable(actionStartActivity<MainActivity>())
    ) {
        Column(
            modifier = GlanceModifier.fillMaxSize()
        ) {
            // Header with logo
            Row(
                modifier = GlanceModifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "⚡ Svitlo",
                    style = TextStyle(
                        color = ColorProvider(Color.White),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                )
            }
            
            Spacer(modifier = GlanceModifier.defaultWeight())
            
            // Current status
            Column(
                modifier = GlanceModifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalAlignment = Alignment.CenterVertically
            ) {
                when {
                    data.isError -> {
                        Text(
                            text = "⚠️",
                            style = TextStyle(fontSize = 32.sp)
                        )
                        Spacer(modifier = GlanceModifier.height(4.dp))
                        Text(
                            text = "Error",
                            style = TextStyle(
                                color = ColorProvider(Color(0xFFFF5449)),
                                fontSize = 10.sp
                            )
                        )
                    }
                    data.isEmergency -> {
                        Text(
                            text = "🚨",
                            style = TextStyle(fontSize = 32.sp)
                        )
                        Spacer(modifier = GlanceModifier.height(4.dp))
                        Text(
                            text = "Emergency",
                            style = TextStyle(
                                color = ColorProvider(Color(0xFFFF5449)),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }
                    data.currentSlot != null -> {
                        Text(
                            text = "⚡",
                            style = TextStyle(fontSize = 32.sp)
                        )
                        Spacer(modifier = GlanceModifier.height(4.dp))
                        Text(
                            text = "Outage",
                            style = TextStyle(
                                color = ColorProvider(Color(0xFFFB8C00)),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        )
                        data.currentSlot.remainingMinutes?.let { mins ->
                            Text(
                                text = formatRemainingTime(mins),
                                style = TextStyle(
                                    color = ColorProvider(Color.White),
                                    fontSize = 10.sp
                                )
                            )
                        }
                    }
                    data.nextSlot != null -> {
                        Text(
                            text = "✓",
                            style = TextStyle(fontSize = 32.sp)
                        )
                        Spacer(modifier = GlanceModifier.height(4.dp))
                        Text(
                            text = "Power On",
                            style = TextStyle(
                                color = ColorProvider(Color(0xFF4CAF50)),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        )
                        Text(
                            text = "Next: ${data.nextSlot.timeRange}",
                            style = TextStyle(
                                color = ColorProvider(Color(0xFFCAC4D0)),
                                fontSize = 9.sp
                            )
                        )
                    }
                    else -> {
                        Text(
                            text = "✓",
                            style = TextStyle(fontSize = 32.sp)
                        )
                        Spacer(modifier = GlanceModifier.height(4.dp))
                        Text(
                            text = "No Outages",
                            style = TextStyle(
                                color = ColorProvider(Color(0xFF4CAF50)),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }
                }
            }
            
            Spacer(modifier = GlanceModifier.defaultWeight())
            
            // Refresh button at bottom left
            Row(
                modifier = GlanceModifier.fillMaxWidth()
            ) {
                Box(
                    modifier = GlanceModifier
                        .size(28.dp)
                        .background(ColorProvider(Color(0xFF6750A4).copy(alpha = 0.3f)))
                        .cornerRadius(14.dp)
                        .clickable(actionRunCallback<RefreshWidgetCallback>()),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "↻",
                        style = TextStyle(
                            fontSize = 18.sp,
                            color = ColorProvider(Color.White),
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            }
        }
    }
}

/**
 * Medium widget: Shows today's summary
 */
@Composable
private fun MediumWidgetContent(data: WidgetData) {
    Box(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(ColorProvider(Color(0xFF1C1B1F)))
            .padding(12.dp)
            .cornerRadius(16.dp)
            .clickable(actionStartActivity<MainActivity>())
    ) {
        Column(
            modifier = GlanceModifier.fillMaxSize()
        ) {
            // Header with logo
            Row(
                modifier = GlanceModifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "⚡ Svitlo Power",
                    style = TextStyle(
                        color = ColorProvider(Color.White),
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                )
            }
            
            Spacer(modifier = GlanceModifier.height(8.dp))
            
            // Current status or error
            if (!data.isError) {
                when {
                    data.isEmergency -> {
                        StatusCard(
                            icon = "🚨",
                            title = "Emergency",
                            subtitle = "No schedule applies",
                            color = Color(0xFFFF5449)
                        )
                    }
                    data.currentSlot != null -> {
                        StatusCard(
                            icon = "⚡",
                            title = "Outage Now",
                            subtitle = data.currentSlot.timeRange,
                            detail = data.currentSlot.remainingMinutes?.let { 
                                formatRemainingTime(it) 
                            },
                            color = Color(0xFFFB8C00)
                        )
                    }
                    data.nextSlot != null -> {
                        StatusCard(
                            icon = "✓",
                            title = "Power On",
                            subtitle = "Next: ${data.nextSlot.timeRange}",
                            color = Color(0xFF4CAF50)
                        )
                    }
                    else -> {
                        StatusCard(
                            icon = "✓",
                            title = "No Outages Today",
                            color = Color(0xFF4CAF50)
                        )
                    }
                }
                
                // Don't show stats for Emergency
                if (!data.isEmergency) {
                    Spacer(modifier = GlanceModifier.height(8.dp))
                    
                    // Today's stats
                    Row(
                        modifier = GlanceModifier.fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        StatItem(
                            value = data.todayStats.completed,
                            label = "Done",
                            color = Color(0xFF6C757D)
                        )
                        Spacer(modifier = GlanceModifier.width(12.dp))
                        StatItem(
                            value = data.todayStats.active,
                            label = "Active",
                            color = Color(0xFFFB8C00)
                        )
                        Spacer(modifier = GlanceModifier.width(12.dp))
                        StatItem(
                            value = data.todayStats.upcoming,
                            label = "Next",
                            color = Color(0xFFFF5449)
                        )
                    }
                }
            } else {
                // Error state
                Box(
                    modifier = GlanceModifier
                        .fillMaxWidth()
                        .defaultWeight(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "⚠️",
                            style = TextStyle(fontSize = 24.sp)
                        )
                        Spacer(modifier = GlanceModifier.height(4.dp))
                        Text(
                            text = "Error",
                            style = TextStyle(
                                color = ColorProvider(Color(0xFFFF5449)),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }
                }
            }
            
            Spacer(modifier = GlanceModifier.defaultWeight())
            
            // Refresh button at bottom left - ALWAYS visible
            Row(
                modifier = GlanceModifier.fillMaxWidth()
            ) {
                Box(
                    modifier = GlanceModifier
                        .size(32.dp)
                        .background(ColorProvider(Color(0xFF6750A4).copy(alpha = 0.3f)))
                        .cornerRadius(16.dp)
                        .clickable(actionRunCallback<RefreshWidgetCallback>()),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "↻",
                        style = TextStyle(
                            fontSize = 20.sp,
                            color = ColorProvider(Color.White),
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            }
        }
    }
}

/**
 * Large widget: Shows detailed information
 */
@Composable
private fun LargeWidgetContent(data: WidgetData) {
    Box(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(ColorProvider(Color(0xFF1C1B1F)))
            .padding(12.dp)
            .cornerRadius(16.dp)
            .clickable(actionStartActivity<MainActivity>())
    ) {
        Column(
            modifier = GlanceModifier.fillMaxSize()
        ) {
            // Header with logo
            Row(
                modifier = GlanceModifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "⚡ Svitlo Power",
                    style = TextStyle(
                        color = ColorProvider(Color.White),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    ),
                    modifier = GlanceModifier.defaultWeight()
                )
                
                if (data.updatedOn.isNotEmpty()) {
                    Text(
                        text = formatUpdateTime(data.updatedOn),
                        style = TextStyle(
                            color = ColorProvider(Color(0xFFCAC4D0)),
                            fontSize = 10.sp
                        )
                    )
                }
            }
            
            Spacer(modifier = GlanceModifier.height(10.dp))
            
            if (!data.isError) {
                // Current status
                when {
                    data.isEmergency -> {
                        // Emergency status - no schedule applies
                        Box(
                            modifier = GlanceModifier
                                .fillMaxWidth()
                                .background(ColorProvider(Color(0xFFFF5449).copy(alpha = 0.15f)))
                                .padding(16.dp)
                                .cornerRadius(12.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "🚨",
                                    style = TextStyle(fontSize = 36.sp)
                                )
                                Spacer(modifier = GlanceModifier.height(8.dp))
                                Text(
                                    text = "Emergency Shutdowns",
                                    style = TextStyle(
                                        color = ColorProvider(Color(0xFFFF5449)),
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                )
                                Spacer(modifier = GlanceModifier.height(4.dp))
                                Text(
                                    text = "Schedule does not apply",
                                    style = TextStyle(
                                        color = ColorProvider(Color(0xFFCAC4D0)),
                                        fontSize = 12.sp
                                    )
                                )
                            }
                        }
                    }
                    data.currentSlot != null -> {
                        DetailedStatusCard(
                            icon = "⚡",
                            title = "Outage Now",
                            timeRange = data.currentSlot.timeRange,
                            detail = data.currentSlot.remainingMinutes?.let { 
                                "Remaining: ${formatRemainingTime(it)}" 
                            } ?: "",
                            type = data.currentSlot.type,
                            color = Color(0xFFFB8C00)
                        )
                    }
                    data.nextSlot != null -> {
                        DetailedStatusCard(
                            icon = "✓",
                            title = "Power On",
                            timeRange = "Next: ${data.nextSlot.timeRange}",
                            type = data.nextSlot.type,
                            color = Color(0xFF4CAF50)
                        )
                    }
                    else -> {
                        StatusCard(
                            icon = "✓",
                            title = "No Outages Today",
                            color = Color(0xFF4CAF50)
                        )
                    }
                }
                
                // Don't show upcoming slots and stats for Emergency
                if (!data.isEmergency) {
                    Spacer(modifier = GlanceModifier.height(10.dp))
                    
                    // Upcoming outages list (if more than one)
                    if (data.upcomingSlots.size > 1) {
                        Text(
                            text = "Upcoming Outages",
                            style = TextStyle(
                                color = ColorProvider(Color(0xFFCAC4D0)),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Medium
                            )
                        )
                        Spacer(modifier = GlanceModifier.height(6.dp))
                        
                        // Show up to 3 upcoming outages (skip first if it's already shown as nextSlot)
                        val slotsToShow = data.upcomingSlots.drop(1).take(3)
                        slotsToShow.forEach { slot ->
                            UpcomingSlotRow(slot)
                            Spacer(modifier = GlanceModifier.height(4.dp))
                        }
                        
                        Spacer(modifier = GlanceModifier.height(6.dp))
                    }
                    
                    // Today's stats - compact version
                    Row(
                        modifier = GlanceModifier.fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        StatItem(
                            value = data.todayStats.completed,
                            label = "Done",
                            color = Color(0xFF6C757D)
                        )
                        Spacer(modifier = GlanceModifier.width(16.dp))
                        StatItem(
                            value = data.todayStats.active,
                            label = "Active",
                            color = Color(0xFFFB8C00)
                        )
                        Spacer(modifier = GlanceModifier.width(16.dp))
                        StatItem(
                            value = data.todayStats.upcoming,
                            label = "Next",
                            color = Color(0xFFFF5449)
                        )
                        
                        if (data.todayStats.totalMinutes > 0) {
                            Spacer(modifier = GlanceModifier.width(16.dp))
                            val hours = data.todayStats.totalMinutes / 60
                            val minutes = data.todayStats.totalMinutes % 60
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = if (hours > 0) "${hours}h ${minutes}m" else "${minutes}m",
                                    style = TextStyle(
                                        color = ColorProvider(Color(0xFFFF5449)),
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                )
                                Text(
                                    text = "Total",
                                    style = TextStyle(
                                        color = ColorProvider(Color(0xFFCAC4D0)),
                                        fontSize = 9.sp
                                    )
                                )
                            }
                        }
                    }
                }
            } else {
                // Error state
                Box(
                    modifier = GlanceModifier
                        .fillMaxWidth()
                        .defaultWeight(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "⚠️",
                            style = TextStyle(fontSize = 32.sp)
                        )
                        Spacer(modifier = GlanceModifier.height(8.dp))
                        Text(
                            text = "Loading Error",
                            style = TextStyle(
                                color = ColorProvider(Color(0xFFFF5449)),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        )
                        if (data.errorMessage.isNotEmpty()) {
                            Spacer(modifier = GlanceModifier.height(4.dp))
                            Text(
                                text = data.errorMessage,
                                style = TextStyle(
                                    color = ColorProvider(Color(0xFFCAC4D0)),
                                    fontSize = 10.sp
                                )
                            )
                        }
                    }
                }
            }
            
            Spacer(modifier = GlanceModifier.defaultWeight())
            
            // Refresh button at bottom left - ALWAYS visible
            Row(
                modifier = GlanceModifier.fillMaxWidth()
            ) {
                Box(
                    modifier = GlanceModifier
                        .size(36.dp)
                        .background(ColorProvider(Color(0xFF6750A4).copy(alpha = 0.3f)))
                        .cornerRadius(18.dp)
                        .clickable(actionRunCallback<RefreshWidgetCallback>()),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "↻",
                        style = TextStyle(
                            fontSize = 22.sp,
                            color = ColorProvider(Color.White),
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            }
        }
    }
}

/**
 * Compact row for upcoming outage slot
 */
@Composable
private fun UpcomingSlotRow(slot: SlotInfo) {
    Row(
        modifier = GlanceModifier
            .fillMaxWidth()
            .background(ColorProvider(Color(0xFFFF5449).copy(alpha = 0.1f)))
            .padding(horizontal = 8.dp, vertical = 6.dp)
            .cornerRadius(6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = "⏰",
            style = TextStyle(fontSize = 12.sp)
        )
        Spacer(modifier = GlanceModifier.width(6.dp))
        Text(
            text = slot.timeRange,
            style = TextStyle(
                color = ColorProvider(Color.White),
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium
            ),
            modifier = GlanceModifier.defaultWeight()
        )
        Box(
            modifier = GlanceModifier
                .background(ColorProvider(Color(0xFFFF5449)))
                .padding(horizontal = 6.dp, vertical = 2.dp)
                .cornerRadius(4.dp)
        ) {
            Text(
                text = if (slot.type == "Definite") "Planned" else slot.type,
                style = TextStyle(
                    color = ColorProvider(Color.White),
                    fontSize = 8.sp,
                    fontWeight = FontWeight.Bold
                )
            )
        }
    }
}

// Helper Composables

@Composable
private fun StatusCard(
    icon: String,
    title: String,
    subtitle: String? = null,
    detail: String? = null,
    color: Color
) {
    Box(
        modifier = GlanceModifier
            .fillMaxWidth()
            .background(ColorProvider(color.copy(alpha = 0.15f)))
            .padding(10.dp)
            .cornerRadius(12.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = icon,
                style = TextStyle(fontSize = 24.sp)
            )
            Spacer(modifier = GlanceModifier.width(10.dp))
            Column {
                Text(
                    text = title,
                    style = TextStyle(
                        color = ColorProvider(Color.White),
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                )
                subtitle?.let {
                    Text(
                        text = it,
                        style = TextStyle(
                            color = ColorProvider(Color(0xFFCAC4D0)),
                            fontSize = 11.sp
                        )
                    )
                }
                detail?.let {
                    Text(
                        text = it,
                        style = TextStyle(
                            color = ColorProvider(color),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            }
        }
    }
}

@Composable
private fun DetailedStatusCard(
    icon: String,
    title: String,
    timeRange: String,
    detail: String? = null,
    type: String,
    color: Color
) {
    Box(
        modifier = GlanceModifier
            .fillMaxWidth()
            .background(ColorProvider(color.copy(alpha = 0.15f)))
            .padding(12.dp)
            .cornerRadius(12.dp)
    ) {
        Column {
            Row(
                modifier = GlanceModifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = GlanceModifier.defaultWeight()
                ) {
                    Text(
                        text = icon,
                        style = TextStyle(fontSize = 24.sp)
                    )
                    Spacer(modifier = GlanceModifier.width(10.dp))
                    Column {
                        Text(
                            text = title,
                            style = TextStyle(
                                color = ColorProvider(Color.White),
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold
                            )
                        )
                        Text(
                            text = timeRange,
                            style = TextStyle(
                                color = ColorProvider(Color(0xFFCAC4D0)),
                                fontSize = 12.sp
                            )
                        )
                    }
                }
                
                Box(
                    modifier = GlanceModifier
                        .background(ColorProvider(color))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                        .cornerRadius(6.dp)
                ) {
                    Text(
                        text = if (type == "Definite") "Planned" else type,
                        style = TextStyle(
                            color = ColorProvider(Color.White),
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            }
            
            detail?.let {
                Spacer(modifier = GlanceModifier.height(6.dp))
                Text(
                    text = it,
                    style = TextStyle(
                        color = ColorProvider(color),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                )
            }
        }
    }
}

@Composable
private fun StatItem(value: Int, label: String, color: Color) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = value.toString(),
            style = TextStyle(
                color = ColorProvider(color),
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
        )
        Text(
            text = label,
            style = TextStyle(
                color = ColorProvider(Color(0xFFCAC4D0)),
                fontSize = 9.sp
            )
        )
    }
}

@Composable
private fun DetailedStatItem(icon: String, value: Int, label: String, color: Color) {
    Box(
        modifier = GlanceModifier
            .background(ColorProvider(color.copy(alpha = 0.15f)))
            .padding(8.dp)
            .cornerRadius(8.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = icon,
                style = TextStyle(fontSize = 18.sp)
            )
            Spacer(modifier = GlanceModifier.height(2.dp))
            Text(
                text = value.toString(),
                style = TextStyle(
                    color = ColorProvider(color),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            )
            Text(
                text = label,
                style = TextStyle(
                    color = ColorProvider(Color(0xFFCAC4D0)),
                    fontSize = 9.sp
                )
            )
        }
    }
}

@Composable
private fun ErrorContent(message: String) {
    Box(
        modifier = GlanceModifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "⚠️",
                style = TextStyle(fontSize = 32.sp)
            )
            Spacer(modifier = GlanceModifier.height(8.dp))
            Text(
                text = "Loading Error",
                style = TextStyle(
                    color = ColorProvider(Color(0xFFFF5449)),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            )
            if (message.isNotEmpty()) {
                Spacer(modifier = GlanceModifier.height(4.dp))
                Text(
                    text = message,
                    style = TextStyle(
                        color = ColorProvider(Color(0xFFCAC4D0)),
                        fontSize = 10.sp
                    )
                )
            }
        }
    }
}

// Helper functions

private fun formatRemainingTime(minutes: Int): String {
    return when {
        minutes >= 60 -> {
            val hours = minutes / 60
            val mins = minutes % 60
            "$hours h $mins m"
        }
        else -> "$minutes m"
    }
}

private fun formatUpdateTime(isoTime: String): String {
    return try {
        val dateTime = ZonedDateTime.parse(isoTime)
        dateTime.format(DateTimeFormatter.ofPattern("HH:mm"))
    } catch (e: Exception) {
        ""
    }
}

private fun loadWidgetData(context: Context): WidgetData {
    // This will be populated by the WidgetDataStore
    return WidgetDataStore.getData(context)
}

