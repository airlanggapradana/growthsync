import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Map as MapIcon, Loader2 } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

interface PuskesmasMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function PlacesSearch({ userLocation, setPlaces }: { userLocation: google.maps.LatLngLiteral | null; setPlaces: (places: google.maps.places.Place[]) => void }) {
  const placesLib = useMapsLibrary('places');
  const map = useMap();

  useEffect(() => {
    if (!placesLib || !userLocation) return;
    placesLib.Place.searchByText({
      textQuery: 'Puskesmas',
      fields: ['displayName', 'location', 'formattedAddress'],
      locationBias: userLocation,
      maxResultCount: 8,
    }).then(({ places }) => setPlaces(places));
  }, [placesLib, userLocation]);

  return null;
}

export default function PuskesmasMapModal({ isOpen, onClose }: PuskesmasMapModalProps) {
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [places, setPlaces] = useState<google.maps.places.Place[]>([]);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({ lat: -6.2088, lng: 106.8456 }); // Default Jakarta

  useEffect(() => {
    if (isOpen) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
            setUserLocation(loc);
            setMapCenter(loc);
            setLocationError(null);
          },
          (error) => {
            console.error(error);
            setLocationError("Tidak dapat mengakses lokasi. Pastikan izin lokasi diberikan.");
          }
        );
      } else {
        setLocationError("Browser Anda tidak mendukung geolokasi.");
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl md:rounded-[32px] shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Puskesmas Terdekat
              </h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                Rekomendasi faskes untuk skrining perkembangan anak.
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar list */}
            <div className="w-full md:w-1/3 bg-slate-50/50 dark:bg-slate-900 overflow-y-auto border-r border-slate-100 dark:border-slate-800">
              {locationError ? (
                <div className="p-6 text-center text-rose-500 dark:text-rose-400 font-medium text-sm">
                  {locationError}
                </div>
              ) : !userLocation ? (
                <div className="p-8 flex flex-col items-center justify-center text-slate-500 gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  <span className="text-sm font-medium">Mencari lokasi Anda...</span>
                </div>
              ) : places.length === 0 ? (
                <div className="p-8 flex flex-col items-center justify-center text-slate-500 gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  <span className="text-sm font-medium">Mencari puskesmas terdekat...</span>
                </div>
              ) : (
                <div className="p-4 flex flex-col gap-3">
                  {places.map((p, idx) => (
                    <button 
                      key={p.id}
                      onClick={() => {
                        if (p.location) setMapCenter({ lat: p.location.lat(), lng: p.location.lng() });
                      }}
                      className="text-left w-full p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors"
                    >
                      <div className="font-bold text-slate-800 dark:text-slate-100 mb-1">{p.displayName}</div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {p.formattedAddress}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Map Area */}
            <div className="w-full md:w-2/3 h-[300px] md:h-[500px] relative bg-slate-100 dark:bg-slate-800">
              {!API_KEY || API_KEY === 'YOUR_API_KEY' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Google Maps API Key Required</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-4 text-left max-w-sm">
                    <strong>1.</strong> Dapatkan API Key <a href="https://console.cloud.google.com/google/maps-apis/start" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">di sini</a>.<br/>
                    <strong>2.</strong> Buka <strong>Settings</strong> (⚙️) di pojok kanan atas AI Studio.<br/>
                    <strong>3.</strong> Pilih <strong>Secrets</strong>, tambahkan <code>GOOGLE_MAPS_PLATFORM_KEY</code>.<br/>
                    <strong>4.</strong> Masukkan API Key dan tekan <strong>Enter</strong>.
                  </p>
                </div>
              ) : (
                <APIProvider apiKey={API_KEY} version="weekly">
                  <Map
                    center={mapCenter}
                    zoom={13}
                    mapId="PUSKESMAS_MAP_ID"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{width: '100%', height: '100%'}}
                    onCenterChanged={(e) => setMapCenter(e.detail.center)}
                  >
                    {userLocation && (
                      <AdvancedMarker position={userLocation} title="Lokasi Anda">
                        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_0_4px_rgba(59,130,246,0.2)]" />
                      </AdvancedMarker>
                    )}
                    {places.map(p => p.location && (
                      <AdvancedMarker key={p.id} position={p.location} title={p.displayName}>
                        <Pin background="#059669" glyphColor="#fff" borderColor="#047857" />
                      </AdvancedMarker>
                    ))}
                    <PlacesSearch userLocation={userLocation} setPlaces={setPlaces} />
                  </Map>
                </APIProvider>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
