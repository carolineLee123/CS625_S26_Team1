from database import DatabaseManager
import mysql.connector
from mysql.connector import Error

"""
Clean DB and add seed data from Boston and Amherst
(user_id, lat, lng, location_text, title, description, category, safety_level, likes, comments, shares, verified_count)
"""

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

        # Boston-based reports: (user_id, lat, lng, location_text, title, description, category, safety_level, likes, comments, shares, verified_count)
        boston_reports = [
            (1, 42.3601, -71.0589, "Boston Common, Boston, MA", "Broken Streetlight at Boston Common", "Broken streetlight near Boston Common, needs immediate repair.", "safety", "high", 142, 0, 21, 12),
            (1, 42.3505, -71.0826, "Boylston Street, Boston, MA", "Pothole on Boylston Street", "Large pothole on Boylston Street causing traffic delays.", "note", "medium", 98, 0, 15, 6),
            (1, 42.3467, -71.0972, "Fenway Park area, Boston, MA", "Fallen Tree Near Fenway Park", "Fallen tree branch blocking sidewalk near Fenway Park.", "note", "medium", 73, 0, 8, 4),
            (1, 42.3647, -71.0542, "North End, Boston, MA", "Water Main Break in North End", "Water main break flooding street in North End.", "safety", "critical", 310, 0, 64, 31),
            (1, 42.3588, -71.0707, "Charles Street, Boston, MA", "Overflowing Trash on Charles Street", "Overflowing trash bins on Charles Street.", "note", "low", 44, 0, 5, 2),
            (1, 42.3467, -71.0707, "South End Playground, Boston, MA", "Broken Glass on South End Playground", "Broken glass on playground in South End park.", "safety", "high", 187, 0, 33, 18),
            (1, 42.3736, -71.1097, "MIT area, Cambridge, MA", "Damaged Bike Lane Near MIT", "Damaged bike lane marking near MIT.", "note", "low", 61, 0, 9, 3),
            (1, 42.3520, -71.0420, "Seaport District, Boston, MA", "Community Cleanup Event at Seaport", "Community cleanup event at Seaport this Saturday.", "event", "low", 224, 0, 88, 0),
            (1, 42.3543, -71.1308, "Boston University area, Boston, MA", "Unlit Crosswalk Near Boston University", "Unlit crosswalk near Boston University.", "safety", "high", 156, 0, 27, 14),
            (1, 42.3099, -71.1131, "Arnold Arboretum, Boston, MA", "Farmers Market at Arboretum", "Farmers market at Arboretum entrance every Sunday.", "event", "low", 193, 0, 72, 0),
        ]

        insert_query = """
            INSERT INTO reports (user_id, latitude, longitude, location_text, title, description, category, safety_level, likes, comments, shares, verified_count)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        print("[INFO] Adding Boston-based reports...")
        for report in boston_reports:
            cursor.execute(insert_query, report)
            print(f"[SUCCESS] Added report: {report[3]}")

        # Amherst, MA (UMass campus) reports — from original fallback data in frontend/app/Page.tsx : (user_id, lat, lng, location_text, title, description, category, safety_level, likes, comments, shares, verified_count)
        amherst_reports = [
            (1, 42.3795, -72.5196, "Amherst, MA", "Winter Weather Alert", "Active Winter Weather Warning for winter blizzard storm in the Amherst Area. Expected Temps 20-25 tonight.", "safety", "critical", 10, 0, 4, 14),
            (1, 42.3938, -72.5277, "LGRC, UMass Amherst, Amherst, MA", "Minor Flooding in Men's 2nd Floor Bath", "On the 2nd floor of the Men's restroom at John W. Lodges Graduate Research Center, there's some water. The people at the desk said they are aware.", "safety", "medium", 4, 0, 3, 3),
            (1, 42.3888, -72.5284, "Student Union, UMass Amherst, Amherst, MA", "Weekly Student Farmers Market", "A collaboration between UMass Permaculture and the UMass Student Farmers Market. Fresh seasonal produce available every week at the Student Union.", "event", "low", 5, 0, 3, 6),
            (1, 42.3894, -72.5333, "Mullins Center area, UMass Amherst, Amherst, MA", "Hockey Game Tonight", "The hockey team will be taking the ice for an upcoming game. Come stop by to catch the action and cheer them on!", "event", "low", 15, 0, 2, 2),
            (1, 42.3696, -72.5077, "UMass Amherst campus, Amherst, MA", "Baby Duck Sighting!!", "The campus cuteness levels just went up because baby ducks have made an appearance :)))", "note", "low", 3, 0, 1, 0),
        ]

        print("[INFO] Adding Amherst-based reports...")
        for report in amherst_reports:
            cursor.execute(insert_query, report)
            print(f"[SUCCESS] Added report: {report[3]}")

        db.connection.commit()
        print(f"[SUCCESS] Added {len(boston_reports)} Boston + {len(amherst_reports)} Amherst reports")

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
    print("Adding Boston-based & Amherst-based Reports to Database")
    print("=" * 60)
    clear_and_add_boston_reports()
