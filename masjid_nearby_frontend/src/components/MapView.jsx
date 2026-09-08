import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Star, MapPin } from 'lucide-react';
import '../css/MapView.css'

// Custom Masjid (Mosque) pin icon - green crescent/mosque style
const createMasjidIcon = (isSelected = false) => {
  const size = isSelected ? 44 : 36;
  return L.divIcon({
    className: 'custom-masjid-icon',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      ">
        <svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Pin shape -->
          <path d="M24 2C15.163 2 8 9.163 8 18c0 12 16 28 16 28s16-16 16-28c0-8.837-7.163-16-16-16z" 
                fill="${isSelected ? '#15803d' : '#16a34a'}" stroke="#fff" stroke-width="2"/>
          <!-- Mosque dome -->
          <path d="M24 10c-4 0-7 3-7 7v1h14v-1c0-4-3-7-7-7z" fill="#fff"/>
          <!-- Dome top -->
          <circle cx="24" cy="9" r="1.5" fill="#fff"/>
          <!-- Minaret left -->
          <rect x="14" y="14" width="2.5" height="8" rx="0.5" fill="#fff"/>
          <path d="M13.5 13.5h3.5l-0.5-2h-2.5l-0.5 2z" fill="#fff"/>
          <!-- Minaret right -->
          <rect x="31.5" y="14" width="2.5" height="8" rx="0.5" fill="#fff"/>
          <path d="M31 13.5h3.5l-0.5-2h-2.5l-0.5 2z" fill="#fff"/>
          <!-- Door -->
          <rect x="21" y="18" width="6" height="6" rx="1" fill="${isSelected ? '#15803d' : '#16a34a'}"/>
        </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size]
  });
};

// Current user location pin - blue pulsing style
const createUserIcon = () => {
  return L.divIcon({
    className: 'custom-user-icon',
    html: `
      <div style="position: relative; width: 40px; height: 40px;">
        <!-- Pulse ring -->
        <div style="
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 40px; height: 40px;
          background: rgba(37, 99, 235, 0.25);
          border-radius: 50%;
          animation: pulse 2s ease-out infinite;
        "></div>
        <!-- Outer circle -->
        <div style="
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 22px; height: 22px;
          background: #2563eb;
          border: 3px solid #fff;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.5);
        "></div>
        <!-- Inner dot -->
        <div style="
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 8px; height: 8px;
          background: #fff;
          border-radius: 50%;
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
      </style>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

// Auto-fit bounds when masjids change
function FitBounds({ masjids, userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (!userLocation) return;

    const points = [[userLocation.lat, userLocation.lng]];
    masjids.forEach(m => {
      const coords = m.location?.coordinates;
      if (coords) points.push([coords[1], coords[0]]);
    });

    if (points.length === 1) {
      map.setView(points[0], 14);
    } else {
      map.fitBounds(points, { padding: [50, 50], maxZoom: 15 });
    }
  }, [masjids, userLocation, map]);

  return null;
}

const masjidIcon = L.divIcon({
  className: 'custom-masjid-marker',
  html: `
    <div class="masjid-pin">
      <div class="masjid-pin-inner">
        <span>🕌</span>
      </div>
    </div>
  `,
  iconSize: [46, 56],
  iconAnchor: [23, 56],
  popupAnchor: [0, -56],
});

const MapView = ({ 
  userLocation, 
  masjids = [], 
  selectedMasjid, 
  onSelectMasjid,
  radiusKm = 5 
}) => {
  // const masjidIcon = useMemo(() => createMasjidIcon(false), []);
  const selectedIcon = useMemo(() => createMasjidIcon(true), []);
  const userIcon = useMemo(() => createUserIcon(), []);

  if (!userLocation) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Enable location to see the map</p>
          <p className="text-sm text-gray-400 mt-1">We need your location to find nearby masjids</p>
        </div>
      </div>
    );
  }

  const center = [userLocation.lat, userLocation.lng];

  return (
    <MapContainer
      center={center}
      zoom={14}
      className="h-full w-full rounded-xl"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Radius circle */}
      <Circle
        center={center}
        radius={radiusKm * 1000}
        pathOptions={{
          color: '#16a34a',
          fillColor: '#22c55e',
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: '6 4'
        }}
      />

      {/* User location marker */}
      <Marker position={center} icon={userIcon}>
        <Popup>
          <div className="text-sm font-medium text-blue-700">
            📍 Your Location
          </div>
        </Popup>
      </Marker>

      {/* Masjid markers */}
      {/* {masjids.map((masjid) => {
        const coords = masjid.location?.coordinates;
        if (!coords) return null;
        const position = [coords[1], coords[0]];
        const isSelected = selectedMasjid?._id === masjid._id;

        return (
          <Marker
            key={masjid._id}
            position={position}
            icon={isSelected ? selectedIcon : masjidIcon}
            eventHandlers={{
              click: () => onSelectMasjid?.(masjid)
            }}
          >
            <Popup>
              <div className="min-w-[180px]">
                <h3 className="font-semibold text-gray-900 text-sm">{masjid.name}</h3>
                {masjid.nameUrdu && (
                  <p className="text-xs text-gray-500 mt-0.5" dir="rtl">{masjid.nameUrdu}</p>
                )}
                <p className="text-xs text-gray-600 mt-1">{masjid.address}</p>
                <div className="flex items-center gap-2 mt-2 text-xs">
                  {masjid.distanceKm !== undefined && (
                    <span className="text-primary-700 font-medium">
                      {masjid.distanceKm} km
                    </span>
                  )}
                  {masjid.rating > 0 && (
                    <span className="flex items-center gap-0.5 text-amber-600">
                      <Star className="w-3 h-3 fill-current" /> {masjid.rating}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onSelectMasjid?.(masjid)}
                  className="mt-2 w-full text-xs bg-primary-600 text-white py-1.5 rounded-md hover:bg-primary-700"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })} */}

      {masjids.map((masjid) => (
  <Marker
    key={masjid._id}
    position={[
      masjid.location.coordinates[1],
      masjid.location.coordinates[0]
    ]}
    icon={masjidIcon}
    eventHandlers={{
      click: () => onSelectMasjid(masjid),
    }}
  >
    <Popup>
      <div>
        <strong>{masjid.name}</strong>
        <br />
        {masjid.area}, {masjid.city}
      </div>
    </Popup>
  </Marker>
))}

      <FitBounds masjids={masjids} userLocation={userLocation} />
    </MapContainer>
  );
};

export default MapView;
