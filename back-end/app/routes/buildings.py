from datetime import datetime, timedelta, timezone
from flask import jsonify, request
from app.services import Services
from app.utils import get_average_discharge_time
from app.utils.jwt_decorators import jwt_required
from app.models import Building

def register(app, services: Services):

    @app.route('/api/buildings/buildings', methods=['GET'])
    def get_buildings():
        buildings = services.database.get_buildings()
        minutes = 25

        def process_building(building):
            result_dict = {
                'id': building.id,
                'name': building.name,
                'color': building.color
            }

            ext_data = services.database.get_latest_ext_data_by_user_id(building.report_user_id)
            if ext_data is not None:
                result_dict['isGridAvailable'] = ext_data.grid_state

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

        buildings_dict = [process_building(building) for building in buildings]

        return jsonify(buildings_dict)


    @app.route('/api/buildings/dashboardConfig', methods=['GET'])
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
    
    @app.route('/api/buildings/updateDashboardConfig', methods=['POST'])
    @jwt_required()
    def update_dashboard_config():
        data = request.get_json()
        if not data or not isinstance(data, list):
            return jsonify({'error': 'Invalid payload'}), 400

        for item in data:
            if not isinstance(item, dict):
                continue
            key = item.get('key')
            value = item.get('value')
            if key is None:
                continue

            if isinstance(value, bool):
                value_str = 'true' if value else 'false'
            else:
                value_str = '' if value is None else str(value)

            services.database.create_dashboard_config(key, value_str)

        services.db.session.commit()
        services.events.broadcast_public("dashboard_config_updated")
        configs = services.database.get_dashboard_config()
        configs_dict = [{'key': c.key, 'value': c.value} for c in configs]
        return jsonify(configs_dict)
    
    @app.route('/api/buildings/building/<building_id>', methods=['GET'])
    @jwt_required()
    def get_building(building_id: int):
        building = services.database.get_building(building_id)
        return jsonify({
            'id': building.id,
            'name': building.name,
            'color': building.color,
            'stationId': building.station_id,
            'reportUserId': building.report_user_id,
        })
    
    @app.route('/api/buildings/save', methods=['PUT'])
    @jwt_required()
    def save_building():
        building = Building(
            id=request.json.get("id", None),
            name=request.json.get("name", ""),
            color=request.json.get("color", "#FFFFFF"),
            station_id=request.json.get("stationId", None),
            report_user_id=request.json.get("reportUserId", None)
        )
        building_id = services.database.save_building(building)
        services.db.session.commit()
        services.events.broadcast_public("buildings_updated")
        return jsonify({ 'success': True, 'id': building_id }), 200
    
    @app.route('/api/buildings/delete/<building_id>', methods=['DELETE'])
    @jwt_required()
    def delete_building(building_id: int):
        services.database.delete_building(building_id)
        services.db.session.commit()
        services.events.broadcast_public("buildings_updated")
        return jsonify({ 'success': True, 'id': building_id }), 200
    
    @app.route('/api/buildings/<int:building_id>/power-logs', methods=['POST'])
    def get_building_power_logs(building_id: int):
        """Get power availability statistics for a building"""
        building = services.database.get_building(building_id)
        if not building:
            return jsonify({'error': 'Building not found'}), 404
        
        data = request.get_json()
        start_date_str = data.get('startDate')
        end_date_str = data.get('endDate')
        
        if not start_date_str or not end_date_str:
            return jsonify({'error': 'startDate and endDate are required'}), 400
        
        try:
            start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
            end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
            
            if start_date.tzinfo is None:
                start_date = start_date.replace(tzinfo=timezone.utc)
            if end_date.tzinfo is None:
                end_date = end_date.replace(tzinfo=timezone.utc)
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400
        
        # Get all 
        records = services.database.get_ext_data_statistics(
            building.report_user_id,
            start_date,
            end_date
        )
        
        # periods
        periods = []
        total_available_seconds = 0
        total_unavailable_seconds = 0
        
        if records:
            for i in range(len(records)):
                current = records[i]
                
                current_time = current.received_at
                if current_time.tzinfo is None:
                    current_time = current_time.replace(tzinfo=timezone.utc)
                
                if i < len(records) - 1:
                    next_record = records[i + 1]
                    next_time = next_record.received_at
                    if next_time.tzinfo is None:
                        next_time = next_time.replace(tzinfo=timezone.utc)
                    duration_seconds = (next_time - current_time).total_seconds()
                    end_time = next_time
                else:
                    duration_seconds = (end_date - current_time).total_seconds()
                    end_time = end_date
                
                if current.grid_state:
                    total_available_seconds += duration_seconds
                else:
                    total_unavailable_seconds += duration_seconds
                
                periods.append({
                    'startTime': current_time.isoformat(),
                    'endTime': end_time.isoformat(),
                    'isAvailable': current.grid_state,
                    'durationSeconds': int(duration_seconds)
                })
        
        return jsonify({
            'periods': periods,
            'totalAvailableSeconds': int(total_available_seconds),
            'totalUnavailableSeconds': int(total_unavailable_seconds),
            'totalSeconds': int(total_available_seconds + total_unavailable_seconds)
        })