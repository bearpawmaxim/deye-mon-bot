package ua.pp.svitlo.power.data.model

data class DashboardConfig(
    val key: String,
    val value: String
)

data class DashboardSettings(
    val title: String = "Svitlo Power",
    val enableOutagesSchedule: Boolean = false,
    val outagesScheduleQueue: String = ""
) {
    companion object {
        fun fromConfigList(configs: List<DashboardConfig>): DashboardSettings {
            var title = "Svitlo Power"
            var enableSchedule = false
            var queue = ""
            
            configs.forEach { config ->
                when (config.key) {
                    "title" -> title = config.value
                    "enableOutagesSchedule" -> enableSchedule = config.value.toBoolean()
                    "outagesScheduleQueue" -> queue = config.value
                }
            }
            
            return DashboardSettings(title, enableSchedule, queue)
        }
    }
}

