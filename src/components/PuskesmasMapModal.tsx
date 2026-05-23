import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Map as MapIcon, Loader2, Sparkles } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import ReactMarkdown from 'react-markdown';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

interface PuskesmasMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PuskesmasMapModal({ isOpen, onClose }: PuskesmasMapModalProps) {
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({ lat: -6.2088, lng: 106.8456 }); // Default Jakarta
  
  const [aiResult, setAiResult] = useState<string | null>(null);
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
    try {
      const res = await fetch('/api/nearby-puskesmas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: loc.lat, lng: loc.lng }),
      });
      const data = await res.json();
      if (data.result) {
        setAiResult(data.result);
      } else {
        setAiResult("Gagal mendapatkan rekomendasi puskesmas. Silakan coba lagi.");
      }
    } catch (err) {
      console.error(err);
      setAiResult("Terjadi kesalahan sistem saat mencari puskesmas.");
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
          className="relative bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl md:rounded-[32px] shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
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
            <div className="w-full md:w-2/5 bg-slate-50/50 dark:bg-slate-900 overflow-y-auto border-r border-slate-100 dark:border-slate-800">
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
              ) : aiResult ? (
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Rekomendasi AI (Gemini)</span>
                  </div>
                  <div className="prose prose-sm md:prose-base prose-slate dark:prose-invert max-w-none">
                    <ReactMarkdown>{aiResult}</ReactMarkdown>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Map Area */}
            <div className="w-full md:w-3/5 h-[300px] md:h-[500px] relative bg-slate-100 dark:bg-slate-800">
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
                    zoom={14}
                    mapId="PUSKESMAS_MAP_ID"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{width: '100%', height: '100%'}}
                    onCenterChanged={(e) => setMapCenter(e.detail.center)}
                  >
                    {userLocation && (
                      <AdvancedMarker position={userLocation} title="Lokasi Anda">
                        <div className="w-5 h-5 bg-blue-500 rounded-full border-[3px] border-white shadow-[0_0_0_4px_rgba(59,130,246,0.2)]" />
                      </AdvancedMarker>
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
