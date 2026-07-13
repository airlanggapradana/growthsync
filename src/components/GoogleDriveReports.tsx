import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  connectGoogleDrive, 
  getDriveAccessToken, 
  disconnectGoogleDrive, 
  getOrCreateFolder, 
  listPdfsInFolder, 
  deleteFileFromDrive 
} from '../lib/googleDrive';
import { 
  Cloud, 
  CloudLightning, 
  CheckCircle2, 
  Loader2, 
  ExternalLink, 
  Trash2, 
  RefreshCcw, 
  FileText, 
  AlertTriangle,
  LogOut
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface DriveFile {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink?: string;
  createdTime: string;
  size?: string;
}

export default function GoogleDriveReports() {
  const { language, t } = useLanguage();
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionFileId, setActionFileId] = useState<string | null>(null); // For deletion loader

  const checkConnection = () => {
    const token = getDriveAccessToken();
    setIsConnected(!!token);
    return token;
  };

  useEffect(() => {
    const token = checkConnection();
    if (token) {
      fetchDriveFiles(token);
    }
  }, []);

  const fetchDriveFiles = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      // Find or create our app's dedicated folder
      const folderId = await getOrCreateFolder(token, 'Kindo - Laporan Tumbuh Kembang');
      // List all PDFs inside that folder
      const driveFiles = await listPdfsInFolder(token, folderId);
      setFiles(driveFiles);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memuat file dari Google Drive.');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await connectGoogleDrive();
      setIsConnected(true);
      await fetchDriveFiles(token);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal menghubungkan ke Google Drive.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnectGoogleDrive();
    setIsConnected(false);
    setFiles([]);
    setError(null);
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    const confirmMessage = language === 'en'
      ? `Are you sure you want to delete the report "${fileName}" from your Google Drive? This action cannot be undone.`
      : `Apakah Anda yakin ingin menghapus laporan "${fileName}" dari Google Drive Anda? Tindakan ini tidak dapat dibatalkan.`;

    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    const token = getDriveAccessToken();
    if (!token) {
      setError('Sesi Google Drive telah kedaluwarsa. Silakan hubungkan kembali.');
      setIsConnected(false);
      return;
    }

    setActionFileId(fileId);
    try {
      await deleteFileFromDrive(token, fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal menghapus file.');
    } finally {
      setActionFileId(null);
    }
  };

  const handleRefresh = () => {
    const token = getDriveAccessToken();
    if (token) {
      fetchDriveFiles(token);
    } else {
      setIsConnected(false);
    }
  };

  const formatSize = (bytesStr?: string) => {
    if (!bytesStr) return 'Unknown';
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return 'Unknown';
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-6 md:p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-xl text-[#263c32] dark:text-slate-100 flex items-center gap-2.5">
            <Cloud className="w-6 h-6 text-[#8cc63f]" />
            {language === 'en' ? 'Google Drive Cloud Storage' : 'Penyimpanan Google Drive'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            {language === 'en'
              ? 'Backup and view developmental reports securely in your personal cloud.'
              : 'Cadangkan dan lihat laporan tumbuh kembang anak di cloud pribadi Anda secara aman.'}
          </p>
        </div>

        {isConnected && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2.5 text-slate-500 hover:text-[#263c32] dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors disabled:opacity-50"
              title={language === 'en' ? 'Sync files' : 'Sinkronkan berkas'}
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-2 px-4 py-2.5 border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-950/20 rounded-xl text-xs font-bold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              {language === 'en' ? 'Disconnect' : 'Putuskan'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-950/30 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="text-sm text-red-700 dark:text-red-400 font-medium">
            {error}
          </div>
        </div>
      )}

      {/* Connection Wizard */}
      {!isConnected ? (
        <div className="py-8 text-center flex flex-col items-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#8cc63f]/10 dark:bg-[#8cc63f]/5 flex items-center justify-center mb-5 text-[#8cc63f]">
            <CloudLightning className="w-8 h-8 animate-pulse" />
          </div>
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
            {language === 'en' ? 'Cloud Backup Disconnected' : 'Cadangan Cloud Belum Terhubung'}
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
            {language === 'en'
              ? 'Connect your personal Google Drive to safely back up pediatric assessments and stimulation reports so you can view them anytime, anywhere.'
              : 'Hubungkan Google Drive pribadi Anda untuk mencadangkan hasil skrining tumbuh kembang anak sehingga dapat diakses kapan saja dan dari mana saja.'}
          </p>

          <button
            onClick={handleConnect}
            disabled={loading}
            className="gsi-material-button w-full sm:w-auto"
            style={{ width: 'auto', minWidth: '240px' }}
          >
            <div className="gsi-material-button-state"></div>
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#8cc63f]" />
                ) : (
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                )}
              </div>
              <span className="gsi-material-button-contents font-bold">
                {loading ? t('app.ai_loading') : (language === 'en' ? 'Connect Google Drive' : 'Hubungkan Google Drive')}
              </span>
            </div>
          </button>
        </div>
      ) : (
        /* Files Browser */
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 px-3.5 py-1.5 rounded-full inline-flex self-start">
            <CheckCircle2 className="w-4 h-4" />
            {language === 'en' ? 'Drive Connected - folder "Kindo - Laporan Tumbuh Kembang"' : 'Drive Terhubung - folder "Kindo - Laporan Tumbuh Kembang"'}
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#8cc63f]" />
              <span className="text-sm font-semibold">{language === 'en' ? 'Syncing with Google Drive...' : 'Menyelaraskan dengan Google Drive...'}</span>
            </div>
          ) : files.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
              <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">
                {language === 'en' ? 'No reports saved in Google Drive yet' : 'Belum ada laporan yang disimpan di Google Drive'}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto font-medium">
                {language === 'en'
                  ? 'Complete a child development screening and click "Save to Google Drive" to back up reports here.'
                  : 'Selesaikan skrining tumbuh kembang anak lalu klik "Simpan ke Google Drive" untuk mencadangkan laporan Anda di sini.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {files.map((file) => (
                <div 
                  key={file.id} 
                  className="p-5 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-start gap-4"
                >
                  <div className="p-3 bg-red-100/60 dark:bg-red-950/20 rounded-xl text-red-500 shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate" title={file.name}>
                      {file.name}
                    </h5>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
                      {formatDate(file.createdTime)} • {formatSize(file.size)}
                    </p>
                    
                    <div className="flex items-center gap-3 mt-4">
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 rounded-lg text-xs font-bold transition-all shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {language === 'en' ? 'Open Drive' : 'Buka Drive'}
                      </a>
                      
                      <button
                        onClick={() => handleDelete(file.id, file.name)}
                        disabled={actionFileId === file.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        {actionFileId === file.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        {language === 'en' ? 'Delete' : 'Hapus'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
