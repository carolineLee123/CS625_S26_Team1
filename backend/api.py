from flask import Flask, jsonify
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

if __name__ == '__main__':
    port = int(os.getenv('API_PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
