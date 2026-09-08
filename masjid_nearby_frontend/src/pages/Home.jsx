
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import MapView from '../components/MapView';

import {
  Navigation,
  Search,
  Star,
  LocateFixed,
  Loader2,
  Filter,
  ChevronRight,
  X,
  MapPin,
  ShieldCheck,
  Clock3,
} from 'lucide-react';

const Home = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [masjids, setMasjids] = useState([]);
  const [selectedMasjid, setSelectedMasjid] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [radius, setRadius] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    setLocating(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLocating(false);
      setUserLocation({ lat: 31.5204, lng: 74.3587 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });

        setLocating(false);
      },
      (err) => {
        console.error(err);

        setError(
          'Could not get your location. Showing Lahore as demo location.'
        );

        setUserLocation({
          lat: 31.5204,
          lng: 74.3587,
        });

        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }, []);

  // Fetch nearby masjids
  const fetchNearby = useCallback(async () => {
    if (!userLocation) return;

    setLoading(true);

    try {
      const res = await api.get('/masjids/nearby', {
        params: {
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius,
          limit: 50,
        },
      });

      setMasjids(res.data.masjids || []);
      setSelectedMasjid(null);
    } catch (err) {
      console.error(err);

      setError(
        'Failed to load nearby masjids. Please make sure the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  }, [userLocation, radius]);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  useEffect(() => {
    if (userLocation) {
      fetchNearby();
    }
  }, [userLocation, radius, fetchNearby]);

  // Search
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      fetchNearby();
      return;
    }

    setLoading(true);

    try {
      const res = await api.get('/masjids/search', {
        params: {
          q: searchQuery,
          limit: 30,
        },
      });

      setMasjids(res.data.masjids || []);
    } catch (err) {
      console.error(err);
      setError('Unable to search masjids.');
    } finally {
      setLoading(false);
    }
  };

  const facilityColors = {
    'Wudu Area': 'bg-blue-50 text-blue-700 border-blue-100',
    Parking: 'bg-slate-50 text-slate-700 border-slate-200',
    'Women Section': 'bg-pink-50 text-pink-700 border-pink-100',
    AC: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    Jummah: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    Library: 'bg-purple-50 text-purple-700 border-purple-100',
    'Wheelchair Access':
      'bg-indigo-50 text-indigo-700 border-indigo-100',
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">

      {/* ================= HEADER ================= */}
      <header className="relative z-30 h-[72px] bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-[0_4px_20px_rgba(15,23,42,0.06)] px-4 md:px-6 flex items-center gap-4">

        {/* Logo */}
        <div className="flex items-center gap-3 min-w-fit">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <span className="text-2xl">🕌</span>
            </div>

            <span className="absolute -right-1 -bottom-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white" />
          </div>

          <div className="hidden sm:block">
            <h1 className="font-extrabold text-[17px] tracking-tight text-slate-900">
              Masjid Nearby
            </h1>

            <p className="text-[11px] font-medium text-slate-400">
              Find peace near you
            </p>
          </div>
        </div>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-xl mx-auto hidden sm:flex"
        >
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 group-focus-within:text-emerald-600 transition-colors" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search masjid, area or city..."
              className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/80 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <button
            type="submit"
            className="ml-2 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Search
          </button>
        </form>

        {/* Header Actions */}
        <div className="flex items-center gap-2 ml-auto">

          {/* Radius */}
          <div className="relative hidden md:block">
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="h-10 appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-8 text-xs font-semibold text-slate-700 outline-none cursor-pointer hover:bg-white focus:border-emerald-400 transition"
            >
              <option value={2}>2 km</option>
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={20}>20 km</option>
              <option value={50}>50 km</option>
            </select>
          </div>

          {/* Location */}
          <button
            onClick={getCurrentLocation}
            disabled={locating}
            className="h-10 px-3 md:px-4 rounded-xl bg-slate-900 text-white flex items-center gap-2 text-xs font-semibold shadow-lg shadow-slate-900/15 hover:bg-slate-800 transition-all disabled:opacity-60"
          >
            {locating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LocateFixed className="w-4 h-4" />
            )}

            <span className="hidden md:inline">
              My Location
            </span>
          </button>

          {/* Mobile filter */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ================= ERROR ================= */}
      {error && (
        <div className="relative z-20 bg-amber-50 border-b border-amber-200 px-5 py-2.5 text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>{error}</span>
          </div>

          <button
            onClick={() => setError('')}
            className="p-1 hover:bg-amber-100 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex overflow-hidden">

        {/* ================= SIDEBAR ================= */}
        <aside
          className={`
            ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
            fixed lg:static
            inset-y-0 left-0
            z-20
            top-[72px] lg:top-0
            w-full max-w-[390px]
            bg-white
            border-r border-slate-200
            flex flex-col
            transition-transform duration-300
            shadow-xl lg:shadow-none
          `}
        >

          {/* Sidebar Header */}
          <div className="px-5 py-5 border-b border-slate-100">

            <div className="flex items-center justify-between">

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    Nearby Masjids
                  </h2>

                  {!loading && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      {masjids.length}
                    </span>
                  )}
                </div>

                {userLocation && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-400">
                    <MapPin className="w-3 h-3" />
                    Within {radius} km of your location
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowSidebar(false)}
                className="lg:hidden w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Mobile Search */}
            <form
              onSubmit={handleSearch}
              className="mt-4 sm:hidden"
            >
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search masjid..."
                  className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:bg-white focus:border-emerald-400"
                />
              </div>
            </form>
          </div>

          {/* Masjid List */}
          <div className="flex-1 overflow-y-auto">

            {loading ? (
              <div className="flex flex-col items-center justify-center h-52">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                </div>

                <p className="text-sm font-semibold text-slate-700">
                  Finding nearby masjids
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Please wait...
                </p>
              </div>
            ) : masjids.length === 0 ? (
              <div className="p-10 text-center">

                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-7 h-7 text-slate-300" />
                </div>

                <p className="font-bold text-slate-700">
                  No masjids found
                </p>

                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Try increasing your search radius or search by masjid name.
                </p>
              </div>
            ) : (
              <div className="p-3 space-y-2">

                {masjids.map((m) => (

                  <button
                    key={m._id}
                    onClick={() => {
                      setSelectedMasjid(m);
                      setShowSidebar(false);
                    }}
                    className={`
                      w-full text-left
                      p-3.5
                      rounded-2xl
                      border
                      transition-all
                      group
                      ${
                        selectedMasjid?._id === m._id
                          ? 'bg-emerald-50/70 border-emerald-300 shadow-sm'
                          : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm'
                      }
                    `}
                  >

                    <div className="flex items-start gap-3">

                      {/* Icon */}
                      <div
                        className={`
                          w-11 h-11 rounded-xl
                          flex items-center justify-center
                          flex-shrink-0
                          transition-all
                          ${
                            selectedMasjid?._id === m._id
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-600/20'
                              : 'bg-emerald-50 group-hover:bg-emerald-100'
                          }
                        `}
                      >
                        <span className="text-xl">🕌</span>
                      </div>

                      <div className="flex-1 min-w-0">

                        <div className="flex items-center gap-2">

                          <h3 className="font-bold text-sm text-slate-900 truncate">
                            {m.name}
                          </h3>

                          {m.isVerified && (
                            <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          )}
                        </div>

                        {m.nameUrdu && (
                          <p
                            className="text-xs text-slate-400 truncate mt-0.5"
                            dir="rtl"
                          >
                            {m.nameUrdu}
                          </p>
                        )}

                        <p className="text-[11px] text-slate-400 mt-1 truncate">
                          {m.area ? `${m.area}, ` : ''}
                          {m.city}
                        </p>

                        <div className="flex items-center gap-3 mt-2.5">

                          {m.distanceKm !== undefined && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                              <Navigation className="w-3 h-3" />
                              {m.distanceKm} km
                            </span>
                          )}

                          {m.rating > 0 && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                              <Star className="w-3 h-3 fill-current" />
                              {m.rating}
                            </span>
                          )}

                          {m.isVerified && (
                            <span className="text-[10px] text-emerald-600 font-medium">
                              Verified
                            </span>
                          )}
                        </div>

                        {m.facilities?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">

                            {m.facilities.slice(0, 3).map((f) => (
                              <span
                                key={f}
                                className={`
                                  px-2 py-0.5
                                  rounded-md
                                  border
                                  text-[9px]
                                  font-semibold
                                  ${
                                    facilityColors[f] ||
                                    'bg-slate-50 text-slate-600 border-slate-100'
                                  }
                                `}
                              >
                                {f}
                              </span>
                            ))}

                          </div>
                        )}
                      </div>

                      <ChevronRight
                        className={`
                          w-4 h-4 mt-1 flex-shrink-0
                          transition-transform
                          ${
                            selectedMasjid?._id === m._id
                              ? 'text-emerald-600 translate-x-0.5'
                              : 'text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5'
                          }
                        `}
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* ================= MAP ================= */}
        <div className="flex-1 relative overflow-hidden">

          <MapView
            userLocation={userLocation}
            masjids={masjids}
            selectedMasjid={selectedMasjid}
            onSelectMasjid={setSelectedMasjid}
            radiusKm={radius}
          />

          {/* Map top floating info */}
          <div className="absolute top-4 left-4 z-[1000] hidden md:block">

            <div className="bg-white/90 backdrop-blur-xl border border-white/80 shadow-lg rounded-2xl px-4 py-3">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Explore nearby
                  </p>

                  <p className="text-[10px] text-slate-400">
                    {masjids.length} masjids within {radius} km
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= SELECTED MASJID ================= */}
          {selectedMasjid && (

            <div className="absolute bottom-5 left-4 right-4 lg:left-auto lg:right-5 lg:w-[410px] z-[1000]">

              <div className="bg-white/95 backdrop-blur-xl border border-white shadow-[0_15px_45px_rgba(15,23,42,0.18)] rounded-3xl overflow-hidden">

                {/* Card Header */}
                <div className="p-5">

                  <div className="flex items-start gap-3">

                    <div className="w-13 h-13 min-w-[52px] rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
                      <span className="text-2xl">🕌</span>
                    </div>

                    <div className="flex-1 min-w-0">

                      <div className="flex items-center gap-2">

                        <h3 className="font-extrabold text-base text-slate-900 truncate">
                          {selectedMasjid.name}
                        </h3>

                        {selectedMasjid.isVerified && (
                          <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        )}
                      </div>

                      {selectedMasjid.nameUrdu && (
                        <p
                          className="text-sm text-slate-400 mt-0.5"
                          dir="rtl"
                        >
                          {selectedMasjid.nameUrdu}
                        </p>
                      )}

                      <div className="flex items-start gap-1.5 mt-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />

                        <p className="text-xs text-slate-500 leading-relaxed">
                          {selectedMasjid.address}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedMasjid(null)}
                      className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>

                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-2 mt-4">

                    {selectedMasjid.distanceKm !== undefined && (
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50">
                        <Navigation className="w-3.5 h-3.5 text-emerald-600" />

                        <span className="text-[11px] font-bold text-emerald-700">
                          {selectedMasjid.distanceKm} km away
                        </span>
                      </div>
                    )}

                    {selectedMasjid.rating > 0 && (
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />

                        <span className="text-[11px] font-bold text-amber-700">
                          {selectedMasjid.rating}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50">
                      <Clock3 className="w-3.5 h-3.5 text-slate-400" />

                      <span className="text-[11px] font-semibold text-slate-600">
                        Nearby
                      </span>
                    </div>

                  </div>

                  {/* Facilities */}
                  {selectedMasjid.facilities?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">

                      {selectedMasjid.facilities.map((f) => (
                        <span
                          key={f}
                          className={`
                            px-2.5 py-1
                            rounded-lg
                            border
                            text-[10px]
                            font-semibold
                            ${
                              facilityColors[f] ||
                              'bg-slate-50 text-slate-600 border-slate-100'
                            }
                          `}
                        >
                          {f}
                        </span>
                      ))}

                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-5">

                    <Link
                      to={`/masjid/${selectedMasjid._id}`}
                      className="flex-1 h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-center text-xs font-bold shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                      View Full Details
                    </Link>

                    {selectedMasjid.location?.coordinates && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMasjid.location.coordinates[1]},${selectedMasjid.location.coordinates[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 flex items-center justify-center gap-2 text-xs font-bold hover:bg-slate-50 transition"
                      >
                        <Navigation className="w-4 h-4 text-emerald-600" />
                        <span className="hidden sm:inline">
                          Directions
                        </span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Bottom accent */}
                <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
