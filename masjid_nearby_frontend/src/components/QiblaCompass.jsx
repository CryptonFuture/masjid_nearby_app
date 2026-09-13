import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Compass,
  MapPin,
  Navigation,
  Smartphone,
  Loader2,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  LocateFixed,
  Move,
} from 'lucide-react';

const KAABA_LAT = 21.422487;
const KAABA_LNG = 39.826206;

/* =========================================================
   HELPERS
========================================================= */

const toRadians = (degree) => {
  return (degree * Math.PI) / 180;
};

const toDegrees = (radian) => {
  return (radian * 180) / Math.PI;
};

const normalizeHeading = (heading) => {
  return ((heading % 360) + 360) % 360;
};

/*
 * Calculate Qibla bearing from current location
 * to Kaaba.
 */
const calculateQiblaBearing = (latitude, longitude) => {
  const lat1 = toRadians(latitude);
  const lat2 = toRadians(KAABA_LAT);

  const deltaLongitude = toRadians(
    KAABA_LNG - longitude
  );

  const y = Math.sin(deltaLongitude);

  const x =
    Math.cos(lat1) * Math.tan(lat2) -
    Math.sin(lat1) * Math.cos(deltaLongitude);

  const bearing = toDegrees(
    Math.atan2(y, x)
  );

  return normalizeHeading(bearing);
};

const getDirectionName = (degree) => {
  const directions = [
    'North',
    'North-East',
    'East',
    'South-East',
    'South',
    'South-West',
    'West',
    'North-West',
  ];

  const index =
    Math.round(degree / 45) % 8;

  return directions[index];
};

/*
 * Smooth heading movement.
 * Prevents the compass from jumping from 359 -> 0.
 */
const smoothHeading = (previous, next) => {
  let difference = next - previous;

  if (difference > 180) {
    difference -= 360;
  }

  if (difference < -180) {
    difference += 360;
  }

  return normalizeHeading(
    previous + difference * 0.35
  );
};

/* =========================================================
   COMPONENT
========================================================= */

