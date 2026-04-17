from database import DatabaseManager
import mysql.connector
from mysql.connector import Error

def clear_and_add_boston_reports():
    """Clear existing reports and add Boston-based reports"""
    db = DatabaseManager()

    if not db.connect():
        print("[ERROR] Failed to connect to database")
        return False

    try:
        cursor = db.connection.cursor()

        # Clear existing reports
        print("[INFO] Clearing existing reports...")
        cursor.execute("DELETE FROM reports")
        db.connection.commit()
        print("[SUCCESS] Cleared existing reports")

        # Boston-based reports: (user_id, lat, lng, description, category, safety_level, likes, comments, shares, verified_count)
        boston_reports = [
            (1, 42.3601, -71.0589, "Broken streetlight near Boston Common, needs immediate repair", "safety", "high",     142,  38,  21, 12),
            (1, 42.3505, -71.0826, "Large pothole on Boylston Street causing traffic delays",       "note",   "medium",    98,  24,  15,  6),
            (1, 42.3467, -71.0972, "Fallen tree branch blocking sidewalk near Fenway Park",         "note",   "medium",    73,  11,   8,  4),
            (1, 42.3647, -71.0542, "Water main break flooding street in North End",                 "safety", "critical", 310,  87,  64, 31),
            (1, 42.3588, -71.0707, "Overflowing trash bins on Charles Street",                      "note",   "low",       44,   9,   5,  2),
            (1, 42.3467, -71.0707, "Broken glass on playground in South End park",                  "safety", "high",     187,  52,  33, 18),
            (1, 42.3736, -71.1097, "Damaged bike lane marking near MIT",                            "note",   "low",       61,  14,   9,  3),
            (1, 42.3520, -71.0420, "Community cleanup event at Seaport this Saturday",              "event",  "low",      224,  76,  88,  0),
            (1, 42.3543, -71.1308, "Unlit crosswalk near Boston University",                        "safety", "high",     156,  43,  27, 14),
            (1, 42.3099, -71.1131, "Farmers market at Arboretum entrance every Sunday",             "event",  "low",      193,  58,  72,  0),
        ]

        print("[INFO] Adding Boston-based reports...")
        insert_query = """
        INSERT INTO reports (user_id, latitude, longitude, description, category, safety_level, likes, comments, shares, verified_count)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        for report in boston_reports:
            cursor.execute(insert_query, report)
            print(f"[SUCCESS] Added report: {report[3][:50]}...")

        db.connection.commit()
        print(f"[SUCCESS] Added {len(boston_reports)} Boston-based reports")

        # Verify
        cursor.execute("SELECT COUNT(*) FROM reports")
        count = cursor.fetchone()[0]
        print(f"[SUCCESS] Total reports in database: {count}")

        cursor.close()
        db.close()
        return True

    except Error as e:
        print(f"[ERROR] Error updating database: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Adding Boston-based Reports to Database")
    print("=" * 60)
    clear_and_add_boston_reports()
