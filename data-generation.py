import csv
import json
import random
from datetime import datetime, timedelta

def main():
    total_readings = 7200
    
    # Define thresholds
    # pH: 6.5 - 8.2
    # TDS: <= 400
    # DO: >= 4.5
    # turbidity: <= 5.0
    
    # We want a more realistic overlapping dataset where the boundary is soft or noisy
    # so that models don't overfit perfectly (100% accuracy) on simple thresholds.
    # We will generate features over a continuous range, and then assign the label
    # with some added noise/uncertainty (e.g., 5% label noise or probabilistic assignment).
    
    # Start 300 days ago to match hourly interval requirements for 7200 readings
    start_time = datetime.now() - timedelta(hours=total_readings)
    
    readings = []
    
    # Target proportions: ~75% SAFE, ~25% UNSAFE
    # We'll generate parameters and compute if they are theoretically safe, 
    # then apply a probabilistic flip to introduce noise/realistic overlap.
    
    for i in range(total_readings):
        timestamp = (start_time + timedelta(hours=i)).isoformat(timespec='seconds')
        
        # Generate features with wide continuous distributions
        # pH: centered around 7.3 with standard deviation 0.6
        ph = round(random.gauss(7.3, 0.6), 2)
        # TDS: centered around 300 with standard dev 80
        tds = round(max(10.0, random.gauss(300, 80)), 1)
        # DO: centered around 6.5 with standard dev 1.5
        do = round(max(0.2, random.gauss(6.5, 1.5)), 2)
        # Turbidity: centered around 3.0 with standard dev 1.8
        turbidity = round(max(0.05, random.gauss(3.0, 1.8)), 2)
        # Temperature: centered around 18.5 with standard dev 4.0 (purely contextual)
        temperature = round(max(5.0, min(35.0, random.gauss(18.5, 4.0))), 1)
        
        # Check standard hard thresholds
        is_unsafe = (
            ph < 6.5 or ph > 8.2 or
            tds > 400 or
            do < 4.5 or
            turbidity > 5.0
        )
        
        # Determine status
        status = "UNSAFE" if is_unsafe else "SAFE"
        
        # Introduce label noise / environmental measurement errors (e.g., 6% chance to flip label)
        # This makes the decision boundary "fuzzy" and prevents 100% classification accuracy,
        # forcing models to generalize, handle noise, and prevent simple rule-overfitting.
        if random.random() < 0.06:
            status = "SAFE" if status == "UNSAFE" else "UNSAFE"
            
        readings.append({
            "id": i + 1,
            "timestamp": timestamp,
            "location": "Monitoring Point A",
            "pH": ph,
            "TDS": tds,
            "DO": do,
            "turbidity": turbidity,
            "temperature": temperature,
            "quality_status": status
        })

    # Save to JSON
    json_filename = "aquaguard_data.json"
    with open(json_filename, "w") as f:
        json.dump(readings, f, indent=2)

    # Save to CSV
    csv_filename = "aquaguard_data.csv"
    if readings:
        keys = readings[0].keys()
        with open(csv_filename, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            writer.writerows(readings)

    # Print statistics
    actual_safe = sum(1 for r in readings if r["quality_status"] == "SAFE")
    actual_unsafe = sum(1 for r in readings if r["quality_status"] == "UNSAFE")
    
    print(f"Data generation complete (with 6% decision boundary noise added to prevent overfitting).")
    print(f"Saved JSON to {json_filename}")
    print(f"Saved CSV to {csv_filename}")
    print(f"Total Readings: {len(readings)}")
    print(f"SAFE Readings: {actual_safe} ({actual_safe/len(readings)*100:.1f}%)")
    print(f"UNSAFE Readings: {actual_unsafe} ({actual_unsafe/len(readings)*100:.1f}%)")

if __name__ == "__main__":
    main()
