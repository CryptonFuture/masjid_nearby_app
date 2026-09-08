
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';

import {
  ArrowLeft,
  Star,
  Phone,
  MapPin,
  Navigation,
  Users,
  Clock,
  CheckCircle,
  Loader2,
  ShieldCheck,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

/* ================= CUSTOM MASJID ICON ================= */

const masjidIcon = L.divIcon({
  className: 'custom-masjid-icon',
  html: `
    <div style="
      width:46px;
      height:58px;
      display:flex;
      align-items:flex-start;
      justify-content:center;
      filter:drop-shadow(0 5px 7px rgba(15,118,110,0.35));
    ">
      <div style="
        width:46px;
        height:46px;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        background:linear-gradient(135deg,#10b981,#0f766e);
        border:3px solid white;
        display:flex;
        align-items:center;
        justify-content:center;
        box-shadow:0 4px 12px rgba(15,118,110,0.25);
      ">
        <div style="
          transform:rotate(45deg);
          font-size:22px;
        ">
          🕌
        </div>
      </div>
    </div>
  `,
  iconSize: [46, 58],
  iconAnchor: [23, 58],
});

/* ================= COMPONENT ================= */

const MasjidDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [masjid, setMasjid] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/masjids/${id}`)
      .then((res) => setMasjid(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-700">
            Loading masjid details...
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Please wait
          </p>
        </div>
      </div>
    );
  }

  if (!masjid) return null;

  const coords = masjid.location?.coordinates;
  const lat = coords?.[1];
  const lng = coords?.[0];

  const prayerSlots = [
    { name: 'Fajr', key: 'fajr' },
    { name: 'Dhuhr', key: 'dhuhr' },
    { name: 'Asr', key: 'asr' },
    { name: 'Maghrib', key: 'maghrib' },
    { name: 'Isha', key: 'isha' },
    { name: 'Jummah', key: 'jummah' },
  ];

  const prayerColors = {
    fajr: 'from-indigo-500 to-blue-600',
    dhuhr: 'from-amber-400 to-orange-500',
    asr: 'from-orange-400 to-amber-500',
    maghrib: 'from-rose-500 to-orange-500',
    isha: 'from-violet-500 to-indigo-600',
    jummah: 'from-emerald-500 to-teal-600',
  };

  return (
    <div className="min-h-screen bg-slate-100">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-[1000] bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-[0_4px_20px_rgba(15,23,42,0.06)]">

        <div className="max-w-6xl mx-auto px-4 md:px-6 h-[72px] flex items-center gap-4">

          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="
              w-10 h-10
              rounded-xl
              border border-slate-200
              bg-white
              flex items-center justify-center
              text-slate-600
              hover:bg-slate-50
              hover:border-slate-300
              transition
            "
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Logo */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <span className="text-xl">🕌</span>
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0">

            <h1 className="font-extrabold text-base md:text-lg text-slate-900 truncate">
              {masjid.name}
            </h1>

            {masjid.nameUrdu && (
              <p
                className="text-xs text-slate-400 truncate"
                dir="rtl"
              >
                {masjid.nameUrdu}
              </p>
            )}
          </div>

          {/* Verified */}
          {masjid.isVerified && (
            <div className="
              hidden sm:flex
              items-center gap-1.5
              px-3 py-1.5
              rounded-full
              bg-emerald-50
              border border-emerald-100
              text-emerald-700
              text-xs font-bold
            ">
              <ShieldCheck className="w-4 h-4" />
              Verified
            </div>
          )}
        </div>
      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white shadow-xl">

          {/* Background glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl" />

          <div className="absolute -bottom-32 -left-20 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />

          <div className="relative p-6 md:p-8">

            <div className="flex flex-col md:flex-row md:items-center gap-5">

              {/* Mosque icon */}
              <div className="
                w-20 h-20
                rounded-[22px]
                bg-white/10
                backdrop-blur
                border border-white/10
                flex items-center justify-center
                shadow-xl
              ">
                <span className="text-4xl">🕌</span>
              </div>

              {/* Hero content */}
              <div className="flex-1">

                <div className="flex items-center gap-2 flex-wrap">

                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    {masjid.name}
                  </h2>

                  {masjid.isVerified && (
                    <span className="
                      inline-flex items-center gap-1
                      px-2.5 py-1
                      rounded-full
                      bg-emerald-400/15
                      border border-emerald-300/20
                      text-emerald-300
                      text-[10px]
                      font-bold
                    ">
                      <CheckCircle className="w-3.5 h-3.5" />
                      VERIFIED
                    </span>
                  )}
                </div>

                {masjid.nameUrdu && (
                  <p
                    dir="rtl"
                    className="text-white/60 text-sm mt-1"
                  >
                    {masjid.nameUrdu}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 mt-4">

                  <div className="flex items-center gap-1.5 text-white/70 text-xs">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    {masjid.area
                      ? `${masjid.area}, `
                      : ''}
                    {masjid.city}
                  </div>

                  {masjid.rating > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-400 fill-current" />

                      <span className="font-bold text-sm">
                        {masjid.rating}
                      </span>

                      {masjid.reviewsCount > 0 && (
                        <span className="text-white/40 text-xs">
                          ({masjid.reviewsCount} reviews)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Hero action */}
              {lat && lng && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    h-11 px-5
                    rounded-xl
                    bg-white
                    text-slate-900
                    flex items-center justify-center gap-2
                    text-xs font-bold
                    shadow-lg
                    hover:bg-emerald-50
                    hover:-translate-y-0.5
                    transition-all
                  "
                >
                  <Navigation className="w-4 h-4 text-emerald-600" />
                  Directions
                </a>
              )}
            </div>
          </div>

          {/* Accent */}
          <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
        </section>

        {/* =================================================
            MAP
        ================================================= */}

        {lat && lng && (
          <section className="
            mt-6
            bg-white
            rounded-[24px]
            border border-slate-200
            shadow-[0_10px_35px_rgba(15,23,42,0.07)]
            overflow-hidden
          ">

            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">

              <div>
                <h2 className="font-bold text-slate-900 text-sm">
                  Location
                </h2>

                <p className="text-[11px] text-slate-400 mt-0.5">
                  Exact location of this masjid
                </p>
              </div>

              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-emerald-600" />
              </div>
            </div>

            <div className="h-72 md:h-80">

              <MapContainer
                center={[lat, lng]}
                zoom={16}
                className="h-full w-full"
                zoomControl={false}
                dragging={false}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker
                  position={[lat, lng]}
                  icon={masjidIcon}
                />
              </MapContainer>

            </div>
          </section>
        )}

        {/* =================================================
            INFO GRID
        ================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">

          {/* ================= DETAILS ================= */}

          <section className="
            bg-white
            rounded-[24px]
            border border-slate-200
            shadow-[0_8px_30px_rgba(15,23,42,0.05)]
            overflow-hidden
          ">

            <div className="px-5 py-4 border-b border-slate-100">

              <h2 className="font-bold text-slate-900">
                Masjid Details
              </h2>

              <p className="text-[11px] text-slate-400 mt-0.5">
                Information about this masjid
              </p>
            </div>

            <div className="p-5 space-y-1">

              {/* Address */}
              <div className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition">

                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    Address
                  </p>

                  <p className="text-sm text-slate-800 mt-1">
                    {masjid.address}
                  </p>

                  <p className="text-xs text-slate-400 mt-0.5">
                    {masjid.area
                      ? `${masjid.area}, `
                      : ''}
                    {masjid.city}
                  </p>
                </div>
              </div>

              {/* Phone */}
              {masjid.phone && (
                <div className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition">

                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                      Contact
                    </p>

                    <a
                      href={`tel:${masjid.phone}`}
                      className="text-sm text-emerald-700 font-semibold hover:underline mt-1 block"
                    >
                      {masjid.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Capacity */}
              {masjid.capacity > 0 && (
                <div className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition">

                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                      Capacity
                    </p>

                    <p className="text-sm text-slate-800 font-semibold mt-1">
                      ~{masjid.capacity.toLocaleString()} people
                    </p>
                  </div>
                </div>
              )}

              {/* Rating */}
              {masjid.rating > 0 && (
                <div className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition">

                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-amber-500 fill-current" />
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                      Rating
                    </p>

                    <div className="flex items-center gap-2 mt-1">

                      <span className="text-sm font-bold text-slate-800">
                        {masjid.rating} / 5
                      </span>

                      {masjid.reviewsCount > 0 && (
                        <span className="text-xs text-slate-400">
                          {masjid.reviewsCount} reviews
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              {masjid.description && (
                <div className="mt-3 pt-4 border-t border-slate-100">

                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">
                    About this masjid
                  </p>

                  <p className="text-sm text-slate-600 leading-7">
                    {masjid.description}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ================= PRAYER TIMES ================= */}

          <section className="
            bg-white
            rounded-[24px]
            border border-slate-200
            shadow-[0_8px_30px_rgba(15,23,42,0.05)]
            overflow-hidden
          ">

            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">

              <div>
                <h2 className="font-bold text-slate-900">
                  Prayer Times
                </h2>

                <p className="text-[11px] text-slate-400 mt-0.5">
                  Today's prayer schedule
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
            </div>

            <div className="p-4">

              {masjid.prayerTimes ? (
                <div className="grid grid-cols-2 gap-2">

                  {prayerSlots.map(({ name, key }) => {

                    if (!masjid.prayerTimes[key]) {
                      return null;
                    }

                    return (
                      <div
                        key={key}
                        className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 hover:bg-white hover:shadow-md transition-all"
                      >

                        <div className="flex items-center justify-between">

                          <div className="flex items-center gap-2">

                            <div
                              className={`
                                w-8 h-8
                                rounded-lg
                                bg-gradient-to-br
                                ${prayerColors[key]}
                                flex items-center justify-center
                                shadow-sm
                              `}
                            >
                              <Clock className="w-3.5 h-3.5 text-white" />
                            </div>

                            <span className="text-xs font-bold text-slate-700">
                              {name}
                            </span>
                          </div>

                        </div>

                        <p className="text-base font-extrabold text-emerald-700 mt-3">
                          {masjid.prayerTimes[key]}
                        </p>

                        <div className="absolute -right-5 -bottom-5 w-16 h-16 rounded-full bg-emerald-500/5 group-hover:bg-emerald-500/10 transition" />

                      </div>
                    );
                  })}

                </div>
              ) : (
                <div className="py-12 text-center">

                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                    <Clock className="w-6 h-6 text-slate-300" />
                  </div>

                  <p className="text-sm font-semibold text-slate-600 mt-3">
                    Prayer times unavailable
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    No schedule has been added yet.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* =================================================
            FACILITIES
        ================================================= */}

        {masjid.facilities?.length > 0 && (
          <section className="
            mt-5
            bg-white
            rounded-[24px]
            border border-slate-200
            shadow-[0_8px_30px_rgba(15,23,42,0.05)]
            p-5
          ">

            <div className="flex items-center gap-3 mb-4">

              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Facilities & Services
                </h2>

                <p className="text-[11px] text-slate-400">
                  Available at this masjid
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">

              {masjid.facilities.map((facility) => (
                <span
                  key={facility}
                  className="
                    px-3 py-2
                    rounded-xl
                    bg-emerald-50
                    border border-emerald-100
                    text-emerald-700
                    text-xs
                    font-semibold
                    hover:bg-emerald-100
                    transition
                  "
                >
                  ✓ {facility}
                </span>
              ))}

            </div>
          </section>
        )}

        {/* =================================================
            ACTIONS
        ================================================= */}

        <section className="
          mt-6
          mb-8
          rounded-[24px]
          bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700
          p-5 md:p-6
          shadow-xl shadow-emerald-700/15
          relative overflow-hidden
        ">

          <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex flex-col sm:flex-row gap-3">

            {lat && lng && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex-1
                  h-12
                  rounded-xl
                  bg-white
                  text-slate-900
                  flex items-center justify-center gap-2
                  text-sm
                  font-bold
                  shadow-lg
                  hover:bg-emerald-50
                  hover:-translate-y-0.5
                  transition-all
                "
              >
                <Navigation className="w-5 h-5 text-emerald-600" />
                Get Directions
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            )}

            <Link
              to="/"
              className="
                h-12
                px-6
                rounded-xl
                border border-white/25
                bg-white/10
                backdrop-blur
                text-white
                flex items-center justify-center gap-2
                text-sm
                font-bold
                hover:bg-white/20
                transition
              "
            >
              <MapPin className="w-4 h-4" />
              Back to Map
            </Link>

          </div>
        </section>

      </main>
    </div>
  );
};

export default MasjidDetail;
