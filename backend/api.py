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
        
@app.route('/api/reports/<int:report_id>', methods=['PATCH'])
def update_report(report_id):
    """Update an existing report"""
    try:
        if not db.connection or not db.connection.is_connected():
            db.connect()

        existing_report = db.get_report_by_id(report_id)
        if not existing_report:
            return jsonify({'success': False, 'error': 'Report not found'}), 404
        
        current_user_id = 1  # Placeholder for authenticated user ID, since we don't have auth implemented yet
        if existing_report['user_id'] != current_user_id:
            return jsonify({'success': False, 'error': 'You can only edit your own reports'}), 403

        data = request.get_json() or {}

        allowed_fields = {
            'title',
            'description',
            'category',
            'urgency',
            'status'
        }

        update_data = {k: v for k, v in data.items() if k in allowed_fields}

        if not update_data:
            return jsonify({
                'success': False,
                'error': 'No valid fields provided for update'
            }), 400

        category_map = {
            'Safety': 'safety',
            'Event': 'event',
            'Note': 'note'
        }

        urgency_map = {
            'Urgent': 'critical',
            'Warning': 'high',
            'Non-urgent': 'low'
        }

        existing_category = existing_report['category']
        incoming_category = update_data.get('category')
        final_category = category_map.get(incoming_category, incoming_category) if incoming_category else existing_category

        incoming_urgency = update_data.get('urgency')

        if final_category in ['event', 'note']:
            final_safety_level = 'low'
        elif incoming_urgency:
            final_safety_level = urgency_map.get(incoming_urgency, existing_report['safety_level'])
        else:
            final_safety_level = existing_report['safety_level']

        updated_report = db.update_report(
            report_id=report_id,
            title=update_data.get('title', existing_report['title']),
            description=update_data.get('description', existing_report['description']),
            latitude=update_data.get('latitude', existing_report['latitude']),
            longitude=update_data.get('longitude', existing_report['longitude']),
            category=final_category,
            safety_level=final_safety_level,
            status=update_data.get('status', existing_report['status'])
        )

        if updated_report:
            return jsonify({
                'success': True,
                'data': updated_report
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to update report'
            }), 500

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('API_PORT', 5001))
    app.run(debug=True, host='0.0.0.0', port=port)
