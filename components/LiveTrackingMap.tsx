'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  Navigation, 
  MapPin, 
  Phone, 
  Clock, 
  Compass, 
  ShieldCheck, 
  AlertTriangle,
  LocateFixed,
  Radio,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { getApiBaseUrl } from '@/lib/apiBase';

interface LatLng {
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  updatedAt?: string;
}

interface LiveTrackingMapProps {
  bookingId: string;
  status: string;
  userRole?: 'customer' | 'provider' | 'admin';
  providerName?: string;
  providerPhone?: string;
  providerPhoto?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  initialProviderLocation?: LatLng | null;
  initialCustomerLocation?: LatLng | null;
  onStatusChange?: (newStatus: string) => void;
}

// Haversine formula
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

function calculateETA(distanceKm: number | null): string {
  if (distanceKm === null || distanceKm === undefined) return 'Calculating...';
  if (distanceKm < 0.1) return 'Arrived at location!';
  const minutes = Math.max(2, Math.round((distanceKm / 25) * 60));
  if (minutes < 60) return `~${minutes} mins`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `~${h}h ${m}m`;
}

export default function LiveTrackingMap({
  bookingId,
  status,
  userRole = 'customer',
  providerName = 'Specialist',
  providerPhone,
  providerPhoto,
  customerName = 'Customer',
  customerPhone,
  customerAddress,
  initialProviderLocation,
  initialCustomerLocation,
  onStatusChange
}: LiveTrackingMapProps) {
  const API_URL = getApiBaseUrl();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const providerMarkerRef = useRef<any>(null);
  const customerMarkerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Defaults centered around Srinagar / Kashmir
  const defaultCustomerCoords: LatLng = { lat: 34.0837, lng: 74.7973 };
  const defaultProviderCoords: LatLng = { lat: 34.0720, lng: 74.8210 };

  const [providerLoc, setProviderLoc] = useState<LatLng | null>(
    initialProviderLocation || defaultProviderCoords
  );
  const [customerLoc, setCustomerLoc] = useState<LatLng | null>(
    initialCustomerLocation || defaultCustomerCoords
  );
  const [isSharingLocation, setIsSharingLocation] = useState<boolean>(false);
  const [locationPermissionError, setLocationPermissionError] = useState<string | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [eta, setEta] = useState<string>('Calculating...');
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
  const [isMapReady, setIsMapReady] = useState<boolean>(false);

  const isTrackingActive = ['accepted', 'on-the-way', 'in-progress'].includes(status);

  // Update distance & ETA whenever coordinates change
  useEffect(() => {
    if (providerLoc && customerLoc) {
      const d = calculateDistanceKm(providerLoc.lat, providerLoc.lng, customerLoc.lat, customerLoc.lng);
      setDistanceKm(d);
      setEta(calculateETA(d));
    }
  }, [providerLoc, customerLoc]);

  // 1. Initialize Leaflet Map safely in React 19 / Next.js
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      // Dynamically import Leaflet
      const L = (await import('leaflet')).default;

      // Add Leaflet CSS if not already present
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const pLat = providerLoc?.lat || defaultProviderCoords.lat;
      const pLng = providerLoc?.lng || defaultProviderCoords.lng;
      const cLat = customerLoc?.lat || defaultCustomerCoords.lat;
      const cLng = customerLoc?.lng || defaultCustomerCoords.lng;

      const map = L.map(mapContainerRef.current, {
        center: [(pLat + cLat) / 2, (pLng + cLng) / 2],
        zoom: 13,
        zoomControl: true,
        attributionControl: false
      });

      // OpenStreetMap clean tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Custom Specialist Marker Icon (Orange with Tech emoji)
      const specialistIcon = L.divIcon({
        className: 'custom-specialist-pin',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; background: linear-gradient(135deg, #ea580c, #f97316); border-radius: 50%; box-shadow: 0 4px 14px rgba(234, 88, 12, 0.45); border: 3px solid white; transform: translate(-50%, -50%);">
            <span style="font-size: 20px;">🛠️</span>
            <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #ea580c;"></div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [0, 0]
      });

      // Custom Customer Marker Icon (Blue with House pin)
      const customerIcon = L.divIcon({
        className: 'custom-customer-pin',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; background: linear-gradient(135deg, #0f62c9, #2563eb); border-radius: 50%; box-shadow: 0 4px 14px rgba(15, 98, 201, 0.45); border: 3px solid white; transform: translate(-50%, -50%);">
            <span style="font-size: 20px;">🏠</span>
            <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #0f62c9;"></div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [0, 0]
      });

      const providerMarker = L.marker([pLat, pLng], { icon: specialistIcon })
        .addTo(map)
        .bindPopup(`<b>${providerName}</b><br/><span style="color:#ea580c;">Verified Specialist</span>`);

      const customerMarker = L.marker([cLat, cLng], { icon: customerIcon })
        .addTo(map)
        .bindPopup(`<b>${customerName}</b><br/><span>Doorstep Location</span>`);

      const polyline = L.polyline([[pLat, pLng], [cLat, cLng]], {
        color: '#0f62c9',
        weight: 4,
        opacity: 0.75,
        dashArray: '8, 8'
      }).addTo(map);

      // Fit both pins inside the screen
      map.fitBounds([[pLat, pLng], [cLat, cLng]], {
        padding: [60, 60],
        maxZoom: 15
      });

      mapInstanceRef.current = map;
      providerMarkerRef.current = providerMarker;
      customerMarkerRef.current = customerMarker;
      polylineRef.current = polyline;

      if (isMounted) setIsMapReady(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map marker positions when state updates
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    if (providerLoc && providerMarkerRef.current) {
      providerMarkerRef.current.setLatLng([providerLoc.lat, providerLoc.lng]);
    }
    if (customerLoc && customerMarkerRef.current) {
      customerMarkerRef.current.setLatLng([customerLoc.lat, customerLoc.lng]);
    }
    if (providerLoc && customerLoc && polylineRef.current) {
      polylineRef.current.setLatLngs([
        [providerLoc.lat, providerLoc.lng],
        [customerLoc.lat, customerLoc.lng]
      ]);
    }
  }, [providerLoc, customerLoc, isMapReady]);

  // 2. Connect Socket.IO for Real-time location events
  useEffect(() => {
    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsSocketConnected(true);
      socket.emit('join_booking', bookingId);
    });

    socket.on('location_updated', (data) => {
      if (data && data.bookingId === bookingId) {
        if (data.role === 'provider' || data.providerLiveLocation) {
          const loc = data.providerLiveLocation || { lat: data.lat, lng: data.lng, heading: data.heading, speed: data.speed };
          setProviderLoc(loc);
        }
        if (data.role === 'customer' || data.customerLiveLocation) {
          const loc = data.customerLiveLocation || { lat: data.lat, lng: data.lng };
          setCustomerLoc(loc);
        }
      }
    });

    socket.on('status_updated', (data) => {
      if (data && data.bookingId === bookingId) {
        if (onStatusChange) onStatusChange(data.status);
      }
    });

    socket.on('disconnect', () => {
      setIsSocketConnected(false);
    });

    return () => {
      socket.emit('leave_booking', bookingId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [API_URL, bookingId, onStatusChange]);

  // 3. Fallback Poll: Fetch live location periodically if socket is silent
  useEffect(() => {
    if (!isTrackingActive) return;

    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/bookings/${bookingId}/live-location`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (data.success) {
          if (data.providerLiveLocation) setProviderLoc(data.providerLiveLocation);
          if (data.customerLiveLocation) setCustomerLoc(data.customerLiveLocation);
          if (data.distanceKm !== undefined) setDistanceKm(data.distanceKm);
          if (data.eta) setEta(data.eta);
        }
      } catch (err) {
        // silent fallback fail
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [API_URL, bookingId, isTrackingActive]);

  // 4. GPS Geolocation Sharing (Browser watchPosition)
  const sendLocationUpdate = useCallback(async (lat: number, lng: number, heading = 0, speed = 0) => {
    // 1. Emit through socket for immediate sub-second broadcast
    if (socketRef.current) {
      socketRef.current.emit('update_location', {
        bookingId,
        role: userRole === 'provider' ? 'provider' : 'customer',
        lat,
        lng,
        heading,
        speed
      });
    }

    // 2. Persist to DB through REST API
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/bookings/${bookingId}/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          role: userRole === 'provider' ? 'provider' : 'customer',
          lat,
          lng,
          heading,
          speed
        })
      });
    } catch (err) {
      console.error('Error posting location:', err);
    }
  }, [API_URL, bookingId, userRole]);

  const toggleLocationSharing = () => {
    if (isSharingLocation) {
      // Stop sharing
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsSharingLocation(false);
      return;
    }

    if (!navigator.geolocation) {
      setLocationPermissionError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationPermissionError(null);

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, heading, speed } = pos.coords;
        if (userRole === 'provider') {
          setProviderLoc({ lat: latitude, lng: longitude, heading: heading || 0, speed: speed || 0 });
        } else {
          setCustomerLoc({ lat: latitude, lng: longitude });
        }
        sendLocationUpdate(latitude, longitude, heading || 0, speed || 0);
        setIsSharingLocation(true);
      },
      (err) => {
        console.warn('Geolocation watch error:', err);
        let msg = 'Unable to access your GPS location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location access in your browser settings to share your live GPS.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'GPS signal is currently unavailable.';
        }
        setLocationPermissionError(msg);
        setIsSharingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000
      }
    );

    watchIdRef.current = watchId;
  };

  // Recenter map on both locations
  const handleRecenter = () => {
    if (!mapInstanceRef.current || !providerLoc || !customerLoc) return;
    mapInstanceRef.current.fitBounds(
      [
        [providerLoc.lat, providerLoc.lng],
        [customerLoc.lat, customerLoc.lng]
      ],
      { padding: [50, 50], maxZoom: 16 }
    );
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl">
      {/* Live Tracking Header Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-6 py-4 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isTrackingActive ? 'animate-ping bg-emerald-400' : 'bg-slate-400'}`} />
              <span className={`relative inline-flex h-3 w-3 rounded-full ${isTrackingActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight">Real-Time GPS Tracking</h3>
                {isSocketConnected && (
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    Live Radar
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                {isTrackingActive 
                  ? 'Both customer and specialist locations update in real time.' 
                  : `Location sharing inactive for booking status: ${status}`}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          {isTrackingActive && (
            <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-2 backdrop-blur">
              <div className="text-center">
                <p className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Distance</p>
                <p className="text-sm font-extrabold text-amber-300">
                  {distanceKm !== null ? `${distanceKm} km` : 'Calculating'}
                </p>
              </div>
              <div className="h-6 w-px bg-white/20" />
              <div className="text-center">
                <p className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Arrival ETA</p>
                <p className="text-sm font-extrabold text-emerald-300">{eta}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Permission / Denied Notice if any */}
      {locationPermissionError && (
        <div className="flex items-center gap-2 bg-amber-50 px-5 py-2.5 text-xs font-semibold text-amber-800 border-b border-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>{locationPermissionError}</span>
        </div>
      )}

      {/* Map Interactive Viewport */}
      <div className="relative">
        <div 
          ref={mapContainerRef} 
          className="h-[360px] sm:h-[420px] w-full bg-slate-100 z-0"
        />

        {/* Floating Controls Overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-[400]">
          <button
            type="button"
            onClick={handleRecenter}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-lg text-slate-700 hover:bg-slate-50 transition active:scale-95 border border-slate-200"
            title="Recenter Map"
          >
            <Compass className="h-5 w-5 text-blue-600" />
          </button>
          <button
            type="button"
            onClick={toggleLocationSharing}
            className={`flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-bold shadow-lg transition active:scale-95 border ${
              isSharingLocation 
                ? 'bg-emerald-600 text-white border-emerald-700' 
                : 'bg-white text-slate-800 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <LocateFixed className={`h-4 w-4 ${isSharingLocation ? 'animate-pulse text-white' : 'text-orange-500'}`} />
            <span>{isSharingLocation ? 'Sharing GPS' : 'Share My GPS'}</span>
          </button>
        </div>

        {/* Map Legend Floating Card */}
        <div className="absolute bottom-4 left-4 z-[400] flex items-center gap-3 rounded-2xl bg-white/95 px-3.5 py-2 shadow-lg backdrop-blur border border-slate-200 text-xs font-bold text-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="flex h-3 w-3 rounded-full bg-blue-600" />
            <span>Customer</span>
          </div>
          <div className="h-3 w-px bg-slate-300" />
          <div className="flex items-center gap-1.5">
            <span className="flex h-3 w-3 rounded-full bg-orange-500" />
            <span>Specialist</span>
          </div>
        </div>
      </div>

      {/* Party Contact & Status Actions Footer */}
      <div className="bg-slate-50 p-5 border-t border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          
          {/* Party details */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 font-bold text-blue-700 text-lg">
              {userRole === 'provider' ? customerName.charAt(0) : providerName.charAt(0)}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                {userRole === 'provider' ? 'Customer on Booking' : 'Assigned Technician'}
              </p>
              <h4 className="text-base font-extrabold text-slate-900">
                {userRole === 'provider' ? customerName : providerName}
              </h4>
              <p className="text-xs text-slate-500 truncate max-w-xs">
                {userRole === 'provider' ? customerAddress || 'Address on file' : 'QuickServices Verified Pro'}
              </p>
            </div>
          </div>

          {/* Direct Call & Google Maps Navigation */}
          <div className="flex flex-wrap items-center justify-start md:justify-end gap-2.5">
            {(userRole === 'provider' ? customerPhone : providerPhone) && (
              <a
                href={`tel:${userRole === 'provider' ? customerPhone : providerPhone}`}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition"
              >
                <Phone className="h-4 w-4" />
                <span>Call {userRole === 'provider' ? 'Customer' : 'Specialist'}</span>
              </a>
            )}

            {/* Direct Google Maps External Route Link */}
            {customerLoc && providerLoc && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${providerLoc.lat},${providerLoc.lng}&destination=${customerLoc.lat},${customerLoc.lng}&travelmode=driving`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-sm"
              >
                <Navigation className="h-4 w-4 text-orange-500" />
                <span>Turn-by-turn Navigation</span>
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </a>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
