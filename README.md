# 🕌 Masjid Nearby

Find mosques near your current location with interactive map, custom pin icons, and detailed information.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + Vite + Tailwind CSS + Leaflet (OpenStreetMap) |
| **Backend** | Node.js + Express.js + MongoDB (Geospatial / 2dsphere) |
| **Python** | Flask + Geopy + PyMongo (distance calc & helpers) |

## Features

- 📍 **Current Location** – Blue pulsing pin for your position
- 🕌 **Masjid Pins** – Custom green mosque-shaped markers on the map
- 🗺️ **Interactive Map** – OpenStreetMap via Leaflet, radius circle
- 📏 **Nearby Search** – MongoDB `$geoNear` with distance in km
- 🔍 **Text Search** – Search by name, area, city
- 📋 **Details** – Prayer times, facilities, capacity, rating, directions
- 📱 **Responsive** – Works on mobile & desktop
- 🇵🇰 **Pakistan focused** – Seed data for Lahore, Karachi, Islamabad, etc.

## Project Structure

```
masjid-nearby/
├── backend/
│   ├── models/Masjid.js      # Geospatial schema
│   ├── routes/masjids.js     # Nearby, search, CRUD
│   ├── seed.js               # 20+ real masjids
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/MapView.jsx   # Map + custom icons
│   │   ├── pages/Home.jsx           # Main map + list
│   │   └── pages/MasjidDetail.jsx
│   └── package.json
├── python/
│   ├── app.py                # Distance & stats service
│   └── requirements.txt
└── README.md
```

## Quick Start

### 1. MongoDB
```bash
mongod
```

### 2. Backend
```bash
cd backend
npm install
node seed.js          # Load sample masjids
npm run dev           # http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev           # http://localhost:5173
```

### 4. Python Service (optional)
```bash
cd python
pip install -r requirements.txt
python app.py         # http://localhost:5001
```

## How Map & Pins Work

- **User Location Pin**: Blue circle with pulse animation (current position)
- **Masjid Pin**: Custom SVG mosque icon (green) – dome + minarets
- Selected masjid gets a darker green pin
- Green dashed circle shows search radius
- Click any pin → popup + bottom detail card
- “Get Directions” opens Google Maps

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/masjids/nearby?lat=..&lng=..&radius=5` | Nearby masjids with distance |
| GET | `/api/masjids/search?q=...` | Text search |
| GET | `/api/masjids` | List all |
| GET | `/api/masjids/:id` | Single masjid |
| POST | `/api/masjids` | Create (body: name, address, city, lat, lng, ...) |

## Demo Location

If browser location is denied, the app falls back to **Lahore** center so you can still test the map and nearby masjids.

## License

MIT
# masjid_nearby_app
