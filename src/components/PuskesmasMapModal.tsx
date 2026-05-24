import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Map as MapIcon, Loader2, Sparkles, Navigation, Phone } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

interface PuskesmasMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Puskesmas {
  name: string;
  address: string;
  distance: string;
  phone: string;
  lat: number;
  lng: number;
}

function RouteDisplay({ origin, destination }: {
  origin?: google.maps.LatLngLiteral | null;
  destination?: google.maps.LatLngLiteral | null;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!routesLib || !map || !origin || !destination) {
      polylinesRef.current.forEach(p => p.setMap(null));
      polylinesRef.current = [];
      return;
    }
    
    routesLib.Route.computeRoutes({
      origin: { lat: origin.lat, lng: origin.lng },
      destination: { lat: destination.lat, lng: destination.lng },
      travelMode: 'DRIVING',
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
      routingPreference: 'TRAFFIC_AWARE'
    }).then(({ routes }) => {
      polylinesRef.current.forEach(p => p.setMap(null));
      if (routes?.[0]) {
        const newPolylines = routes[0].createPolylines();
        newPolylines.forEach((p: any) => p.setMap(map));
        polylinesRef.current = newPolylines;
        if (routes[0].viewport) map.fitBounds(routes[0].viewport);
      }
    }).catch(error => {
      console.error("Directions routing failed:", error);
    });

    return () => polylinesRef.current.forEach(p => p.setMap(null));
  }, [routesLib, map, origin, destination]);

  return null;
}

export default function PuskesmasMapModal({ isOpen, onClose }: PuskesmasMapModalProps) {
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({ lat: -6.2088, lng: 106.8456 }); // Default Jakarta
  
  const [aiResult, setAiResult] = useState<Puskesmas[] | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedPuskesmas, setSelectedPuskesmas] = useState<Puskesmas | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const requestLocation = () => {
    setLocationError(null);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(loc);
          setMapCenter(loc);
          setLocationError(null);
          fetchNearbyPuskesmas(loc);
        },
        (error) => {
          console.error(error);
          setLocationError("Tidak dapat mengakses lokasi. Pastikan izin lokasi diberikan pada browser Anda.");
        }
      );
    } else {
      setLocationError("Browser Anda tidak mendukung geolokasi.");
    }
  };

  const fetchNearbyPuskesmas = async (loc: google.maps.LatLngLiteral) => {
    setLoadingAi(true);
    setAiResult(null);
    setAiError(null);
    setSelectedPuskesmas(null);
    try {
      const res = await fetch('/api/nearby-puskesmas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: loc.lat, lng: loc.lng }),
      });
      const data = await res.json();
      if (data.result && data.result.puskesmas) {
        setAiResult(data.result.puskesmas);
      } else {
        setAiError("Gagal mendapatkan rekomendasi puskesmas. Silakan coba lagi.");
      }
    } catch (err) {
      console.error(err);
      setAiError("Terjadi kesalahan sistem saat mencari puskesmas.");
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      requestLocation();
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
          className="relative bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl md:rounded-[32px] shadow-xl overflow-hidden flex flex-col h-[85vh] md:h-[700px] max-h-[95vh]"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
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

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
            {/* Sidebar list (Gemini recommendation) */}
            <div className="w-full md:w-[45%] h-1/2 md:h-full bg-slate-50/50 dark:bg-slate-900 overflow-y-auto border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 flex-shrink-0">
              {locationError ? (
                <div className="p-8 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-rose-500 dark:text-rose-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Izin Lokasi Ditolak</h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                      {locationError}
                    </p>
                    <button 
                      onClick={requestLocation}
                      className="px-4 py-2 bg-slate-900 dark:bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-emerald-700 transition"
                    >
                      Coba Lagi
                    </button>
                  </div>
                </div>
              ) : !userLocation ? (
                <div className="p-8 flex flex-col items-center justify-center text-slate-500 gap-3 h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  <span className="text-sm font-medium">Mencari lokasi Anda...</span>
                </div>
              ) : loadingAi ? (
                <div className="p-8 flex flex-col items-center justify-center text-slate-500 gap-4 h-full">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                    <Sparkles className="w-6 h-6 text-emerald-600 animate-pulse" />
                  </div>
                  <span className="text-sm font-medium text-center">Gemini sedang mencari puskesmas terbaik di sekitar Anda...</span>
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600/50" />
                </div>
              ) : aiError ? (
                <div className="p-8 flex flex-col items-center justify-center text-slate-500 gap-3 h-full text-center">
                  <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-2">
                    <X className="w-6 h-6 text-rose-500" />
                  </div>
                  <span className="text-sm font-medium text-rose-500">{aiError}</span>
                  <button onClick={() => userLocation && fetchNearbyPuskesmas(userLocation)} className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-semibold transition">
                     Coba Lagi
                  </button>
                </div>
              ) : aiResult ? (
                <div className="p-4 sm:p-6 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border border-emerald-100 dark:border-emerald-800/50 shrink-0">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Rekomendasi AI (Gemini)</span>
                  </div>
                  <div className="space-y-3 overflow-y-auto flex-1 pr-2 pb-4">
                    {aiResult.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedPuskesmas(p)}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${selectedPuskesmas?.name === p.name ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                      >
                         <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-start justify-between gap-2">
                            <span>{p.name}</span>
                            <span className="shrink-0 text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">{p.distance}</span>
                         </h4>
                         <p className="text-xs text-slate-500 mt-2 line-clamp-2">{p.address}</p>
                         {p.phone && p.phone !== '-' && (
                            <div className="flex items-center gap-1.5 mt-2.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                               <Phone className="w-3 h-3" /> {p.phone}
                            </div>
                         )}
                         {selectedPuskesmas?.name === p.name && (
                            <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 py-1.5 px-3 rounded-lg w-max">
                              <Navigation className="w-3.5 h-3.5" /> Rute Ditampilkan
                            </div>
                         )}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Map Area */}
            <div className="w-full md:w-[55%] flex-1 relative bg-slate-100 dark:bg-slate-800">
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
                    center={selectedPuskesmas ? { lat: selectedPuskesmas.lat, lng: selectedPuskesmas.lng } : mapCenter}
                    zoom={14}
                    mapId="PUSKESMAS_MAP_ID"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{width: '100%', height: '100%'}}
                    onCenterChanged={(e) => {
                      if (!selectedPuskesmas) setMapCenter(e.detail.center);
                    }}
                  >
                    {userLocation && (
                      <AdvancedMarker position={userLocation} title="Lokasi Anda" zIndex={10}>
                        <div className="w-5 h-5 bg-blue-500 rounded-full border-[3px] border-white shadow-[0_0_0_4px_rgba(59,130,246,0.2)]" />
                      </AdvancedMarker>
                    )}
                    
                    {aiResult?.map((p, idx) => (
                       <AdvancedMarker 
                         key={idx} 
                         position={{ lat: p.lat, lng: p.lng }}
                         title={p.name}
                         onClick={() => setSelectedPuskesmas(p)}
                         zIndex={selectedPuskesmas?.name === p.name ? 5 : 1}
                       >
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md border-2 border-white transition-transform ${selectedPuskesmas?.name === p.name ? 'bg-emerald-500 scale-110' : 'bg-slate-400 scale-100 hover:scale-110'}`}>
                            <MapIcon className="w-4 h-4" />
                         </div>
                       </AdvancedMarker>
                    ))}
                    
                    {selectedPuskesmas && userLocation && (
                       <RouteDisplay 
                         origin={userLocation} 
                         destination={{ lat: selectedPuskesmas.lat, lng: selectedPuskesmas.lng }} 
                       />
                    )}
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
