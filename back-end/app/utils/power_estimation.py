def get_kilowatthour_consumption(average_consumption_w: float, minutes: int):
    return average_consumption_w * minutes / 60000.0

def get_average_discharge_time(batt_capacity_kwh: float, batt_soc: int, average_consumption_kwh: float):
    remaining_energy_kwh = batt_capacity_kwh * (batt_soc / 100)
    time_left = remaining_energy_kwh / average_consumption_kwh

    hours = int(time_left)
    minutes = int((time_left - hours) * 60)
    return f"{hours:02d}:{minutes:02d}"