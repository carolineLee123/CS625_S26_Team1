import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class DatabaseManager:
    def __init__(self):
        self.connection = None
        self.host = os.getenv('MYSQL_HOST', 'localhost')
        self.port = int(os.getenv('MYSQL_PORT', '3306'))
        self.database = os.getenv('MYSQL_DATABASE', 'testdb')
        self.user = os.getenv('MYSQL_USER', 'appuser')
        self.password = os.getenv('MYSQL_PASSWORD', 'secret123')

    def connect(self):
        """Establish connection to MySQL database"""
        try:
            self.connection = mysql.connector.connect(
                host=self.host,
                port=self.port,
                database=self.database,
                user=self.user,
                password=self.password
            )

            if self.connection.is_connected():
                db_info = self.connection.get_server_info()
                print(f"[SUCCESS] Connected to MySQL Server version {db_info}")
                print(f"[SUCCESS] Connected to database: {self.database}")
                return True
        except Error as e:
            print(f"[ERROR] Error connecting to MySQL: {e}")
            return False

    def test_connection(self):
        """Test database connection and basic operations"""
        if not self.connect():
            return False

        try:
            cursor = self.connection.cursor()

            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            print(f"[SUCCESS] Basic query test: {result[0]}")

            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            print(f"[SUCCESS] Available tables: {[table[0] for table in tables]}")

            cursor.execute("DESCRIBE reports")
            columns = cursor.fetchall()
            print(f"[SUCCESS] Reports table structure:")
            for column in columns:
                print(f"   - {column[0]}: {column[1]}")

            cursor.execute("SELECT COUNT(*) FROM reports")
            count = cursor.fetchone()[0]
            print(f"[SUCCESS] Total reports in database: {count}")

            cursor.close()
            return True

        except Error as e:
            print(f"[ERROR] Error during testing: {e}")
            return False

    def get_sample_reports(self, limit=5):
        """Retrieve sample reports for testing"""
        if not self.connection or not self.connection.is_connected():
            if not self.connect():
                return []

        try:
            cursor = self.connection.cursor(dictionary=True)
            query = """
            SELECT r.id, r.latitude, r.longitude, r.description,
                   r.category, r.safety_level, r.status, r.created_at,
                   u.username
            FROM reports r
            JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC
            LIMIT %s
            """
            cursor.execute(query, (limit,))
            reports = cursor.fetchall()
            cursor.close()
            return reports
        except Error as e:
            print(f"[ERROR] Error fetching reports: {e}")
            return []

    def get_all_reports(self):
        """Retrieve all reports from the database"""
        if not self.connection or not self.connection.is_connected():
            if not self.connect():
                return []

        try:
            cursor = self.connection.cursor(dictionary=True)
            query = """
            SELECT r.id, r.latitude, r.longitude, r.description,
                   r.category, r.safety_level, r.status, r.created_at,
                   r.updated_at, r.likes, r.comments, r.shares, r.verified_count,
                   u.username
            FROM reports r
            JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC
            """
            cursor.execute(query)
            reports = cursor.fetchall()
            cursor.close()

            for report in reports:
                report['latitude'] = float(report['latitude'])
                report['longitude'] = float(report['longitude'])
                report['created_at'] = report['created_at'].isoformat() if report['created_at'] else None
                report['updated_at'] = report['updated_at'].isoformat() if report['updated_at'] else None

            return reports
        except Error as e:
            print(f"[ERROR] Error fetching reports: {e}")
            return []

    def get_report_by_id(self, report_id):
        """Retrieve a specific report by ID"""
        if not self.connection or not self.connection.is_connected():
            if not self.connect():
                return None

        try:
            cursor = self.connection.cursor(dictionary=True)
            query = """
            SELECT r.id, r.latitude, r.longitude, r.description,
                   r.category, r.safety_level, r.status, r.created_at,
                   r.updated_at, r.likes, r.comments, r.shares, r.verified_count,
                   u.username
            FROM reports r
            JOIN users u ON r.user_id = u.id
            WHERE r.id = %s
            """
            cursor.execute(query, (report_id,))
            report = cursor.fetchone()
            cursor.close()

            if report:
                report['latitude'] = float(report['latitude'])
                report['longitude'] = float(report['longitude'])
                report['created_at'] = report['created_at'].isoformat() if report['created_at'] else None
                report['updated_at'] = report['updated_at'].isoformat() if report['updated_at'] else None

            return report
        except Error as e:
            print(f"[ERROR] Error fetching report: {e}")
            return None

    def add_sample_report(self, user_id, lat, lng, description, category, safety_level):
        """Add a new report for testing"""
        if not self.connection or not self.connection.is_connected():
            if not self.connect():
                return False

        try:
            cursor = self.connection.cursor()
            query = """
            INSERT INTO reports (user_id, latitude, longitude, description, category, safety_level)
            VALUES (%s, %s, %s, %s, %s, %s)
            """
            cursor.execute(query, (user_id, lat, lng, description, category, safety_level))
            self.connection.commit()
            print(f"[SUCCESS] Added new report with ID: {cursor.lastrowid}")
            cursor.close()
            return True
        except Error as e:
            print(f"[ERROR] Error adding report: {e}")
            return False

    def create_report(self, user_id, latitude, longitude, title, description, category, safety_level, location_text=None):
        """Create a new report"""
        if not self.connection or not self.connection.is_connected():
            if not self.connect():
                return None

        try:
            cursor = self.connection.cursor(dictionary=True)

            # Combine title and description for the description field
            full_description = f"{title}. {description}" if title else description

            query = """
            INSERT INTO reports (user_id, latitude, longitude, description, category, safety_level, status)
            VALUES (%s, %s, %s, %s, %s, %s, 'open')
            """
            cursor.execute(query, (user_id, latitude, longitude, full_description, category, safety_level))
            self.connection.commit()

            report_id = cursor.lastrowid
            print(f"[SUCCESS] Created new report with ID: {report_id}")

            # Fetch the newly created report
            cursor.execute("""
                SELECT r.id, r.latitude, r.longitude, r.description,
                       r.category, r.safety_level, r.status, r.created_at,
                       r.updated_at, r.likes, r.comments, r.shares, r.verified_count,
                       u.username
                FROM reports r
                JOIN users u ON r.user_id = u.id
                WHERE r.id = %s
            """, (report_id,))

            report = cursor.fetchone()
            cursor.close()

            if report:
                report['latitude'] = float(report['latitude'])
                report['longitude'] = float(report['longitude'])
                report['created_at'] = report['created_at'].isoformat() if report['created_at'] else None
                report['updated_at'] = report['updated_at'].isoformat() if report['updated_at'] else None

            return report
        except Error as e:
            print(f"[ERROR] Error creating report: {e}")
            return None

    def close(self):
        """Close database connection"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
            print("[SUCCESS] Database connection closed")

def main():
    """Main function to test database connectivity and operations"""
    print("Testing MySQL Database Connection...")
    print("=" * 50)

    db = DatabaseManager()

    # Test connection
    if db.test_connection():
        print("\nSample Reports:")
        print("-" * 30)
        reports = db.get_sample_reports()
        for report in reports:
            print(f"ID: {report['id']}")
            print(f"User: {report['username']}")
            print(f"Location: ({report['latitude']}, {report['longitude']})")
            print(f"Category: {report['category']} | Safety: {report['safety_level']}")
            print(f"Description: {report['description']}")
            print(f"Status: {report['status']} | Created: {report['created_at']}")
            print("-" * 30)

        # Test adding a new report
        print("\nTesting report creation...")
        success = db.add_sample_report(
            user_id=1,
            lat=37.7849,
            lng=-122.4194,
            description="Test report created by database.py",
            category="other",
            safety_level="low"
        )

        if success:
            print("[SUCCESS] Report creation test passed!")

    db.close()

if __name__ == "__main__":
    main()
