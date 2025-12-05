package ua.pp.svitlo.power.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver

/**
 * AppWidget receiver для виджета расписания отключений
 */
class OutagesWidgetReceiver : GlanceAppWidgetReceiver() {
    
    override val glanceAppWidget: GlanceAppWidget = OutagesWidget()
    
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        super.onUpdate(context, appWidgetManager, appWidgetIds)
        
        // Запуск worker для обновления данных
        OutagesWidgetUpdater.enqueueUpdate(context)
    }
    
    override fun onEnabled(context: Context) {
        super.onEnabled(context)
        
        // Виджет добавлен - настройка периодического обновления
        OutagesWidgetUpdater.enqueuePeriodicUpdates(context)
    }
    
    override fun onDisabled(context: Context) {
        super.onDisabled(context)
        
        // Все виджеты удалены - отмена обновлений
        OutagesWidgetUpdater.cancelUpdates(context)
    }
}

