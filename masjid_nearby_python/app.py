"""
Masjid Nearby - Python Geospatial & Utility Service
Provides distance calculations, clustering helpers, and simple prayer time estimates.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from geopy.distance import geodesic
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://127.0.0.1:27017/masjid_nearby')
client = MongoClient(MONGO_URI)
db = client['masjid_nearby']

@app.route('/')
def home():
    return jsonify({
        'message': 'Masjid Nearby Python Service',
        'version': '1.0.0',
        'endpoints': [
            '/api/distance',
            '/api/nearby-calc',
            '/api/stats/cities',
            '/api/prayer-estimate'
        ]
    })

@app.route('/api/distance')
def calculate_distance():
    """Calculate distance between two points"""
    lat1 = request.args.get('lat1', type=float)
    lng1 = request.args.get('lng1', type=float)
    lat2 = request.args.get('lat2', type=float)
    lng2 = request.args.get('lng2', type=float)

    if None in (lat1, lng1, lat2, lng2):
        return jsonify({'error': 'lat1, lng1, lat2, lng2 required'}), 400

    dist = geodesic((lat1, lng1), (lat2, lng2))
    return jsonify({
        'distanceKm': round(dist.km, 3),
        'distanceMeters': round(dist.meters, 1),
        'distanceMiles': round(dist.miles, 3)
    })

@app.route('/api/nearby-calc')
def nearby_calc():
    """Calculate distances from user to all masjids (Python side)"""
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    radius = request.args.get('radius', 10, type=float)
    limit = request.args.get('limit', 30, type=int)

    if lat is None or lng is None:
        return jsonify({'error': 'lat and lng required'}), 400

    user_point = (lat, lng)
    masjids = list(db.masjids.find({'status': 'active'}, {
        'name': 1, 'nameUrdu': 1, 'address': 1, 'city': 1, 'area': 1,
        'location': 1, 'facilities': 1, 'rating': 1, 'isVerified': 1
    }))

    results = []
    for m in masjids:
        coords = m.get('location', {}).get('coordinates', [])
        if len(coords) != 2:
            continue
        masjid_point = (coords[1], coords[0])  # lat, lng
        dist_km = geodesic(user_point, masjid_point).km
        if dist_km <= radius:
            results.append({
                'id': str(m['_id']),
                'name': m.get('name'),
                'nameUrdu': m.get('nameUrdu', ''),
                'address': m.get('address'),
                'city': m.get('city'),
                'area': m.get('area'),
                'lat': coords[1],
                'lng': coords[0],
                'distanceKm': round(dist_km, 2),
                'facilities': m.get('facilities', []),
                'rating': m.get('rating', 0),
                'isVerified': m.get('isVerified', False)
            })

    results.sort(key=lambda x: x['distanceKm'])
    return jsonify({
        'count': len(results[:limit]),
        'userLocation': {'lat': lat, 'lng': lng},
        'radiusKm': radius,
        'masjids': results[:limit]
    })

@app.route('/api/stats/cities')
def city_stats():
    pipeline = [
        {'$match': {'status': 'active'}},
        {'$group': {'_id': '$city', 'count': {'$sum': 1}}},
        {'$sort': {'count': -1}}
    ]
    stats = list(db.masjids.aggregate(pipeline))
    return jsonify({
        'cities': [{'city': s['_id'], 'count': s['count']} for s in stats],
        'total': sum(s['count'] for s in stats)
    })

@app.route('/api/prayer-estimate')
def prayer_estimate():
    """Very rough prayer time estimate based on latitude (demo only)"""
    lat = request.args.get('lat', 31.5, type=float)
    # This is a simplified demo - real apps use accurate libraries like praytimes
    now = datetime.now()
    hour = now.hour

    # Rough estimates for Pakistan latitudes
    times = {
        'fajr': '04:50',
        'dhuhr': '12:30',
        'asr': '16:15',
        'maghrib': '18:45',
        'isha': '20:15'
    }

    next_prayer = 'fajr'
    if hour < 5:
        next_prayer = 'fajr'
    elif hour < 13:
        next_prayer = 'dhuhr'
    elif hour < 16:
        next_prayer = 'asr'
    elif hour < 19:
        next_prayer = 'maghrib'
    else:
        next_prayer = 'isha'

    return jsonify({
        'date': now.strftime('%Y-%m-%d'),
        'approxTimes': times,
        'nextPrayer': next_prayer,
        'note': 'These are approximate times. Use accurate prayer time libraries for production.'
    })

if __name__ == '__main__':
    print('🐍 Masjid Nearby Python Service on http://localhost:5001')
    app.run(host='0.0.0.0', port=5001, debug=True)
