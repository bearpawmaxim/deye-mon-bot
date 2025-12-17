package ua.pp.svitlo.power.ui.navigation

sealed class Screen(val route: String) {
    object Power : Screen("power")
    object Outages : Screen("outages")
    object Settings : Screen("settings")
    object BuildingDetail : Screen("building_detail/{buildingId}/{buildingName}") {
        fun createRoute(buildingId: String, buildingName: String): String {
            return "building_detail/$buildingId/$buildingName"
        }
    }
}

