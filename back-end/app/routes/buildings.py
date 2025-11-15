from datetime import datetime, timedelta, timezone
from flask import jsonify
from app.services import Services
from app.utils import get_average_discharge_time, get_kilowatthour_consumption


def register(app, services: Services):

    @app.route('/api/buildings/buildings', methods=['POST'])
    def get_buildings():
        buildings = services.database.get_buildings()
        minutes = 60

        def process_building(building):
            result_dict = {
                'id': building.id,
                'name': building.name,
                'color': building.color
            }
            if building.station is not None:
                station_id = building.station_id
                station_data = services.database.get_last_station_data(station_id)
                if station_data is None:
                    return result_dict

                is_discharging = (station_data.discharge_power or 0) > 0
                is_charging = (station_data.charge_power or 0) * -1 > 200

                result_dict['isCharging'] = is_charging
                result_dict['isDischarging'] = is_discharging
                result_dict['batteryPercent'] = station_data.battery_soc

                if is_discharging:
                    batt_capacity = building.station.battery_capacity
                    soc = station_data.battery_soc
                    average_consumption_w = services.database.get_station_data_average_column(
                        datetime.now(timezone.utc) - timedelta(minutes=minutes),
                        datetime.now(timezone.utc),
                        station_id,
                        "consumption_power"
                    )
                    if average_consumption_w is None:
                        consumption_kwh = 0.0
                    else:
                        consumption_kwh = average_consumption_w / 1000

                    result_dict['consumptionPower'] = f"{consumption_kwh:.2f}"

                    if consumption_kwh > 0:
                        estimate_discharge_time = get_average_discharge_time(batt_capacity, soc, consumption_kwh)
                        result_dict['batteryDischargeTime'] = estimate_discharge_time
                else:
                    average_consumption_w = services.database.get_station_data_average_column(
                        datetime.now(timezone.utc) - timedelta(minutes=minutes),
                        datetime.now(timezone.utc),
                        station_id,
                        "consumption_power"
                    )
                    if average_consumption_w is None:
                        average_consumption_w = 0

                    result_dict['consumptionPower'] = f"{(average_consumption_w / 1000):.2f}"

            return result_dict

        futures = [services.executor.submit(process_building, building) for building in buildings]
        buildings_dict = [future.result() for future in futures]

        return jsonify(buildings_dict)


    @app.route('/api/buildings/dashboardConfig', methods=['POST'])
    def get_dashboard_config():
        configs = services.database.get_dashboard_config()

        def process_config(config):
            return {
                'key': config.key,
                'value': config.value,
            }
        
        futures = [services.executor.submit(process_config, config) for config in configs]
        configs_dict = [future.result() for future in futures]

        return jsonify(configs_dict)