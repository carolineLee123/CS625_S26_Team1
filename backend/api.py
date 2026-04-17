from flask import Flask, jsonify, request
from flask_cors import CORS
from database import DatabaseManager
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

db = DatabaseManager()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'API is running'
    })

@app.route('/api/reports', methods=['GET'])
def get_reports():
    """Get all reports from the database"""
    try:
        if not db.connection or not db.connection.is_connected():
            db.connect()

        reports = db.get_all_reports()

        return jsonify({
            'success': True,
            'data': reports,
            'count': len(reports)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/reports/<int:report_id>', methods=['GET'])
def get_report(report_id):
    """Get a specific report by ID"""
    try:
        if not db.connection or not db.connection.is_connected():
            db.connect()

        report = db.get_report_by_id(report_id)

        if report:
            return jsonify({
                'success': True,
                'data': report
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Report not found'
            }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/reports', methods=['POST'])
def create_report():
    """Create a new report"""
    try:
        if not db.connection or not db.connection.is_connected():
            db.connect()

        data = request.get_json()

        # Validate required fields
        required_fields = ['title', 'location', 'category', 'description']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400

        # Map frontend category to backend category
        category_map = {
            'Safety': 'safety',
            'Event': 'event',
            'Note': 'note'
        }
        category = category_map.get(data['category'], 'other')

        # Map frontend urgency to backend safety_level
        urgency_map = {
            'Urgent': 'critical',
            'Warning': 'high',
            'Non-urgent': 'low'
        }
        safety_level = urgency_map.get(data.get('urgency', 'Non-urgent'), 'low')

        # For events and notes, default to low safety level
        if data['category'] in ['Event', 'Note']:
            safety_level = 'low'

        # Default user_id to 1 for now (in production, use authenticated user)
        user_id = data.get('user_id', 1)

        # Get latitude and longitude (default to Boston if not provided)
        latitude = data.get('latitude', 42.3601)
        longitude = data.get('longitude', -71.0589)

        # Create the report
        report = db.create_report(
            user_id=user_id,
            latitude=latitude,
            longitude=longitude,
            title=data['title'],
            description=data['description'],
            category=category,
            safety_level=safety_level,
            location_text=data['location']
        )

        if report:
            return jsonify({
                'success': True,
                'data': report
            }), 201
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to create report'
            }), 500

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('API_PORT', 5001))
    app.run(debug=True, host='0.0.0.0', port=port)
