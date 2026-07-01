import csv
import json
import random
import math
from datetime import datetime, timedelta

def main():
    random.seed(42)
    total_hours = 1000
    
    # 18 Monitored Locations with coordinates and sector type
    locations = [
        {"name": "Sector A", "lat": 12.9716, "lon": 77.5946, "type": "Residential"},
        {"name": "Sector B", "lat": 12.9820, "lon": 77.6010, "type": "Residential"},
        {"name": "Sector C", "lat": 12.9605, "lon": 77.5850, "type": "Residential"},
        {"name": "Industrial Zone A", "lat": 13.0300, "lon": 77.5100, "type": "Industrial"},
        {"name": "Industrial Zone B", "lat": 12.9050, "lon": 77.4900, "type": "Industrial"},
        {"name": "River Station Alpha", "lat": 12.9550, "lon": 77.6400, "type": "Water Body"},
        {"name": "River Station Beta", "lat": 12.9900, "lon": 77.6800, "type": "Water Body"},
        {"name": "Lake Reservoir", "lat": 12.9300, "lon": 77.5500, "type": "Water Body"},
        {"name": "Campus Central", "lat": 12.9780, "lon": 77.5700, "type": "Commercial"},
        {"name": "Tech Park", "lat": 12.9730, "lon": 77.6200, "type": "Commercial"},
        {"name": "City Center", "lat": 12.9750, "lon": 77.5900, "type": "Traffic Hub"},
        {"name": "North Highway", "lat": 13.0100, "lon": 77.5800, "type": "Traffic Hub"},
        {"name": "South Highway", "lat": 12.9200, "lon": 77.6000, "type": "Traffic Hub"},
        {"name": "Construction Zone Alpha", "lat": 12.9650, "lon": 77.5300, "type": "Construction Area"},
        {"name": "Construction Zone Beta", "lat": 12.9950, "lon": 77.6300, "type": "Construction Area"},
        {"name": "Harbor Terminal", "lat": 12.9400, "lon": 77.6700, "type": "Industrial"},
        {"name": "Recycling Center", "lat": 13.0200, "lon": 77.5400, "type": "Industrial"},
        {"name": "Forest Edge", "lat": 12.9000, "lon": 77.5000, "type": "Natural"}
    ]
    
    start_time = datetime.now() - timedelta(hours=total_hours)
    readings = []
    
    for h in range(total_hours):
        current_time = start_time + timedelta(hours=h)
        timestamp = current_time.isoformat(timespec='seconds')
        
        # Diurnal and meteorological patterns
        hour_of_day = current_time.hour
        day_of_week = current_time.weekday()
        
        # Base weather conditions
        is_rainy = random.random() < 0.08  # 8% chance of rain
        humidity = round(random.uniform(85, 98) if is_rainy else random.uniform(45, 75), 1)
        weather_condition = "Rainy" if is_rainy else ("Cloudy" if random.random() < 0.25 else "Sunny")
        
        # Temperature has diurnal sine wave
        base_temp = 22 + 8 * math.sin(math.pi * (hour_of_day - 8) / 12)  # peak around 14:00
        temp_noise = random.uniform(-2, 2)
        air_temp = round(base_temp + temp_noise - (4 if is_rainy else 0), 1)
        
        wind_speed = round(random.uniform(15, 35) if is_rainy else random.uniform(3, 18), 1)
        
        # Generate data for all 18 locations
        for loc in locations:
            # Traffic index depends on location type and hour
            if loc["type"] == "Traffic Hub" or loc["name"] == "City Center":
                # Rush hours: 8-10 AM, 5-7 PM
                if (8 <= hour_of_day <= 10) or (17 <= hour_of_day <= 19):
                    traffic_index = round(random.uniform(75, 95), 1)
                else:
                    traffic_index = round(random.uniform(30, 65), 1)
            elif loc["type"] == "Residential" or loc["type"] == "Commercial":
                if (8 <= hour_of_day <= 20):
                    traffic_index = round(random.uniform(40, 70), 1)
                else:
                    traffic_index = round(random.uniform(10, 30), 1)
            else:
                traffic_index = round(random.uniform(5, 25), 1)
                
            # --- AIR TELEMETRY GENERATION ---
            # Base levels by location type
            pm25_base = 12.0
            pm10_base = 25.0
            co_base = 0.4
            no2_base = 15.0
            so2_base = 5.0
            o3_base = 20.0
            
            if loc["type"] == "Industrial":
                pm25_base, pm10_base, co_base, no2_base, so2_base = 45.0, 85.0, 1.2, 40.0, 22.0
            elif loc["type"] == "Traffic Hub":
                pm25_base, pm10_base, co_base, no2_base = 35.0, 70.0, 1.8, 55.0
            elif loc["type"] == "Construction Area":
                pm25_base, pm10_base = 65.0, 135.0  # high dust
            elif loc["type"] == "Natural":
                pm25_base, pm10_base, co_base, no2_base, so2_base, o3_base = 5.0, 10.0, 0.2, 5.0, 2.0, 15.0
                
            # Meteorological effects on air pollutants
            # Wind dilutes pollutants
            dilution_factor = max(0.4, 1.5 - (wind_speed / 15.0))
            # Rain washes out PM2.5/PM10
            rain_wash_factor = 0.3 if is_rainy else 1.0
            
            # Traffic adds CO, NO2, PM2.5
            traffic_contrib = (traffic_index / 50.0) * random.uniform(1.0, 1.8)
            
            pm25 = round(max(1.0, (pm25_base * dilution_factor * rain_wash_factor) + (traffic_contrib * 5) + random.uniform(-3, 3)), 1)
            pm10 = round(max(2.0, (pm10_base * dilution_factor * rain_wash_factor) + (traffic_contrib * 8) + random.uniform(-6, 6)), 1)
            co = round(max(0.05, (co_base * dilution_factor) + (traffic_contrib * 0.2) + random.uniform(-0.1, 0.1)), 2)
            no2 = round(max(0.5, (no2_base * dilution_factor) + (traffic_contrib * 10) + random.uniform(-4, 4)), 1)
            so2 = round(max(0.1, (so2_base * dilution_factor) + random.uniform(-1.5, 1.5)), 1)
            # Ozone is higher in sunny conditions and lower at night
            sun_o3_factor = 1.6 if weather_condition == "Sunny" else (0.6 if hour_of_day < 6 or hour_of_day > 18 else 1.0)
            o3 = round(max(1.0, (o3_base * sun_o3_factor * dilution_factor) + random.uniform(-3, 3)), 1)
            
            # Compute US AQI equivalent
            # For simplicity, calculate sub-indices for PM2.5 and PM10, then take max
            def pm25_to_aqi(val):
                if val <= 12.0: return (50/12.0) * val
                elif val <= 35.4: return 50 + (50/23.4) * (val - 12.0)
                elif val <= 55.4: return 100 + (50/20.0) * (val - 35.4)
                elif val <= 150.4: return 150 + (50/95.0) * (val - 55.4)
                elif val <= 250.4: return 200 + (100/100.0) * (val - 150.4)
                else: return 300 + (200/250.0) * (val - 250.4)
                
            def pm10_to_aqi(val):
                if val <= 54.0: return (50/54.0) * val
                elif val <= 154.0: return 50 + (50/100.0) * (val - 54.0)
                elif val <= 254.0: return 100 + (50/100.0) * (val - 154.0)
                elif val <= 354.0: return 150 + (50/100.0) * (val - 254.0)
                else: return 200 + (100/150.0) * (val - 354.0)
                
            aqi = int(max(pm25_to_aqi(pm25), pm10_to_aqi(pm10), (co * 30), (no2 * 0.8)))
            aqi = min(500, max(5, aqi))
            
            # --- WATER TELEMETRY GENERATION ---
            # Base water values
            ph_base = 7.2
            turb_base = 2.0
            do_base = 7.0
            tds_base = 180.0
            cond_base = 250.0
            chlorine_base = 0.8
            
            if loc["type"] == "Industrial":
                ph_base, turb_base, do_base, tds_base, cond_base, chlorine_base = 6.1, 8.5, 3.2, 580.0, 750.0, 2.2
            elif loc["type"] == "Water Body":
                ph_base, turb_base, do_base, tds_base, cond_base, chlorine_base = 7.5, 1.2, 7.8, 120.0, 180.0, 0.1
            elif loc["type"] == "Traffic Hub": # runoff from roads
                turb_base, tds_base, cond_base = 5.0, 280.0, 390.0
                
            # Rain runoff increases turbidity and TDS, dilutes chlorine
            runoff_factor = 2.5 if is_rainy else 1.0
            
            ph = round(ph_base + random.gauss(0, 0.3) - (0.2 if is_rainy else 0), 2)
            # Ensure pH stays in readable bounds
            ph = max(1.0, min(14.0, ph))
            turbidity = round(max(0.1, (turb_base * runoff_factor) + random.uniform(-0.5, 1.5)), 2)
            do = round(max(0.1, do_base - (0.5 if is_rainy else 0) + random.uniform(-0.8, 0.8)), 2)
            tds = round(max(10.0, (tds_base * (1.2 if is_rainy else 1.0)) + random.gauss(0, 30)), 1)
            conductivity = round(max(15.0, (cond_base * (1.15 if is_rainy else 1.0)) + random.gauss(0, 45)), 1)
            water_temp = round(max(4.0, air_temp * 0.9 + random.uniform(-2, 2)), 1)
            chlorine = round(max(0.0, (chlorine_base / runoff_factor) + random.uniform(-0.15, 0.15)), 2)
            
            # WQI (Water Quality Index) heuristic calculation (0-100 score)
            # Ideal: pH 7, turb < 1, DO > 7.5, TDS < 100, Chlorine < 1.0
            # Deduct points for deviations
            wqi_score = 100.0
            wqi_score -= abs(ph - 7.3) * 15
            wqi_score -= max(0, turbidity - 1.0) * 8
            wqi_score -= max(0, 7.5 - do) * 12
            wqi_score -= max(0, tds - 150) * 0.08
            wqi_score -= max(0, chlorine - 1.5) * 20
            wqi = round(max(0.0, min(100.0, wqi_score)), 1)
            
            water_status = "SAFE"
            if ph < 6.5 or ph > 8.5 or turbidity > 5.0 or do < 4.0 or tds > 450.0:
                water_status = "UNSAFE"
            # introduce 3% random measurement/label error
            if random.random() < 0.03:
                water_status = "SAFE" if water_status == "UNSAFE" else "UNSAFE"
                
            # --- SENSOR DIAGNOSTICS & ALERTS ---
            battery = round(max(5.0, 100.0 - (h * 0.04) + random.uniform(-2, 2)), 1)  # slow battery drain
            # battery recharge/replacement simulation if depleted
            if battery < 10.0:
                battery = 100.0  # simulated replacement
                
            signal = int(max(10, 95 - (15 if loc["type"] == "Natural" else 0) - random.randint(0, 20)))
            
            sensor_status = "ONLINE"
            # Random dropouts
            if random.random() < 0.015:
                sensor_status = "OFFLINE"
                
            readings.append({
                "timestamp": timestamp,
                "location": loc["name"],
                "latitude": loc["lat"],
                "longitude": loc["lon"],
                "sector_type": loc["type"],
                
                # Air Metrics
                "AQI": aqi,
                "PM25": pm25,
                "PM10": pm10,
                "CO": co,
                "NO2": no2,
                "SO2": so2,
                "O3": o3,
                "air_temperature": air_temp,
                "humidity": humidity,
                "wind_speed": wind_speed,
                "traffic_index": traffic_index,
                "weather_condition": weather_condition,
                
                # Water Metrics
                "pH": ph,
                "turbidity": turbidity,
                "DO": do,
                "TDS": tds,
                "conductivity": conductivity,
                "water_temperature": water_temp,
                "chlorine": chlorine,
                "WQI": wqi,
                "water_status": water_status,
                
                # IoT Diagnostics
                "battery": battery,
                "signal_strength": signal,
                "sensor_status": sensor_status
            })

    # Save to JSON
    json_path = "ecosphere_data.json"
    with open(json_path, "w") as f:
        json.dump(readings, f, indent=2)
        
    # Save to CSV
    csv_path = "ecosphere_data.csv"
    if readings:
        keys = readings[0].keys()
        with open(csv_path, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            writer.writerows(readings)
            
    print(f"[DATA GENERATOR] Successfully generated {len(readings)} rows of multi-location telemetry.")
    print(f"                 Air & Water datasets saved as {json_path} and {csv_path}.")

if __name__ == "__main__":
    main()