const QiblaCompass = ({ userLocation }) => {
  const [liveLocation, setLiveLocation] =
    useState(userLocation || null);

  const [heading, setHeading] =
    useState(0);

  const [compassSupported, setCompassSupported] =
    useState(true);

  const [permissionRequired, setPermissionRequired] =
    useState(false);

  const [permissionLoading, setPermissionLoading] =
    useState(false);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [locationError, setLocationError] =
    useState('');

  const watchIdRef = useRef(null);

  const headingRef = useRef(0);

  /* =========================================================
     INITIAL LOCATION FROM HOME
  ========================================================= */

  useEffect(() => {
    if (
      userLocation?.lat != null &&
      userLocation?.lng != null
    ) {
      setLiveLocation({
        lat: userLocation.lat,
        lng: userLocation.lng,
      });
    }
  }, [userLocation]);

  /* =========================================================
     LIVE GPS LOCATION
     
     This continuously watches the user's movement.
  ========================================================= */

  useEffect(() => {
    if (
      typeof navigator === 'undefined' ||
      !navigator.geolocation
    ) {
      setLocationError(
        'Live location is not supported by this browser.'
      );

      return;
    }

    setLocationLoading(true);

    watchIdRef.current =
      navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          setLiveLocation(newLocation);

          setLocationLoading(false);
          setLocationError('');
        },
        (error) => {
          console.error(
            'Live location error:',
            error
          );

          setLocationLoading(false);

          if (error.code === 1) {
            setLocationError(
              'Location permission was denied.'
            );
          } else if (error.code === 2) {
            setLocationError(
              'Unable to determine your location.'
            );
          } else {
            setLocationError(
              'Unable to update your live location.'
            );
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 1000,
          timeout: 10000,
        }
      );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(
          watchIdRef.current
        );
      }
    };
  }, []);

  /* =========================================================
     QIBLA BEARING
     
     IMPORTANT:
     This recalculates whenever liveLocation changes.
  ========================================================= */

  const qiblaBearing = useMemo(() => {
    if (
      liveLocation?.lat == null ||
      liveLocation?.lng == null
    ) {
      return null;
    }

    return calculateQiblaBearing(
      liveLocation.lat,
      liveLocation.lng
    );
  }, [liveLocation]);

  /* =========================================================
     DEVICE COMPASS
  ========================================================= */

  const handleOrientation = (event) => {
    let compassHeading = null;

    /*
     * iPhone / iOS Safari
     */
    if (
      typeof event.webkitCompassHeading ===
      'number'
    ) {
      compassHeading =
        event.webkitCompassHeading;
    }

    /*
     * Android / Chrome
     */
    else if (
      typeof event.alpha === 'number'
    ) {
      compassHeading =
        360 - event.alpha;
    }

    if (
      compassHeading !== null &&
      Number.isFinite(compassHeading)
    ) {
      const normalized =
        normalizeHeading(compassHeading);

      const smoothed =
        smoothHeading(
          headingRef.current,
          normalized
        );

      headingRef.current = smoothed;

      setHeading(smoothed);
    }
  };

  /* =========================================================
     START COMPASS
  ========================================================= */

  const startOrientationListener = () => {
    if (
      typeof window === 'undefined' ||
      typeof window.DeviceOrientationEvent ===
        'undefined'
    ) {
      setCompassSupported(false);
      return;
    }

    window.addEventListener(
      'deviceorientationabsolute',
      handleOrientation,
      true
    );

    window.addEventListener(
      'deviceorientation',
      handleOrientation,
      true
    );
  };

  /* =========================================================
     STOP COMPASS
  ========================================================= */

  const stopOrientationListener = () => {
    if (
      typeof window === 'undefined'
    ) {
      return;
    }

    window.removeEventListener(
      'deviceorientationabsolute',
      handleOrientation,
      true
    );

    window.removeEventListener(
      'deviceorientation',
      handleOrientation,
      true
    );
  };

  /* =========================================================
     REQUEST SENSOR PERMISSION
  ========================================================= */

  const requestCompassPermission = async () => {
    try {
      setPermissionLoading(true);

      if (
        typeof DeviceOrientationEvent !==
          'undefined' &&
        typeof DeviceOrientationEvent.requestPermission ===
          'function'
      ) {
        const permission =
          await DeviceOrientationEvent.requestPermission();

        if (permission === 'granted') {
          setPermissionRequired(false);

          startOrientationListener();
        } else {
          setCompassSupported(false);
        }
      } else {
        setPermissionRequired(false);

        startOrientationListener();
      }
    } catch (error) {
      console.error(
        'Compass permission error:',
        error
      );

      setCompassSupported(false);
    } finally {
      setPermissionLoading(false);
    }
  };

  /* =========================================================
     INITIAL COMPASS SETUP
  ========================================================= */

  useEffect(() => {
    if (
      typeof window === 'undefined'
    ) {
      return;
    }

    if (
      typeof window.DeviceOrientationEvent ===
      'undefined'
    ) {
      setCompassSupported(false);
      return;
    }

    if (
      typeof DeviceOrientationEvent.requestPermission ===
      'function'
    ) {
      /*
       * iPhone requires user interaction.
       */
      setPermissionRequired(true);
    } else {
      startOrientationListener();
    }

    return () => {
      stopOrientationListener();
    };
  }, []);

  /* =========================================================
     LOADING
  ========================================================= */

  if (!liveLocation) {
    return (
      <div className="w-full rounded-[30px] overflow-hidden bg-white">
        <div className="p-10 text-center">

          <div className="relative mx-auto w-20 h-20">

            <div className="absolute inset-0 rounded-3xl bg-emerald-500/10 animate-pulse" />

            <div className="absolute inset-2 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-600/20">
              <MapPin className="w-8 h-8 text-white" />
            </div>

          </div>

          <h2 className="mt-6 text-xl font-black text-slate-900">
            Finding Your Location
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500 max-w-xs mx-auto">
            Getting your live location to calculate
            the Qibla direction.
          </p>

          <Loader2 className="w-5 h-5 mx-auto mt-5 text-emerald-600 animate-spin" />

        </div>
      </div>
    );
  }

  if (qiblaBearing === null) {
    return (
      <div className="w-full bg-white p-10 text-center">

        <Loader2 className="w-8 h-8 mx-auto animate-spin text-emerald-600" />

        <p className="mt-4 text-sm font-semibold text-slate-600">
          Calculating Qibla direction...
        </p>

      </div>
    );
  }

  /* =========================================================
     COMPASS CALCULATIONS
  ========================================================= */

  const arrowRotation =
    qiblaBearing - heading;

  const directionName =
    getDirectionName(qiblaBearing);

  const headingRounded =
    Math.round(heading);

  const qiblaRounded =
    Math.round(qiblaBearing);

  const rotationDifference =
    ((qiblaBearing - heading + 540) % 360) -
    180;

  const isFacingQibla =
    Math.abs(rotationDifference) <= 5;

  const turnText = isFacingQibla
    ? 'You are facing the Qibla'
    : rotationDifference > 0
      ? `Turn right ${Math.round(
          Math.abs(rotationDifference)
        )}°`
      : `Turn left ${Math.round(
          Math.abs(rotationDifference)
        )}°`;

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="w-full overflow-hidden bg-white">

      {/* =====================================================
          PREMIUM HEADER
      ===================================================== */}

      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-900 px-6 pt-7 pb-8">

        <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full bg-emerald-400/20 blur-3xl" />

        <div className="absolute -bottom-24 -left-20 w-56 h-56 rounded-full bg-teal-400/10 blur-3xl" />

        <div className="absolute top-5 right-8 w-20 h-20 rounded-full border border-white/10" />

        <div className="absolute top-8 right-11 w-14 h-14 rounded-full border border-white/10" />

        <div className="relative z-10 text-center">

          <div className="relative mx-auto w-16 h-16">

            <div className="absolute inset-0 rounded-[22px] bg-emerald-400/20 blur-xl" />

            <div className="relative w-16 h-16 rounded-[22px] bg-white/10 border border-white/15 backdrop-blur-xl flex items-center justify-center shadow-2xl">

              <span className="text-3xl">
                🕋
              </span>

            </div>

          </div>

          <div className="mt-5 flex items-center justify-center gap-2">

            <h2 className="text-2xl font-black tracking-tight text-white">
              Live Qibla Compass
            </h2>

            <Sparkles className="w-4 h-4 text-emerald-300" />

          </div>

          <p className="mt-2 text-xs text-emerald-100/70">
            Move anywhere and find the Qibla instantly
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">

            <span
              className={`w-2 h-2 rounded-full ${
                isFacingQibla
                  ? 'bg-emerald-300'
                  : 'bg-amber-300'
              }`}
            />

            <span className="text-[11px] font-semibold text-white/90">
              {isFacingQibla
                ? 'Qibla aligned'
                : 'Live compass active'}
            </span>

          </div>

        </div>
      </div>

      {/* =====================================================
          LIVE LOCATION STATUS
      ===================================================== */}

      <div className="mx-5 -mt-4 relative z-30">

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-[0_10px_35px_rgba(15,23,42,0.12)]">

          <div className="flex items-center gap-3">

            <div className="relative w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">

              <LocateFixed className="w-5 h-5 text-emerald-600" />

              {locationLoading && (
                <span className="absolute inset-0 rounded-xl border-2 border-emerald-400 animate-ping opacity-30" />
              )}

            </div>

            <div className="flex-1 min-w-0">

              <p className="text-xs font-extrabold text-slate-900">
                Live Location Tracking
              </p>

              <p className="text-[10px] text-slate-500 mt-0.5">
                Qibla updates automatically as you move
              </p>

            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">

              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />

              <span className="text-[9px] font-bold text-emerald-700">
                LIVE
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          COMPASS PERMISSION
      ===================================================== */}

      {permissionRequired && (

        <div className="mx-5 mt-4">

          <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">

                <Smartphone className="w-5 h-5 text-amber-600" />

              </div>

              <div className="flex-1 min-w-0">

                <p className="text-xs font-extrabold text-slate-900">
                  Enable motion compass
                </p>

                <p className="text-[10px] text-slate-500 mt-0.5 leading-4">
                  Allow motion access so the Qibla arrow
                  follows your phone movement.
                </p>

              </div>

              <button
                onClick={requestCompassPermission}
                disabled={permissionLoading}
                className="shrink-0 h-9 px-3.5 rounded-xl bg-slate-900 text-white text-[10px] font-bold hover:bg-slate-800 transition flex items-center gap-1.5"
              >

                {permissionLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Compass className="w-3.5 h-3.5" />
                )}

                Enable

              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          MAIN COMPASS
      ===================================================== */}

      <div className="px-5 pt-7 pb-6">

        <div className="relative mx-auto w-[285px] h-[285px] sm:w-[310px] sm:h-[310px]">

          {/* Outer glow */}

          <div className="absolute -inset-5 rounded-full bg-emerald-500/10 blur-2xl" />

          {/* Outer ring */}

          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-100 via-white to-slate-200 shadow-[0_20px_55px_rgba(15,23,42,0.15)]" />

          {/* Dark ring */}

          <div className="absolute inset-[9px] rounded-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 shadow-[inset_0_0_35px_rgba(0,0,0,0.45)]" />

          {/* Compass face */}

          <div className="absolute inset-[18px] rounded-full bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-[inset_0_0_30px_rgba(15,23,42,0.08)] overflow-hidden">

            <div className="absolute inset-4 rounded-full border border-slate-200" />

            <div className="absolute inset-10 rounded-full border border-slate-100" />

            {/* =================================================
                ROTATING COMPASS DIAL
            ================================================= */}

            <div
              className="absolute inset-0 transition-transform duration-150 ease-out"
              style={{
                transform: `rotate(${-heading}deg)`,
              }}
            >

              {[...Array(72)].map(
                (_, index) => {

                  const isMajor =
                    index % 9 === 0;

                  const isMedium =
                    index % 3 === 0;

                  return (
                    <div
                      key={index}
                      className="absolute left-1/2 top-2 origin-[50%_132px] sm:origin-[50%_145px]"
                      style={{
                        height: isMajor
                          ? '13px'
                          : isMedium
                            ? '8px'
                            : '4px',

                        width: isMajor
                          ? '2px'
                          : '1px',

                        backgroundColor:
                          isMajor
                            ? '#475569'
                            : isMedium
                              ? '#94a3b8'
                              : '#cbd5e1',

                        transform:
                          `translateX(-50%) rotate(${index * 5}deg)`,
                      }}
                    />
                  );
                }
              )}

            </div>

            {/* =================================================
                CARDINAL DIRECTIONS
            ================================================= */}

            <div className="absolute top-5 left-1/2 -translate-x-1/2 flex flex-col items-center">

              <span className="text-xs font-black text-slate-800">
                N
              </span>

              <span className="mt-1 w-1 h-3 rounded-full bg-slate-500" />

            </div>

            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center">

              <span className="mr-1 w-3 h-1 rounded-full bg-slate-400" />

              <span className="text-xs font-black text-slate-800">
                E
              </span>

            </div>

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center">

              <span className="mb-1 w-1 h-3 rounded-full bg-slate-400" />

              <span className="text-xs font-black text-slate-800">
                S
              </span>

            </div>

            <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center">

              <span className="text-xs font-black text-slate-800">
                W
              </span>

              <span className="ml-1 w-3 h-1 rounded-full bg-slate-400" />

            </div>

            {/* =================================================
                QIBLA ARROW
            ================================================= */}

            <div
              className="absolute inset-0 flex items-center justify-center transition-transform duration-150 ease-out"
              style={{
                transform:
                  `rotate(${arrowRotation}deg)`,
              }}
            >

              <div className="relative w-12 h-[195px] flex flex-col items-center">

                {/* Glow */}

                <div className="absolute top-0 w-14 h-14 rounded-full bg-emerald-400/25 blur-xl" />

                {/* Arrow */}

                <div className="relative z-10">

                  <div
                    className="w-0 h-0"
                    style={{
                      borderLeft:
                        '17px solid transparent',

                      borderRight:
                        '17px solid transparent',

                      borderBottom:
                        '38px solid #059669',

                      filter:
                        'drop-shadow(0 4px 5px rgba(5,150,105,0.35))',
                    }}
                  />

                </div>

                {/* Body */}

                <div className="w-[7px] flex-1 rounded-full bg-gradient-to-b from-emerald-500 via-teal-500 to-emerald-700 shadow-[0_0_18px_rgba(16,185,129,0.4)]" />

              </div>

            </div>

            {/* =================================================
                CENTER KAABA
            ================================================= */}

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">

              <div className="relative">

                <div className="absolute -inset-3 rounded-full bg-emerald-400/25 blur-lg" />

                <div className="relative w-16 h-16 rounded-full bg-white border-[5px] border-emerald-500 shadow-[0_6px_25px_rgba(15,23,42,0.25)] flex items-center justify-center">

                  <span className="text-2xl">
                    🕋
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            TURN STATUS
        ===================================================== */}

        <div className="mt-6 text-center">

          <div
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-full border shadow-sm ${
              isFacingQibla
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >

            {isFacingQibla ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}

            <span className="text-xs font-bold">
              {turnText}
            </span>

          </div>

        </div>

        {/* =====================================================
            MOVEMENT INFO
        ===================================================== */}

        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400">

          <Move className="w-3.5 h-3.5" />

          <span>
            Rotate your phone to move the compass
          </span>

        </div>

        {/* =====================================================
            STATS
        ===================================================== */}

        <div className="grid grid-cols-3 gap-2.5 mt-5">

          {/* QIBLA */}

          <div className="relative overflow-hidden rounded-2xl bg-emerald-50 border border-emerald-100 p-3 text-center">

            <Navigation className="relative mx-auto w-4 h-4 text-emerald-600" />

            <p className="mt-1.5 text-[9px] uppercase tracking-wider font-bold text-emerald-600">
              Qibla
            </p>

            <p className="mt-0.5 text-lg font-black text-emerald-800">
              {qiblaRounded}°
            </p>

          </div>

          {/* HEADING */}

          <div className="relative overflow-hidden rounded-2xl bg-slate-50 border border-slate-200 p-3 text-center">

            <Compass className="mx-auto w-4 h-4 text-slate-500" />

            <p className="mt-1.5 text-[9px] uppercase tracking-wider font-bold text-slate-500">
              Heading
            </p>

            <p className="mt-0.5 text-lg font-black text-slate-800">
              {headingRounded}°
            </p>

          </div>

          {/* DIRECTION */}

          <div className="relative overflow-hidden rounded-2xl bg-teal-50 border border-teal-100 p-3 text-center">

            <MapPin className="relative mx-auto w-4 h-4 text-teal-600" />

            <p className="mt-1.5 text-[9px] uppercase tracking-wider font-bold text-teal-600">
              Direction
            </p>

            <p className="mt-1 text-[11px] font-black text-teal-800 truncate">
              {directionName}
            </p>

          </div>

        </div>

        {/* =====================================================
            LIVE LOCATION CARD
        ===================================================== */}

        <div className="mt-3 p-3.5 rounded-2xl bg-slate-950 text-white shadow-lg">

          <div className="flex items-center gap-3">

            <div className="relative w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">

              <MapPin className="w-4 h-4 text-emerald-300" />

              <span className="absolute -right-0.5 -top-0.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />

            </div>

            <div className="flex-1 min-w-0">

              <p className="text-[9px] uppercase tracking-wider font-bold text-white/40">
                Live Location
              </p>

              <p className="mt-0.5 text-[11px] font-semibold text-white/90 truncate">
                {liveLocation.lat.toFixed(6)}
                {' , '}
                {liveLocation.lng.toFixed(6)}
              </p>

            </div>

            <div className="flex items-center gap-1">

              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />

              <span className="text-[9px] font-bold text-emerald-300">
                GPS
              </span>

            </div>

          </div>

        </div>

        {/* =====================================================
            LOCATION ERROR
        ===================================================== */}

        {locationError && (

          <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-100">

            <p className="text-[10px] font-semibold text-red-700 text-center">
              {locationError}
            </p>

          </div>

        )}

        {/* =====================================================
            COMPASS ERROR
        ===================================================== */}

        {!compassSupported && (

          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-center">

            <p className="text-[10px] font-semibold text-red-700">
              Device motion compass is not supported
              by this browser.
            </p>

          </div>

        )}

      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">

        <div className="flex items-center justify-center gap-2">

          <span className="text-[9px] text-slate-400">
            Live direction calculated toward
          </span>

          <span className="text-[9px] font-bold text-slate-600">
            Kaaba · Makkah
          </span>

        </div>

      </div>

      <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

    </div>
  );
};

export default QiblaCompass;