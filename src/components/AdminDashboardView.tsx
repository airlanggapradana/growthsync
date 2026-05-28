import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, addDoc, setDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CheckCircle2, ShieldAlert, Users, Baby, Activity, Bell, X, UserPlus, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export default function AdminDashboardView({ userProfile }: { userProfile: UserProfile }) {
  const [unverifiedNakes, setUnverifiedNakes] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState({
    totalOrangTua: 0,
    totalAnak: 0,
    totalNakesVerified: 0
  });
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  
  const [newNakesName, setNewNakesName] = useState('');
  const [newNakesSIP, setNewNakesSIP] = useState('');
  const [newNakesEmail, setNewNakesEmail] = useState('');
  const [newNakesPassword, setNewNakesPassword] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedRegency, setSelectedRegency] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [provinces, setProvinces] = useState<any[]>([]);
  const [regencies, setRegencies] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [villages, setVillages] = useState<any[]>([]);
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/wilayah/provinces')
      .then(res => res.json())
      .then(data => setProvinces(data.data || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      fetch(`/api/wilayah/regencies/${selectedProvince}`)
        .then(res => res.json())
        .then(data => setRegencies(data.data || []))
        .catch(console.error);
      setSelectedRegency('');
      setSelectedDistrict('');
      setSelectedVillage('');
    } else {
      setRegencies([]);
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedRegency) {
      fetch(`/api/wilayah/districts/${selectedRegency}`)
        .then(res => res.json())
        .then(data => setDistricts(data.data || []))
        .catch(console.error);
      setSelectedDistrict('');
      setSelectedVillage('');
    } else {
      setDistricts([]);
    }
  }, [selectedRegency]);

  useEffect(() => {
    if (selectedDistrict) {
      fetch(`/api/wilayah/villages/${selectedDistrict}`)
        .then(res => res.json())
        .then(data => setVillages(data.data || []))
        .catch(console.error);
      setSelectedVillage('');
    } else {
      setVillages([]);
    }
  }, [selectedDistrict]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      
      let orangTuaCount = 0;
      let nakesVerifiedCount = 0;
      const unverified: UserProfile[] = [];

      usersSnapshot.forEach((doc) => {
        const u = doc.data() as UserProfile;
        if (u.role === 'orang_tua') {
           orangTuaCount++;
        } else if (u.role === 'nakes') {
           if (u.isVerified) {
             nakesVerifiedCount++;
           } else {
             unverified.push({ ...u, uid: doc.id });
           }
        }
      });

      // Fetch children
      const childrenQuery = query(collection(db, 'childProfiles'));
      const childrenSnapshot = await getDocs(childrenQuery);
      
      setUnverifiedNakes(unverified);
      setStats({
        totalOrangTua: orangTuaCount,
        totalAnak: childrenSnapshot.size,
        totalNakesVerified: nakesVerifiedCount
      });

      // Fetch logs
      const logsQuery = query(collection(db, 'adminLogs'), orderBy('timestamp', 'desc'));
      const logsSnapshot = await getDocs(logsQuery);
      const logsData: any[] = [];
      logsSnapshot.forEach(doc => {
        logsData.push({ id: doc.id, ...doc.data() });
      });
      setLogs(logsData);

      if (unverified.length > 0) {
        setShowNotification(true);
      } else {
        setShowNotification(false);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const verifyNakes = async (nakesId: string, nakesEmail: string) => {
    try {
      const userRef = doc(db, 'users', nakesId);
      await updateDoc(userRef, { isVerified: true });
      await addDoc(collection(db, 'adminLogs'), {
        action: 'VERIFY_NAKES',
        adminId: userProfile.uid,
        targetEmail: nakesEmail,
        timestamp: serverTimestamp()
      });
      fetchAdminData();
    } catch (err) {
      console.error('Error verifying nakes:', err);
      alert('Gagal memverifikasi.');
    }
  };

  const handleAddNakes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNakesName || !newNakesSIP || !newNakesEmail || !newNakesPassword || !selectedProvince || !selectedRegency || !selectedDistrict || !selectedVillage) {
      alert("Lengkapi semua field form pendaftaran");
      return;
    }
    
    setIsRegistering(true);
    setRegisterSuccess(false);
    
    try {
      const selectedProvName = provinces.find(p => p.code === selectedProvince)?.name || '';
      const selectedRegName = regencies.find(r => r.code === selectedRegency)?.name || '';
      const selectedDistName = districts.find(d => d.code === selectedDistrict)?.name || '';
      const selectedVillName = villages.find(v => v.code === selectedVillage)?.name || '';

      const secondaryApp = initializeApp(firebaseConfig, `Secondary-${Date.now()}`);
      const secondaryAuth = getAuth(secondaryApp);
      
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newNakesEmail, newNakesPassword);
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
         uid: userCredential.user.uid,
         name: newNakesName,
         sip: newNakesSIP,
         email: newNakesEmail,
         role: 'nakes',
         isVerified: true,
         province: selectedProvName,
         regency: selectedRegName,
         district: selectedDistName,
         village: selectedVillName,
         createdAt: new Date().toISOString()
      });

      await addDoc(collection(db, 'adminLogs'), {
         action: 'ADD_NAKES',
         adminId: userProfile.uid,
         targetEmail: newNakesEmail,
         timestamp: serverTimestamp()
      });

      await signOut(secondaryAuth);
      
      setNewNakesName('');
      setNewNakesSIP('');
      setNewNakesEmail('');
      setNewNakesPassword('');
      setSelectedProvince('');
      setSelectedRegency('');
      setSelectedDistrict('');
      setSelectedVillage('');
      setRegisterSuccess(true);
      fetchAdminData();
      
      setTimeout(() => setRegisterSuccess(false), 3000);
    } catch(err: any) {
      console.error('Error adding nakes:', err);
      alert('Gagal menambahkan Nakes. ' + err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  const chartData = [
    { name: 'Orang Tua', total: stats.totalOrangTua },
    { name: 'Anak', total: stats.totalAnak },
    { name: 'Nakes Terverifikasi', total: stats.totalNakesVerified },
  ];

  if (loading) {
     return <div className="flex items-center justify-center p-12"><Activity className="w-8 h-8 text-[#8cc63f] animate-spin" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {showNotification && unverifiedNakes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-50 bg-[#263c32] text-white p-4 rounded-2xl shadow-2xl flex items-start gap-4 border border-white/10 max-w-sm"
          >
            <div className="w-10 h-10 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center shrink-0">
               <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1">
               <h4 className="font-bold text-sm mb-1">Pemberitahuan Baru</h4>
               <p className="text-xs text-white/70">Ada {unverifiedNakes.length} tenaga kesehatan baru yang menunggu proses verifikasi.</p>
            </div>
            <button 
               onClick={() => setShowNotification(false)}
               className="text-white/50 hover:text-white transition-colors p-1"
            >
               <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[#263c32] rounded-[32px] p-8 md:p-10 mb-8 mt-2 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-[#263c32]/20">
         <div className="absolute inset-0 overflow-hidden rounded-[32px] pointer-events-none">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
         </div>
         <div className="relative z-10 w-full md:w-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight flex items-center gap-4">
              Admin Dashboard
              {unverifiedNakes.length > 0 && (
                 <span className="bg-rose-500 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                   <Bell className="w-4 h-4" /> {unverifiedNakes.length} Menunggu
                 </span>
              )}
            </h1>
            <p className="text-white/70 font-medium mt-2">Sistem Informasi Skrining Tumbuh Kembang</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[24px] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 flex justify-center items-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
               <p className="text-sm font-semibold text-slate-500">Total Orang Tua</p>
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalOrangTua}</h3>
            </div>
         </div>
         <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[24px] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex justify-center items-center">
              <Baby className="w-6 h-6" />
            </div>
            <div>
               <p className="text-sm font-semibold text-slate-500">Total Anak (Terdaftar)</p>
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalAnak}</h3>
            </div>
         </div>
         <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[24px] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-600 flex justify-center items-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
               <p className="text-sm font-semibold text-slate-500">Nakes Terverifikasi</p>
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalNakesVerified}</h3>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="flex flex-col gap-8">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-8 shadow-sm">
               <h3 className="font-bold text-slate-900 dark:text-white text-xl border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">Verifikasi Tenaga Kesehatan</h3>
               {unverifiedNakes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                     <CheckCircle2 className="w-12 h-12 text-slate-300 mb-3" />
                     <p className="font-semibold text-slate-600">Tidak ada nakes baru</p>
                     <p className="text-sm text-slate-400">Semua tenaga kesehatan telah diverifikasi.</p>
                  </div>
               ) : (
                  <div className="space-y-4">
                     {unverifiedNakes.map(nakes => (
                        <div key={nakes.uid} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[20px] gap-4">
                           <div>
                              <p className="font-bold text-slate-900 dark:text-white">{nakes.email}</p>
                              <p className="text-xs text-slate-500">{nakes.province ? `${nakes.regency}, ${nakes.province}` : 'Lokasi tidak diketahui'}</p>
                           </div>
                           <button 
                              onClick={() => verifyNakes(nakes.uid, nakes.email)}
                              className="px-4 py-2 bg-[#8cc63f] hover:bg-[#7cb435] text-[#1e3025] rounded-xl text-sm font-bold transition-colors shadow-sm whitespace-nowrap self-start sm:self-auto"
                           >
                              Verifikasi
                           </button>
                        </div>
                     ))}
                  </div>
               )}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-8 shadow-sm">
               <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                 <UserPlus className="w-6 h-6 text-[#8cc63f]" />
                 <h3 className="font-bold text-slate-900 dark:text-white text-xl">Tambah Tenaga Kesehatan</h3>
               </div>
               
               {registerSuccess && (
                 <div className="mb-6 bg-emerald-50 text-emerald-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium">
                   <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                     <CheckCircle2 className="w-5 h-5" />
                   </div>
                   Nakes berhasil ditambahkan dan langsung terverifikasi.
                 </div>
               )}

               <form onSubmit={handleAddNakes} className="space-y-4">
                  <div className="space-y-1.5">
                     <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Nama Lengkap</label>
                     <input
                        type="text"
                        required
                        value={newNakesName}
                        onChange={(e) => setNewNakesName(e.target.value)}
                        placeholder="Masukkan nama lengkap nakes"
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8cc63f]/50 transition-all dark:text-white"
                     />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Nomor SIP (Surat Izin Praktik)</label>
                     <input
                        type="text"
                        required
                        value={newNakesSIP}
                        onChange={(e) => setNewNakesSIP(e.target.value)}
                        placeholder="Masukkan Nomor SIP"
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8cc63f]/50 transition-all dark:text-white"
                     />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Email Akun Nakes</label>
                     <input
                        type="email"
                        required
                        value={newNakesEmail}
                        onChange={(e) => setNewNakesEmail(e.target.value)}
                        placeholder="contoh: nakes@klinik.com"
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8cc63f]/50 transition-all dark:text-white"
                     />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Password</label>
                     <input
                        type="password"
                        required
                        minLength={6}
                        value={newNakesPassword}
                        onChange={(e) => setNewNakesPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8cc63f]/50 transition-all dark:text-white"
                     />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Provinsi</label>
                        <select
                           value={selectedProvince}
                           onChange={(e) => setSelectedProvince(e.target.value)}
                           className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8cc63f]/50 transition-all dark:text-white"
                           required
                        >
                           <option value="" disabled>Pilih Provinsi</option>
                           {provinces.map((p) => (
                              <option key={p.code} value={p.code}>{p.name}</option>
                           ))}
                        </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Kabupaten/Kota</label>
                        <select
                           value={selectedRegency}
                           onChange={(e) => setSelectedRegency(e.target.value)}
                           className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8cc63f]/50 transition-all dark:text-white"
                           required
                           disabled={!regencies.length}
                        >
                           <option value="" disabled>Pilih Kab/Kota</option>
                           {regencies.map((r) => (
                              <option key={r.code} value={r.code}>{r.name}</option>
                           ))}
                        </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Kecamatan</label>
                        <select
                           value={selectedDistrict}
                           onChange={(e) => setSelectedDistrict(e.target.value)}
                           className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8cc63f]/50 transition-all dark:text-white"
                           required
                           disabled={!districts.length}
                        >
                           <option value="" disabled>Pilih Kecamatan</option>
                           {districts.map((d) => (
                              <option key={d.code} value={d.code}>{d.name}</option>
                           ))}
                        </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Kelurahan/Desa</label>
                        <select
                           value={selectedVillage}
                           onChange={(e) => setSelectedVillage(e.target.value)}
                           className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8cc63f]/50 transition-all dark:text-white"
                           required
                           disabled={!villages.length}
                        >
                           <option value="" disabled>Pilih Kelurahan</option>
                           {villages.map((v) => (
                              <option key={v.code} value={v.code}>{v.name}</option>
                           ))}
                        </select>
                     </div>
                  </div>

                  <button 
                     type="submit"
                     disabled={isRegistering}
                     className="w-full mt-4 bg-[#263c32] hover:bg-[#1e3025] disabled:opacity-70 disabled:cursor-not-allowed text-white px-4 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                     {isRegistering ? (
                       <><Loader2 className="w-5 h-5 animate-spin" /> Mendaftarkan...</>
                     ) : (
                       <><UserPlus className="w-5 h-5" /> Daftarkan Akses Nakes</>
                     )}
                  </button>
               </form>
            </div>
         </div>

         <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-8 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-xl border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">Statistik Pendaftaran</h3>
            <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                     <Tooltip 
                        cursor={{ fill: 'transparent' }} 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                     />
                     <Bar dataKey="total" fill="#8cc63f" radius={[6, 6, 6, 6]} barSize={40} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-8 shadow-sm mt-8">
         <h3 className="font-bold text-slate-900 dark:text-white text-xl border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">Riwayat Aktivitas</h3>
         {logs.length === 0 ? (
            <div className="text-center text-slate-500 py-8 text-sm">Belum ada riwayat aktivitas.</div>
         ) : (
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
               {logs.map(log => (
                  <div key={log.id} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                     <div className="w-8 h-8 rounded-full bg-[#8cc63f]/20 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-[#8cc63f]" />
                     </div>
                     <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Memverifikasi Nakes: {log.targetEmail}</p>
                        <p className="text-xs text-slate-500 mt-1">
                           {log.timestamp ? new Date(log.timestamp.toDate()).toLocaleString('id-ID', {
                             dateStyle: 'medium',
                             timeStyle: 'short'
                           }) : 'Baru saja'}
                        </p>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
    </div>
  );
}
