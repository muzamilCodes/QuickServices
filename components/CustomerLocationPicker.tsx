'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  MapPin, 
  LocateFixed, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Edit3,
  Navigation,
  Compass
} from 'lucide-react';
import { getApiBaseUrl } from '@/lib/apiBase';

export interface LocationData {
  fullAddress: string;
  city: string;
  pincode: string;
  lat: number | null;
  lng: number | null;
}

interface CustomerLocationPickerProps {
  value: LocationData;
  onChange: (location: LocationData) => void;
  disabled?: boolean;
}

export default function CustomerLocationPicker({
  value,
  onChange,
  disabled = false
}: CustomerLocationPickerProps) {
  const API_URL = getApiBaseUrl();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [detecting, setDetecting] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [locationStatus, setLocationStatus] = useState<{
    type: 'idle' | 'success' | 'error' | 'denied';
    message: string;
  }>({ type: 'idle', message: '' });

  const [mapInitialized, setMapInitialized] = useState(false);

  // Srinagar default center if no coordinates selected yet
  const defaultCoords = { lat: 34.0837, lng: 74.7973 };
  const currentLat = value.lat ?? defaultCoords.lat;
  const currentLng = value.lng ?? defaultCoords.lng;
  const hasCoords = value.lat !== null && value.lng !== null;

  // Reverse geocode lat & lng
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      setGeocoding(true);
      const res = await fetch(`${API_URL}/public/reverse-geocode?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      if (data.success && data.address) {
        onChange({
          fullAddress: data.address.fullAddress || value.fullAddress,
          city: data.address.city || value.city || 'Srinagar',
          pincode: data.address.pincode || value.pincode || '',
          lat,
          lng
        });
        setLocationStatus({
          type: 'success',
          message: 'Location detected and verified successfully.'
        });
      } else {
        onChange({
          ...value,
          lat,
          lng
        });
      }
    } catch (err) {
      console.warn('Reverse geocode warning:', err);
      onChange({
        ...value,
        lat,
        lng
      });
    } finally {
      setGeocoding(false);
    }
  }, [API_URL, onChange, value]);

  // Request browser geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus({
        type: 'error',
        message: 'Geolocation is not supported by your browser. Please enter your address manually below.'
      });
      return;
    }

    setDetecting(true);
    setLocationStatus({ type: 'idle', message: '' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        setDetecting(false);
        void reverseGeocode(lat, lng);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          }
        }
      },
      (error) => {
        setDetecting(false);
        let errorMsg = 'Unable to retrieve your current location. Please enter your address manually.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission was denied. Please allow location access in your browser settings or enter your service address manually.';
          setLocationStatus({ type: 'denied', message: errorMsg });
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location information is unavailable. Please enter your address manually.';
          setLocationStatus({ type: 'error', message: errorMsg });
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Location request timed out. Please enter your address manually.';
          setLocationStatus({ type: 'error', message: errorMsg });
        } else {
          setLocationStatus({ type: 'error', message: errorMsg });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Initialize interactive Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initLeaflet() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Customer map pin icon
      const customerPin = L.divIcon({
        className: 'custom-customer-pin',
        html: `
          <div style="
            background: #2563eb;
            color: #ffffff;
            width: 38px;
            height: 38px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(37,99,235,0.45);
            border: 3px solid #ffffff;
          ">
            <span style="transform: rotate(45deg); font-size: 15px; font-weight: bold;">📍</span>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38]
      });

      const initialLat = currentLat;
      const initialLng = currentLng;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: hasCoords ? 15 : 12,
        zoomControl: true,
        scrollWheelZoom: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Create draggable marker
      const marker = L.marker([initialLat, initialLng], {
        icon: customerPin,
        draggable: !disabled
      }).addTo(map);

      marker.bindPopup('<b>Your Service Address</b><br/>Drag this marker or click the map to refine your location.').openPopup();

      marker.on('dragend', (e: any) => {
        const newPos = e.target.getLatLng();
        const lat = Number(newPos.lat.toFixed(6));
        const lng = Number(newPos.lng.toFixed(6));
        void reverseGeocode(lat, lng);
      });

      map.on('click', (e: any) => {
        if (disabled) return;
        const lat = Number(e.latlng.lat.toFixed(6));
        const lng = Number(e.latlng.lng.toFixed(6));
        marker.setLatLng([lat, lng]);
        marker.openPopup();
        void reverseGeocode(lat, lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      setMapInitialized(true);
    }

    void initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Run on mount

  // Sync marker position if coords updated externally
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && hasCoords) {
      markerRef.current.setLatLng([value.lat!, value.lng!]);
    }
  }, [value.lat, value.lng, hasCoords]);

  return (
    <div className="space-y-4">
      {/* Geolocation Trigger Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <LocateFixed className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Service Address & Location
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Detect GPS coordinates or enter address manually
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={detecting || geocoding || disabled}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95 disabled:opacity-60 whitespace-nowrap"
        >
          {detecting || geocoding ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{detecting ? 'Requesting GPS...' : 'Resolving Address...'}</span>
            </>
          ) : (
            <>
              <Compass className="h-4 w-4" />
              <span>Detect My Current Location</span>
            </>
          )}
        </button>
      </div>

      {/* Status Alert Banner */}
      {locationStatus.type !== 'idle' && (
        <div
          className={`flex items-start gap-2.5 rounded-2xl p-3.5 text-xs font-medium border ${
            locationStatus.type === 'success'
              ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
              : 'border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300'
          }`}
        >
          {locationStatus.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p>{locationStatus.message}</p>
          </div>
        </div>
      )}

      {/* Coordinates Display Bar */}
      {hasCoords && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[11px] font-mono text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <Navigation className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>GPS Coordinates:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {value.lat?.toFixed(5)}, {value.lng?.toFixed(5)}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            Marker is draggable on the map
          </span>
        </div>
      )}

      {/* Interactive Map Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner bg-slate-100 dark:bg-slate-900">
        <div
          ref={mapContainerRef}
          className="h-56 sm:h-64 w-full z-0"
          style={{ minHeight: '220px' }}
        />
        <div className="flex items-center justify-between px-3 py-1.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
          <span>💡 Tap/drag the marker on map to pinpoint your exact doorstep.</span>
          <span>OpenStreetMap & Nominatim</span>
        </div>
      </div>

      {/* Manual Editable Address Inputs */}
      <div className="space-y-3 pt-1">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Full Service Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            disabled={disabled}
            placeholder="House/Flat No., Street, Mohalla, Landmark"
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition focus:border-blue-500 dark:focus:border-blue-400 shadow-sm"
            value={value.fullAddress}
            onChange={(e) => onChange({ ...value, fullAddress: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              City / Tehsil <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={disabled}
              placeholder="e.g. Srinagar, Handwara, Baramulla"
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition focus:border-blue-500 dark:focus:border-blue-400 shadow-sm"
              value={value.city}
              onChange={(e) => onChange({ ...value, city: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Pincode / Postal Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={disabled}
              placeholder="e.g. 190001"
              maxLength={6}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition focus:border-blue-500 dark:focus:border-blue-400 shadow-sm font-mono"
              value={value.pincode}
              onChange={(e) => onChange({ ...value, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
