import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  addDoc, 
  serverTimestamp, 
  onSnapshot, 
  orderBy, 
  updateDoc, 
  doc 
} from 'firebase/firestore';
import { UserProfile } from '../types';
import { 
  Search, 
  Phone, 
  Video, 
  MoreVertical, 
  Paperclip, 
  Camera, 
  Smile, 
  Mic, 
  Send, 
  ChevronLeft, 
  X, 
  Check, 
  CheckCheck, 
  PhoneOff, 
  MicOff, 
  VideoOff, 
  Award, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  UserCheck, 
  MessageSquare, 
  Users, 
  Stethoscope, 
  Clock, 
  Baby, 
  FileText,
  Database,
  Loader2,
  User,
  RefreshCw,
  Languages,
  Lock,
  AlertCircle,
  Info,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import dayjs from 'dayjs';
import { getNakesPlaceholder, getParentPlaceholder } from '../utils/avatarPlaceholders';
import { useLanguage } from '../contexts/LanguageContext';

interface ContactItem {
  id: string;
  uid: string;
  name: string;
  role: string;
  category: 'dokter' | 'bidan' | 'gizi' | 'posyandu';
  avatar: string;
  lastMessage: string;
  timestamp: string;
  online: boolean;
  unreadCount?: number;
  statusText?: string;
  isGroup?: boolean;
  isAssignedNakes?: boolean;
  specialty?: string;
  sipNumber?: string;
  facility?: string;
  activeHours?: string;
  childrenNames?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId?: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  isVoice?: boolean;
  voiceDuration?: string;
  attachmentName?: string;
  attachmentType?: 'image' | 'doc';
  createdAt?: any;
}

// Medical team and posyandu channels tailored to StuntGuard & KPSP Consultation
const DEFAULT_CONTACTS: ContactItem[] = [
  {
    id: 'c-airlangga',
    uid: 'nakes_airlangga',
    name: 'Dr. Airlangga Pradana, Sp.A',
    role: 'Dokter Spesialis Anak (Sp.A)',
    category: 'dokter',
    avatar: getNakesPlaceholder('dokter', 'Dr. Airlangga Pradana, Sp.A'),
    lastMessage: 'Bagaimana hasil evaluasi perkembangan KPSP ananda minggu ini?',
    timestamp: '09:15',
    online: true,
    statusText: 'Online • Siap Melayani Konsultasi Tumbuh Kembang',
    specialty: 'Konsultan Tumbuh Kembang & Nutrisi Pediatrik',
    sipNumber: 'SIP.440/1082/DS-A/2024',
    facility: 'RS UMS & Puskesmas Pembina',
    activeHours: 'Senin - Jumat, 08:00 - 15:00 WIB'
  },
  {
    id: 'c-putri',
    uid: 'nakes_putri',
    name: 'Bdn. Putri Azzahra, S.Tr.Keb',
    role: 'Bidan Praktik Mandiri & Fasilitator KIA',
    category: 'bidan',
    avatar: getNakesPlaceholder('bidan', 'Bdn. Putri Azzahra, S.Tr.Keb'),
    lastMessage: 'Grafik KMS anak sudah saya periksa, kenaikan berat badannya cukup baik.',
    timestamp: 'Kemarin',
    online: true,
    statusText: 'Online • Konselor Laktasi & MPASI',
    specialty: 'Kesehatan Ibu dan Anak (KIA) & Pemantauan KMS',
    sipNumber: 'SIPB.3372/B/0091/2023',
    facility: 'Klinik Pratama & Posyandu Melati',
    activeHours: 'Setiap Hari, 08:00 - 16:00 WIB'
  },
  {
    id: 'c-shafwan',
    uid: 'nakes_shafwan',
    name: 'Shafwan Aulia, S.Gz',
    role: 'Nutrisionis Klinis & Ahli Gizi',
    category: 'gizi',
    avatar: getNakesPlaceholder('gizi', 'Shafwan Aulia, S.Gz'),
    lastMessage: 'Utamakan asupan protein hewani seperti telur, hati ayam, dan ikan ya Bu.',
    timestamp: 'Kemarin',
    online: false,
    statusText: 'Terakhir aktif kemarin 18:30',
    specialty: 'Pola Makan MPASI & Asupan Nutrisi Balita Stunting',
    sipNumber: 'STRG.3301/NUT/2023',
    facility: 'Instalasi Gizi Puskesmas',
    activeHours: 'Senin - Sabtu, 08:30 - 14:00 WIB'
  },
  {
    id: 'c-asrofi',
    uid: 'nakes_asrofi',
    name: 'Ns. Asrofi Noor, S.Kep',
    role: 'Perawat Komunitas Pediatrik',
    category: 'dokter',
    avatar: getNakesPlaceholder('dokter', 'Ns. Asrofi Noor, S.Kep'),
    lastMessage: 'Jadwal imunisasi lanjutan dan penimbangan posyandu sudah terkonfirmasi.',
    timestamp: '20 Sep',
    online: true,
    statusText: 'Online • Koordinator Skrining Lapangan',
    specialty: 'Pemeriksaan Antropometri & Surveilans Balita',
    sipNumber: 'SIPP.3372/P/1102/2024',
    facility: 'Puskesmas Wilayah',
    activeHours: 'Senin - Jumat, 08:00 - 14:30 WIB'
  },
  {
    id: 'c-reja',
    uid: 'nakes_reja',
    name: 'Reja Arrafi, SKM',
    role: 'Penyuluh Kesehatan Masyarakat',
    category: 'gizi',
    avatar: getNakesPlaceholder('gizi', 'Reja Arrafi, SKM'),
    lastMessage: 'Silakan unduh panduan stimulasi motorik balita yang telah kami bagikan.',
    timestamp: '19 Sep',
    online: false,
    statusText: 'Terakhir aktif 19 Sep',
    specialty: 'Edukasi Pencegahan Stunting & Sanitasi Rumah Tangga',
    sipNumber: 'STR.1402/PKM/2022',
    facility: 'Dinas Kesehatan & Tim Percepatan Stunting',
    activeHours: 'Senin - Jumat, 08:00 - 15:00 WIB'
  },
  {
    id: 'grp-posyandu',
    uid: 'group_posyandu_melati',
    name: 'Posyandu Melati Mandiri',
    role: 'Tim Kader & Tenaga Posyandu Balita',
    category: 'posyandu',
    avatar: getNakesPlaceholder('posyandu', 'Posyandu Melati Mandiri'),
    lastMessage: 'Pengumuman: Jadwal penimbangan dan pemberian vitamin A Sabtu ini pukul 08.00.',
    timestamp: '18 Sep',
    online: true,
    statusText: '18 Anggota (Kader & Nakes Pendamping)',
    isGroup: true,
    facility: 'Balai RW 04 Melati Mandiri',
    activeHours: 'Pelayanan Posyandu Hari Sabtu'
  }
];

// Initial realistic consultation messages tailored to Stunting & KPSP
const INITIAL_CONSULTATION_MESSAGES: ChatMessage[] = [
  {
    id: 'm-1',
    senderId: 'nakes_airlangga',
    text: 'Selamat datang di layanan Konsultasi Tenaga Kesehatan StuntGuard! Saya Dr. Airlangga Pradana, Sp.A.',
    timestamp: '08:30',
    isMe: false
  },
  {
    id: 'm-2',
    senderId: 'nakes_airlangga',
    text: 'Bagaimana kondisi ananda hari ini? Apakah ada keluhan pada perkembangan motorik, bicara, atau asupan makannya?',
    timestamp: '08:31',
    isMe: false
  },
  {
    id: 'm-3',
    senderId: 'me',
    text: 'Halo Dok, pada hasil kuisioner skrining KPSP kemarin ada indikasi meragukan di kemampuan motorik kasar anak saya (usia 18 bulan).',
    timestamp: '08:45',
    isMe: true
  },
  {
    id: 'm-4',
    senderId: 'nakes_airlangga',
    text: 'Terima kasih sudah rutin melakukan skrining berkala, Ayah/Bunda. Deteksi dini adalah kunci pencegahan keterlambatan tumbuh kembang.',
    timestamp: '08:50',
    isMe: false
  },
  {
    id: 'm-5',
    senderId: 'nakes_airlangga',
    text: 'Untuk balita 18 bulan, stimulasi harian bisa dilakukan dengan mengajak berjalan di permukaan sedikit menanjak, melompati garis kecil, dan bermain lempar bola mini secara bertahap.',
    timestamp: '08:52',
    isMe: false
  },
  {
    id: 'm-6',
    senderId: 'me',
    text: 'Baik Dok, saya akan coba stimulasi ini di rumah dan pantau ulang perkembangannya.',
    timestamp: '09:05',
    isMe: true
  }
];

const INITIAL_CONSULTATION_MESSAGES_EN: ChatMessage[] = [
  {
    id: 'm-1',
    senderId: 'nakes_airlangga',
    text: 'Welcome to StuntGuard Health Worker Consultation! I am Dr. Airlangga Pradana, Pediatrician (Sp.A).',
    timestamp: '08:30',
    isMe: false
  },
  {
    id: 'm-2',
    senderId: 'nakes_airlangga',
    text: 'How is your child doing today? Are there any concerns regarding motor development, speech, or nutritional intake?',
    timestamp: '08:31',
    isMe: false
  },
  {
    id: 'm-3',
    senderId: 'me',
    text: 'Hello Doctor, in yesterday\'s KPSP screening results there was an indication of doubtful gross motor skills for my child (18 months old).',
    timestamp: '08:45',
    isMe: true
  },
  {
    id: 'm-4',
    senderId: 'nakes_airlangga',
    text: 'Thank you for routinely conducting periodic screenings. Early detection is key to preventing growth and developmental delays.',
    timestamp: '08:50',
    isMe: false
  },
  {
    id: 'm-5',
    senderId: 'nakes_airlangga',
    text: 'For an 18-month toddler, daily stimulation can be done by walking on slight inclines, stepping over small lines, and gradually playing mini ball catch.',
    timestamp: '08:52',
    isMe: false
  },
  {
    id: 'm-6',
    senderId: 'me',
    text: 'Understood Doctor, I will try these stimulations at home and monitor progress closely.',
    timestamp: '09:05',
    isMe: true
  }
];

const KONSULTASI_I18N = {
  id: {
    headerTitle: 'Konsultasi Nakes',
    headerSubtitle: 'Pusat layanan komunikasi dokter, bidan & kader',
    serviceActive: 'Layanan Aktif',
    searchPlaceholder: 'Cari nakes, dokter, atau posyandu...',
    categories: {
      all: 'Semua',
      dokter: 'Dokter',
      bidan: 'Bidan KIA',
      gizi: 'Gizi & MPASI',
      posyandu: 'Posyandu'
    },
    databaseContacts: 'Kontak Database',
    liveFirestore: 'Live Firestore',
    loadingDb: 'Memuat data dari database...',
    syncingDb: 'Sinkronisasi pengguna & pesan Firestore',
    emptyParents: 'Belum Ada Orang Tua di Database',
    emptyParentsDesc: 'Data akun orang tua yang tersimpan di koleksi Firestore users akan muncul otomatis di sini.',
    emptyNakes: 'Belum Ada Nakes di Database',
    emptyNakesDesc: 'Data akun nakes yang tersimpan di koleksi Firestore users akan muncul otomatis di sini.',
    badgeYourPatient: 'Pasien Anda',
    badgeYourNakes: 'Nakes Anda',
    startNewChat: 'Mulai percakapan baru...',
    online: 'Online',
    offline: 'Offline',
    backToList: 'Kembali ke Daftar Kontak',
    clickProfile: 'Klik untuk melihat profil dokter',
    callVoice: 'Mulai Panggilan Suara',
    callVideo: 'Mulai Telekonsultasi Video',
    practiceProfile: 'Profil & Jadwal Praktik',
    languageToggleTitle: 'Pilih Bahasa / Choose Language (ID / EN)',
    verifiedNoticeTitle: 'Layanan Konsultasi Tenaga Medis Resmi Terverifikasi',
    verifiedNoticeDesc: 'Konsultasikan perkembangan motorik, bicara, dan pemantauan kurva KMS balita dengan pendampingan langsung.',
    quickQuestionsLabel: 'Pertanyaan Cepat:',
    quickQuestions: [
      'Kirim Data Skrining KPSP Terbaru',
      'Tanya Rekomendasi Menu MPASI',
      'Konsultasi Kurva KMS Balita',
      'Jadwal Penimbangan Posyandu'
    ],
    chatPlaceholder: 'Ketik pesan konsultasi klinis / tumbuh kembang...',
    attachTooltip: 'Kirim Foto KMS / Hasil Pemeriksaan',
    cameraTooltip: 'Ambil Foto Dokumen Anak',
    sendMessageTooltip: 'Kirim Pesan',
    recordVoiceTooltip: 'Rekam Pesan Suara',
    sendVoiceTooltip: 'Kirim Pesan Suara',
    recordingVoice: 'Merekam Pesan Suara...',
    cancel: 'Batal',
    send: 'Kirim',
    connectingVoice: 'Menghubungkan ke Tenaga Kesehatan...',
    connectedVoice: 'Terhubung:',
    activeVoiceCall: 'Panggilan Suara Aktif',
    micActive: 'Bisukan Mikrofon',
    micMuted: 'Aktifkan Mikrofon',
    endCall: 'Akhiri Panggilan',
    encryptedVideo: 'Telekonsultasi Video Terenkripsi',
    doctorCameraActive: 'Kamera Tenaga Kesehatan Aktif',
    selfCamera: 'Kamera Mandiri',
    endConsultation: 'Selesai Konsultasi',
    profileDetailsTitle: 'Rincian Profil Tenaga Kesehatan',
    specialtyLabel: 'Keahlian & Spesialisasi',
    defaultSpecialty: 'Tumbuh Kembang, Nutrisi & Stimulasi Balita',
    sipLabel: 'Surat Izin Praktik (SIP)',
    defaultSip: 'SIP.440/1082/DS-A/2024 (Terverifikasi)',
    facilityLabel: 'Fasilitas Praktik',
    defaultFacility: 'RS UMS & Puskesmas Pembina',
    hoursLabel: 'Jadwal Praktik Konsultasi',
    defaultHours: 'Senin - Jumat, 08:00 - 15:00 WIB',
    closeInfo: 'Tutup Informasi',
    emptySelectPromptTitle: 'Ruang Konsultasi Medis',
    emptySelectPromptDesc: 'Pilih kontak tenaga kesehatan atau orang tua di daftar sebelah kiri untuk membuka percakapan konsultasi langsung dari database.',
    medicalEncryptedBadge: 'Terenkripsi Medis',
    youBadge: 'Anda',
    cameraOffBadge: 'Kamera Mati',
    badgeNeedReferral: 'Perlu Rujukan',
    badgeNotReferred: 'Bukan Nakes Rujukan',
    lockedChatBannerTitle: 'Konsultasi Terkunci: Khusus Nakes Rujukan',
    lockedChatBannerDesc: 'Sesuai regulasi medis resmi, pasien hanya dapat melakukan interaksi chat klinis kepada Tenaga Kesehatan yang telah merujuk dan mendampingi ananda. Rujukan diterbitkan langsung oleh pihak Tenaga Kesehatan, bukan dari pasien.',
    noReferralAlertTitle: 'Belum Ada Nakes Rujukan',
    noReferralAlertDesc: 'Surat rujukan klinis hanya dapat diterbitkan langsung oleh Tenaga Kesehatan pendamping (dokter/bidan/posyandu) berdasarkan hasil evaluasi tumbuh kembang atau skrining KPSP. Pasien tidak dapat memilih nakes rujukan secara mandiri.',
    switchToReferredAction: 'Buka Chat Nakes Rujukan',
    callRestricted: 'Panggilan suara dan telekonsultasi hanya dapat dilakukan kepada Tenaga Medis rujukan pendamping ananda.',
    officialReferralTitle: 'Tenaga Medis Rujukan Resmi Terverifikasi',
    officialReferralDesc: 'Anda terhubung langsung dengan Nakes rujukan pendamping ananda untuk pemantauan tumbuh kembang dan konsultasi klinis.',
    awaitingNakesReferral: 'Menunggu Surat Rujukan dari Nakes',
    awaitingNakesReferralNote: 'Tenaga Kesehatan wilayah/Posyandu akan meninjau kondisi ananda dan menerbitkan rujukan pendampingan secara langsung.',
    parentHeaderTitle: 'Nakes Rujukan Anda',
    parentHeaderSubtitle: 'Komunikasi privat dengan dokter / bidan pendamping',
    emptyReferralTitle: 'Belum Ada Nakes Rujukan',
    emptyReferralSubtitle: 'Layanan konsultasi chat langsung hanya tersedia untuk Tenaga Medis (Dokter/Bidan) yang telah memberikan rujukan pendampingan resmi untuk ananda.',
    howToGetReferralTitle: 'Alur Penerbitan Rujukan:',
    step1Title: 'Skrining KPSP Balita',
    step1Desc: 'Lakukan skrining berkala 10 pertanyaan perkembangan anak di menu Dashboard.',
    step2Title: 'Tinjauan Klinis Nakes',
    step2Desc: 'Tenaga Medis Posyandu/Puskesmas memeriksa hasil evaluasi dan kurva pertumbuhan.',
    step3Title: 'Rujukan Otomatis Terhubung',
    step3Desc: 'Nakes menerbitkan rujukan dan ruang chat konsultasi langsung otomatis terbuka.',
    backToDashboardAction: 'Buka Dashboard & Skrining',
    referralOnlyBadge: 'Khusus Rujukan Resmi',
    featureKmsTitle: 'Evaluasi Kurva KMS',
    featureKmsDesc: 'Pantau grafik berat dan tinggi badan bersama dokter anak / bidan pendamping.',
    featureKpspTitle: 'Bimbingan Skrining KPSP',
    featureKpspDesc: 'Konsultasikan stimulasi 4 aspek perkembangan bila ada indikasi meragukan.',
    featureCallTitle: 'Telemedis Terjadwal',
    featureCallDesc: 'Sesi panggilan suara dan telekonsultasi sesuai jam praktik resmi.'
  },
  en: {
    headerTitle: 'Health Worker Consultation',
    headerSubtitle: 'Communication center with doctors, midwives & health workers',
    serviceActive: 'Active Service',
    searchPlaceholder: 'Search health worker, doctor, or posyandu...',
    categories: {
      all: 'All',
      dokter: 'Doctors',
      bidan: 'Midwives',
      gizi: 'Nutrition',
      posyandu: 'Posyandu'
    },
    databaseContacts: 'Database Contacts',
    liveFirestore: 'Live Firestore',
    loadingDb: 'Loading data from database...',
    syncingDb: 'Syncing Firestore users & messages',
    emptyParents: 'No Parents in Database',
    emptyParentsDesc: 'Parent accounts stored in the Firestore users collection will appear here automatically.',
    emptyNakes: 'No Health Workers in Database',
    emptyNakesDesc: 'Health worker accounts stored in the Firestore users collection will appear here automatically.',
    badgeYourPatient: 'Your Patient',
    badgeYourNakes: 'Your Health Worker',
    startNewChat: 'Start a new conversation...',
    online: 'Online',
    offline: 'Offline',
    backToList: 'Back to Contact List',
    clickProfile: 'Click to view doctor profile',
    callVoice: 'Start Voice Call',
    callVideo: 'Start Video Consultation',
    practiceProfile: 'Profile & Practice Schedule',
    languageToggleTitle: 'Choose Language (ID / EN)',
    verifiedNoticeTitle: 'Official Verified Medical Consultation Service',
    verifiedNoticeDesc: 'Consult child motor, speech development, and toddler KMS growth curve monitoring with direct medical supervision.',
    quickQuestionsLabel: 'Quick Questions:',
    quickQuestions: [
      'Send Latest KPSP Screening Data',
      'Ask for Weaning Food (MPASI) Advice',
      'Consult Toddler KMS Growth Curve',
      'Posyandu Weighing Schedule'
    ],
    chatPlaceholder: 'Type your clinical / child development message...',
    attachTooltip: 'Send Growth Chart Photo / Medical Record',
    cameraTooltip: 'Take Photo of Child Document',
    sendMessageTooltip: 'Send Message',
    recordVoiceTooltip: 'Record Voice Message',
    sendVoiceTooltip: 'Send Voice Message',
    recordingVoice: 'Recording Voice Message...',
    cancel: 'Cancel',
    send: 'Send',
    connectingVoice: 'Connecting to Health Worker...',
    connectedVoice: 'Connected:',
    activeVoiceCall: 'Active Voice Call',
    micActive: 'Mute Microphone',
    micMuted: 'Unmute Microphone',
    endCall: 'End Call',
    encryptedVideo: 'Encrypted Video Consultation',
    doctorCameraActive: 'Health Worker Camera Active',
    selfCamera: 'Self Camera',
    endConsultation: 'End Consultation',
    profileDetailsTitle: 'Health Worker Profile Details',
    specialtyLabel: 'Specialty & Expertise',
    defaultSpecialty: 'Child Growth, Nutrition & Toddler Stimulation',
    sipLabel: 'Medical Practice License (SIP)',
    defaultSip: 'SIP.440/1082/DS-A/2024 (Verified)',
    facilityLabel: 'Practice Facility',
    defaultFacility: 'UMS Hospital & Main Health Center',
    hoursLabel: 'Consultation Hours',
    defaultHours: 'Monday - Friday, 08:00 - 15:00 WIB',
    closeInfo: 'Close Details',
    emptySelectPromptTitle: 'Medical Consultation Room',
    emptySelectPromptDesc: 'Select a health worker or parent contact on the left to start a direct consultation from the database.',
    medicalEncryptedBadge: 'Medically Encrypted',
    youBadge: 'You',
    cameraOffBadge: 'Camera Off',
    badgeNeedReferral: 'Referral Required',
    badgeNotReferred: 'Not Referred Worker',
    lockedChatBannerTitle: 'Consultation Locked: Referred Nakes Only',
    lockedChatBannerDesc: 'Under clinical medical regulations, patients can only chat with the official health worker who directly assigned a referral to supervise your child. Referrals are strictly issued by health workers.',
    noReferralAlertTitle: 'No Referred Health Worker Yet',
    noReferralAlertDesc: 'Clinical referrals can only be directly issued by your healthcare provider (doctor/midwife/health center) based on child evaluation or KPSP screening. Parents cannot assign referrals themselves.',
    switchToReferredAction: 'Open Referred Chat',
    callRestricted: 'Voice and video calls are strictly restricted to your officially assigned referral health worker.',
    officialReferralTitle: 'Official Verified Referral Health Worker',
    officialReferralDesc: 'You are directly connected with your assigned referral health worker for developmental monitoring and clinical consultation.',
    awaitingNakesReferral: 'Awaiting Referral from Health Worker',
    awaitingNakesReferralNote: 'Your local health worker or health post will review your child\'s records and issue an official referral directly.',
    parentHeaderTitle: 'Your Referred Health Worker',
    parentHeaderSubtitle: 'Private consultation with your assigned doctor/midwife',
    emptyReferralTitle: 'No Referred Health Worker Yet',
    emptyReferralSubtitle: 'Direct chat consultation is exclusively available for health workers who have officially issued a referral to supervise your child.',
    howToGetReferralTitle: 'Referral Issuance Flow:',
    step1Title: 'Toddler KPSP Screening',
    step1Desc: 'Complete periodic 10-question development questionnaires on the Dashboard.',
    step2Title: 'Clinical Review by Health Worker',
    step2Desc: 'Health center / Posyandu doctors review the growth evaluation data.',
    step3Title: 'Automatic Referral Connection',
    step3Desc: 'Your health worker claims the referral and direct chat unlocks right here.',
    backToDashboardAction: 'Open Dashboard & Screening',
    referralOnlyBadge: 'Official Referral Only',
    featureKmsTitle: 'KMS Growth Curve Evaluation',
    featureKmsDesc: 'Monitor weight and height curves directly with your assigned pediatrician / midwife.',
    featureKpspTitle: 'KPSP Screening Guidance',
    featureKpspDesc: 'Consult 4 developmental aspects stimulation if any milestones are in doubt.',
    featureCallTitle: 'Scheduled Telemedicine',
    featureCallDesc: 'Direct voice and video consultations during official health facility service hours.'
  }
};

const getTranslatedRole = (role: string, lang: 'id' | 'en') => {
  if (lang === 'id') return role;
  const map: Record<string, string> = {
    'Dokter Spesialis Anak (Sp.A)': 'Pediatrician (Sp.A)',
    'Bidan Praktik Mandiri & Fasilitator KIA': 'Independent Midwife & MCH Specialist',
    'Nutrisionis Klinis & Ahli Gizi': 'Clinical Nutritionist & Dietitian',
    'Perawat Komunitas Pediatrik': 'Pediatric Community Nurse',
    'Penyuluh Kesehatan Masyarakat': 'Public Health Educator',
    'Tim Kader & Tenaga Posyandu Balita': 'Posyandu Community Health Team',
    'Tenaga Kesehatan': 'Health Worker',
    'Orang Tua Balita': 'Parent / Guardian',
    'Dokter': 'Doctor'
  };
  return map[role] || role;
};

export default function KonsultasiNakesView({
  currentUser,
  initialTargetUser,
  onBackToDashboard,
  unreadCount = 0
}: {
  currentUser: UserProfile;
  initialTargetUser?: UserProfile | { email: string; uid: string } | null;
  onBackToDashboard: () => void;
  unreadCount?: number;
}) {
  const { language, setLanguage } = useLanguage();
  const txt = KONSULTASI_I18N[language] || KONSULTASI_I18N.id;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'online' | 'dokter' | 'bidan' | 'gizi' | 'posyandu'>('all');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactItem | null>(() => {
    if (initialTargetUser) {
      if (currentUser.role === 'orang_tua') {
        const assignedId = currentUser.assignedNakesId;
        if (!assignedId || (assignedId !== initialTargetUser.uid && (initialTargetUser as any).id !== assignedId)) {
          return null;
        }
      }
      return {
        id: initialTargetUser.uid,
        uid: initialTargetUser.uid,
        name: (initialTargetUser as any).name || (initialTargetUser.email ? initialTargetUser.email.split('@')[0] : 'Pengguna'),
        role: currentUser.role === 'nakes' ? 'Orang Tua Balita' : 'Tenaga Kesehatan',
        category: 'dokter',
        avatar: currentUser.role === 'nakes' 
          ? getParentPlaceholder((initialTargetUser as any).name || initialTargetUser.email) 
          : getNakesPlaceholder('dokter', (initialTargetUser as any).name),
        lastMessage: 'Memulai sesi konsultasi...',
        timestamp: '',
        online: Boolean((initialTargetUser as any).isOnline),
        isAssignedNakes: true
      };
    }
    return null;
  });
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return language === 'en' ? INITIAL_CONSULTATION_MESSAGES_EN : INITIAL_CONSULTATION_MESSAGES;
  });
  const [inputText, setInputText] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('chat');

  // Interactive states
  const [activeCall, setActiveCall] = useState<'audio' | 'video' | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);

  // Live Referral & Assignment state (managed authoritatively by healthcare providers)
  const [liveAssignedNakesId, setLiveAssignedNakesId] = useState<string | null>(currentUser.assignedNakesId || null);

  // Keep current user's assigned referral in sync live with Firestore
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsub = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d.assignedNakesId !== undefined) {
          setLiveAssignedNakesId(d.assignedNakesId || null);
        }
      }
    });
    return () => unsub();
  }, [currentUser?.uid]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync demo consultation messages when language toggles
  useEffect(() => {
    if (selectedContact && (selectedContact.id === 'c-airlangga' || selectedContact.uid === 'nakes_airlangga')) {
      setMessages(prev => {
        if (prev.length === 6 && prev[0].id === 'm-1') {
          return language === 'en' ? INITIAL_CONSULTATION_MESSAGES_EN : INITIAL_CONSULTATION_MESSAGES;
        }
        return prev;
      });
    }
  }, [language, selectedContact]);

  // Directly fetch & sync contacts from Firestore database
  useEffect(() => {
    setLoadingContacts(true);
    const targetRole = currentUser.role === 'nakes' ? 'orang_tua' : 'nakes';

    // 1. Live listener for target users from Firestore
    const qUsers = query(collection(db, 'users'), where('role', '==', targetRole));
    
    const unsubscribeUsers = onSnapshot(qUsers, async (snapshot) => {
      try {
        const userDocs: { docId: string; data: any }[] = snapshot.docs.map(docSnap => ({
          docId: docSnap.id,
          data: docSnap.data()
        }));

        // If current user is parent with an assigned nakes, ensure the assigned nakes is included
        const effectiveAssignedNakesId = currentUser.role === 'orang_tua' ? liveAssignedNakesId : currentUser.assignedNakesId;
        if (currentUser.role === 'orang_tua' && effectiveAssignedNakesId) {
          const alreadyHas = userDocs.some(u => u.data.uid === effectiveAssignedNakesId || u.docId === effectiveAssignedNakesId);
          if (!alreadyHas) {
            try {
              const assignedSnap = await getDoc(doc(db, 'users', effectiveAssignedNakesId));
              if (assignedSnap.exists()) {
                userDocs.unshift({
                  docId: assignedSnap.id,
                  data: assignedSnap.data()
                });
              }
            } catch (err) {
              console.warn('Error fetching assigned nakes user:', err);
            }
          }
        }

        // 2. If target users are parents, fetch child profiles to show children's names
        let childMap: Record<string, string> = {};
        if (currentUser.role === 'nakes') {
          try {
            const childSnap = await getDocs(collection(db, 'childProfiles'));
            childSnap.docs.forEach(cDoc => {
              const cData = cDoc.data();
              if (cData.userId) {
                const existing = childMap[cData.userId];
                childMap[cData.userId] = existing 
                  ? `${existing}, ${cData.name}` 
                  : `${cData.name} (${cData.ageInMonths || 0} bln)`;
              }
            });
          } catch (cErr) {
            console.warn('Error fetching child profiles:', cErr);
          }
        }

        // 3. Query recent messages to compute real lastMessage, real timestamp, and unreadCount from Firestore
        const messageMetaMap: Record<string, { lastText: string; timeStr: string; unread: number; timestampMs: number }> = {};
        try {
          const msgsSnap = await getDocs(collection(db, 'messages'));
          msgsSnap.docs.forEach(mDoc => {
            const m = mDoc.data();
            const otherUid = m.senderId === currentUser.uid ? m.receiverId : (m.receiverId === currentUser.uid ? m.senderId : null);
            if (otherUid) {
              const mDate = m.createdAt?.toDate ? m.createdAt.toDate() : new Date(m.createdAt || Date.now());
              const mTimeMs = mDate.getTime();
              const existing = messageMetaMap[otherUid];
              const isUnread = m.receiverId === currentUser.uid && m.read === false;

              if (!existing || mTimeMs > existing.timestampMs) {
                messageMetaMap[otherUid] = {
                  lastText: m.text || (m.isVoice ? 'Pesan suara' : 'Lampiran berkas'),
                  timeStr: dayjs(mDate).format('HH:mm'),
                  unread: (existing ? existing.unread : 0) + (isUnread ? 1 : 0),
                  timestampMs: mTimeMs
                };
              } else if (isUnread) {
                existing.unread += 1;
              }
            }
          });
        } catch (mErr) {
          console.warn('Error fetching messages metadata:', mErr);
        }

        // 4. Map Firestore user documents directly to ContactItem
        const dbContacts: ContactItem[] = userDocs.map(({ docId, data }, idx) => {
          const uid = data.uid || docId;
          const isAssigned = currentUser.role === 'orang_tua' 
            ? Boolean(liveAssignedNakesId && (liveAssignedNakesId === uid || liveAssignedNakesId === docId))
            : data.assignedNakesId === currentUser.uid;

          const msgMeta = messageMetaMap[uid];

          // Determine category
          let category: 'dokter' | 'bidan' | 'gizi' | 'posyandu' = 'dokter';
          const nameLower = (data.name || '').toLowerCase();
          const roleLower = (data.role || '').toLowerCase();
          const specLower = (data.specialty || '').toLowerCase();
          if (nameLower.includes('bidan') || nameLower.includes('bdn') || specLower.includes('bidan') || roleLower.includes('bidan')) {
            category = 'bidan';
          } else if (nameLower.includes('gizi') || nameLower.includes('nutrisi') || specLower.includes('gizi') || roleLower.includes('gizi')) {
            category = 'gizi';
          } else if (nameLower.includes('posyandu') || roleLower.includes('posyandu')) {
            category = 'posyandu';
          }

          const roleDisplay = currentUser.role === 'nakes'
            ? (childMap[uid] ? `Orang Tua • Balita: ${childMap[uid]}` : 'Orang Tua Balita')
            : (isAssigned 
                ? (language === 'en' ? 'Official Referral Health Worker' : 'Nakes Rujukan Anda (Aktif)')
                : (data.sip ? `Tenaga Medis (SIP: ${data.sip})` : (data.isVerified ? 'Tenaga Medis Terverifikasi' : 'Tenaga Kesehatan')));

          // Avatar assignment: every nakes strictly uses the standardized placeholder
          const isTargetNakes = currentUser.role !== 'nakes' || data.role === 'nakes';
          const avatar = isTargetNakes
            ? getNakesPlaceholder(category, data.name || (data.email ? data.email.split('@')[0] : ''))
            : (data.photoURL || data.avatar || getParentPlaceholder(data.name || (data.email ? data.email.split('@')[0] : '')));

          // Real-time automatic live presence from Firestore
          // Genuinely online only when the nakes account is logged in and active in Firestore
          let isOnline = false;
          let statusText = '';
          if (data.isOnline === true) {
            if (data.lastActive) {
              const actDate = data.lastActive.toDate ? data.lastActive.toDate() : new Date(data.lastActive);
              const diffMinutes = (Date.now() - actDate.getTime()) / (1000 * 60);
              // Active within the last 5 minutes
              isOnline = diffMinutes <= 5;
            } else {
              isOnline = true;
            }
          } else {
            isOnline = false;
          }

          if (isOnline) {
            statusText = isAssigned 
              ? (language === 'en' ? 'Online • Your Primary Health Worker' : 'Online • Nakes Pendamping Profil Anda')
              : (language === 'en' ? 'Online • Ready for Consultation' : 'Online • Siap Melayani Konsultasi');
          } else {
            if (data.lastActive) {
              const actDate = data.lastActive.toDate ? data.lastActive.toDate() : new Date(data.lastActive);
              const timeFormatted = dayjs(actDate).format('HH:mm');
              const isToday = dayjs(actDate).isSame(dayjs(), 'day');
              statusText = isToday 
                ? (language === 'en' ? `Last active today ${timeFormatted}` : `Terakhir aktif hari ini ${timeFormatted}`)
                : (language === 'en' ? `Last active ${dayjs(actDate).format('DD MMM')}` : `Terakhir aktif ${dayjs(actDate).format('DD MMM')}`);
            } else {
              statusText = language === 'en' ? 'Offline • Outside service hours' : 'Offline • Di luar jam praktik';
            }
          }

          return {
            id: docId,
            uid: uid,
            name: data.name || (data.email ? data.email.split('@')[0] : `Pengguna ${idx + 1}`),
            role: roleDisplay,
            category: category,
            avatar: avatar,
            lastMessage: msgMeta ? msgMeta.lastText : (isAssigned ? 'Konsultasi nakes aktif' : 'Belum ada riwayat pesan'),
            timestamp: msgMeta ? msgMeta.timeStr : '',
            unreadCount: msgMeta ? msgMeta.unread : 0,
            online: isOnline,
            statusText: statusText,
            isAssignedNakes: isAssigned,
            specialty: data.specialty || (data.role === 'nakes' ? 'Pemantauan Antropometri & Skrining KPSP' : 'Tumbuh Kembang Balita'),
            sipNumber: data.sip || '-',
            facility: [data.village, data.district, data.regency].filter(Boolean).join(', ') || 'Puskesmas Wilayah',
            activeHours: 'Senin - Jumat, 08:00 - 15:00 WIB',
            childrenNames: childMap[uid]
          };
        });

        // Sort: assigned nakes first, then latest message time, then name
        dbContacts.sort((a, b) => {
          if (a.isAssignedNakes && !b.isAssignedNakes) return -1;
          if (!a.isAssignedNakes && b.isAssignedNakes) return 1;
          const aTime = messageMetaMap[a.uid]?.timestampMs || 0;
          const bTime = messageMetaMap[b.uid]?.timestampMs || 0;
          if (aTime !== bTime) return bTime - aTime;
          return a.name.localeCompare(b.name);
        });

        setContacts(dbContacts);

        // Update selected contact
        setSelectedContact(prev => {
          if (currentUser.role === 'orang_tua') {
            const assigned = dbContacts.find(c => c.isAssignedNakes);
            return assigned || null;
          }
          if (initialTargetUser) {
            const foundInitial = dbContacts.find(c => c.uid === initialTargetUser.uid);
            if (foundInitial) return foundInitial;
          }
          if (prev) {
            const foundExisting = dbContacts.find(c => c.uid === prev.uid || c.id === prev.id);
            if (foundExisting) return foundExisting;
          }
          return dbContacts[0] || null;
        });

      } catch (err) {
        console.error('Error fetching database contacts:', err);
      } finally {
        setLoadingContacts(false);
      }
    }, (err) => {
      console.error('Firestore users onSnapshot error:', err);
      setLoadingContacts(false);
    });

    return () => unsubscribeUsers();
  }, [currentUser, initialTargetUser]);

  // Firestore live message listener
  useEffect(() => {
    if (!selectedContact) return;

    const targetUid = selectedContact.uid;
    const chatId = currentUser.role === 'nakes'
      ? `${currentUser.uid}_${targetUid}`
      : `${targetUid}_${currentUser.uid}`;

    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const liveMsgs: ChatMessage[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          const isMe = data.senderId === currentUser.uid;
          const date = data.createdAt ? data.createdAt.toDate() : new Date();
          return {
            id: docSnap.id,
            senderId: data.senderId,
            receiverId: data.receiverId,
            text: data.text || '',
            timestamp: dayjs(date).format('HH:mm'),
            isMe,
            isVoice: data.isVoice || false,
            voiceDuration: data.voiceDuration || undefined,
            attachmentName: data.attachmentName || undefined,
            attachmentType: data.attachmentType || undefined,
            createdAt: data.createdAt
          };
        });
        setMessages(liveMsgs);
      } else {
        // Fallback realistic dialogue for Dr. Airlangga
        if (selectedContact.id === 'c-airlangga' || selectedContact.uid === 'nakes_airlangga') {
          setMessages(language === 'en' ? INITIAL_CONSULTATION_MESSAGES_EN : INITIAL_CONSULTATION_MESSAGES);
        } else {
          setMessages([
            {
              id: 'init-starter',
              senderId: selectedContact.uid,
              text: language === 'en'
                ? `Hello Parent, I am ${selectedContact.name}. Feel free to ask any questions regarding child growth, KMS chart, or nutrition.`
                : `Halo Ayah/Bunda, saya ${selectedContact.name}. Silakan sampaikan pertanyaan mengenai tumbuh kembang, grafik KMS, atau asupan nutrisi si kecil.`,
              timestamp: dayjs().format('HH:mm'),
              isMe: false
            }
          ]);
        }
      }

      // Mark unread messages
      snapshot.docs.forEach(docSnap => {
        const msgData = docSnap.data();
        if (msgData.senderId !== currentUser.uid && msgData.read === false) {
          updateDoc(doc(db, 'messages', docSnap.id), { read: true }).catch(console.error);
        }
      });
    }, (err) => {
      console.warn('Firestore message listener warning:', err);
    });

    return () => unsubscribe();
  }, [selectedContact, currentUser]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Call duration counter
  useEffect(() => {
    let timer: any;
    if (activeCall) {
      timer = setInterval(() => setCallDuration(p => p + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [activeCall]);

  // Voice recording timer
  useEffect(() => {
    let timer: any;
    if (isRecordingVoice) {
      timer = setInterval(() => setVoiceSeconds(p => p + 1), 1000);
    } else {
      setVoiceSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecordingVoice]);

  // Referral states for patient (orang_tua)
  const referredContact = React.useMemo(() => {
    if (currentUser.role !== 'orang_tua') return null;
    return contacts.find(c => c.isAssignedNakes) || null;
  }, [contacts, currentUser.role]);

  const isChatAllowed = currentUser.role !== 'orang_tua' || Boolean(selectedContact?.isAssignedNakes);

  const handleSendMessage = async (customText?: string) => {
    if (!isChatAllowed) return;
    const textToSend = (customText || inputText).trim();
    if (!textToSend) return;

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      senderId: currentUser.uid,
      receiverId: selectedContact.uid,
      text: textToSend,
      timestamp: dayjs().format('HH:mm'),
      isMe: true
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    try {
      const targetUid = selectedContact.uid;
      const chatId = currentUser.role === 'nakes'
        ? `${currentUser.uid}_${targetUid}`
        : `${targetUid}_${currentUser.uid}`;

      await addDoc(collection(db, 'messages'), {
        chatId,
        senderId: currentUser.uid,
        receiverId: targetUid,
        text: textToSend,
        createdAt: serverTimestamp(),
        read: false
      });
    } catch (err) {
      console.error('Failed to save message in Firestore:', err);
    }
  };

  const handleVoiceSend = async () => {
    if (!isChatAllowed) return;
    setIsRecordingVoice(false);
    const durationFormatted = `0:${voiceSeconds < 10 ? '0' : ''}${voiceSeconds}`;
    const voiceMsg: ChatMessage = {
      id: 'voice_' + Date.now(),
      senderId: currentUser.uid,
      text: `Pesan Suara Konsultasi (${durationFormatted})`,
      timestamp: dayjs().format('HH:mm'),
      isMe: true,
      isVoice: true,
      voiceDuration: durationFormatted
    };

    setMessages(prev => [...prev, voiceMsg]);

    try {
      const targetUid = selectedContact.uid;
      const chatId = currentUser.role === 'nakes'
        ? `${currentUser.uid}_${targetUid}`
        : `${targetUid}_${currentUser.uid}`;

      await addDoc(collection(db, 'messages'), {
        chatId,
        senderId: currentUser.uid,
        receiverId: targetUid,
        text: `Pesan Suara Konsultasi (${durationFormatted})`,
        isVoice: true,
        voiceDuration: durationFormatted,
        createdAt: serverTimestamp(),
        read: false
      });
    } catch (err) {
      console.error('Voice note send error:', err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isChatAllowed) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const isImg = file.type.startsWith('image/');
    const textMsg = isImg 
      ? `📷 Foto Grafik KMS / Dokumen Anak: ${file.name}` 
      : `📄 Berkas Hasil Skrining: ${file.name}`;
    handleSendMessage(textMsg);
  };

  const onlineCount = contacts.filter(c => c.online).length;

  // Filter contacts: for patients (orang_tua), strictly show only the officially referred health worker
  const filteredContacts = contacts.filter(c => {
    if (currentUser.role === 'orang_tua') {
      return Boolean(c.isAssignedNakes);
    }

    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.specialty && c.specialty.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = 
      filterCategory === 'all' ? true :
      filterCategory === 'online' ? c.online :
      filterCategory === 'posyandu' ? (c.category === 'posyandu' || c.isGroup) :
      c.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-4 lg:gap-6 overflow-hidden select-none font-sans">
      
      {/* LEFT PANEL: Contacts & Posyandu Consultation Channels */}
      <aside 
        aria-label="Daftar Kontak dan Saluran Konsultasi"
        className={cn(
          "w-full md:w-[320px] lg:w-[360px] shrink-0 flex flex-col gap-3.5 h-full overflow-hidden",
          mobileView === 'list' ? 'flex' : 'hidden md:flex'
        )}
      >
        {/* Top Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs shrink-0">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-[#1b4332] dark:text-emerald-400" />
                {currentUser.role === 'orang_tua' ? txt.parentHeaderTitle : txt.headerTitle}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentUser.role === 'orang_tua' ? txt.parentHeaderSubtitle : txt.headerSubtitle}
              </p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {/* Language Toggle ID / EN */}
              <div 
                className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs"
                role="group"
                aria-label={txt.languageToggleTitle}
              >
                <button
                  type="button"
                  onClick={() => setLanguage('id')}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                    language === 'id'
                      ? "bg-[#1b4332] text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                  title="Bahasa Indonesia"
                >
                  <span className="text-[10px]">🇮🇩</span>
                  <span>ID</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                    language === 'en'
                      ? "bg-[#1b4332] text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                  title="English"
                >
                  <span className="text-[10px]">🇬🇧</span>
                  <span>EN</span>
                </button>
              </div>

              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title={txt.serviceActive} />
            </div>
          </div>

          {currentUser.role === 'nakes' ? (
            <>
              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={txt.searchPlaceholder}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#1b4332]/20 dark:focus:ring-emerald-500/20 transition-all"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar pt-1">
                {[
                  { id: 'all', label: txt.categories.all },
                  { id: 'online', label: `🟢 Online (${onlineCount})` },
                  { id: 'dokter', label: txt.categories.dokter },
                  { id: 'bidan', label: txt.categories.bidan },
                  { id: 'gizi', label: txt.categories.gizi },
                  { id: 'posyandu', label: txt.categories.posyandu }
                ].map(tab => (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => setFilterCategory(tab.id as any)}
                    className={cn(
                      "text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap",
                      filterCategory === tab.id
                        ? "bg-[#1b4332] text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {txt.referralOnlyBadge}
              </span>
              {referredContact ? (
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full",
                  referredContact.online 
                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                )}>
                  {referredContact.online ? 'Online' : 'Offline'}
                </span>
              ) : (
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-semibold px-2 py-0.5 rounded-full">
                  {txt.awaitingNakesReferral}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Contacts List Card (Direct Database Integration) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex-1 overflow-y-auto space-y-1.5">
          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {currentUser.role === 'orang_tua' ? txt.parentHeaderTitle : `${txt.databaseContacts} (${filteredContacts.length})`}
            </span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{txt.liveFirestore}</span>
            </div>
          </div>

          {loadingContacts ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#1b4332] dark:text-emerald-400" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {txt.loadingDb}
              </p>
              <span className="text-[10px] text-slate-400">{txt.syncingDb}</span>
            </div>
          ) : filteredContacts.length === 0 ? (
            currentUser.role === 'orang_tua' ? (
              <div className="flex flex-col items-center justify-center py-6 px-2 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/60 dark:to-teal-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center mb-3 text-[#1b4332] dark:text-emerald-400 shadow-xs">
                  <Stethoscope className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
                  {txt.emptyReferralTitle}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                  {txt.emptyReferralSubtitle}
                </p>

                {/* 3 Step Guidance */}
                <div className="w-full text-left space-y-2 mb-4 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    {txt.howToGetReferralTitle}
                  </div>
                  <div className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="w-4 h-4 rounded-full bg-[#1b4332] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                    <span>{txt.step1Desc}</span>
                  </div>
                  <div className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="w-4 h-4 rounded-full bg-[#1b4332] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                    <span>{txt.step2Desc}</span>
                  </div>
                  <div className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="w-4 h-4 rounded-full bg-[#1b4332] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                    <span>{txt.step3Desc}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onBackToDashboard}
                  className="w-full py-2.5 px-3 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>{txt.backToDashboardAction}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-3 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2.5 text-slate-400">
                  <Users className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {txt.emptyParents}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[220px] leading-relaxed">
                  {txt.emptyParentsDesc}
                </p>
              </div>
            )
          ) : (
            filteredContacts.map(contact => {
              const isSelected = selectedContact?.id === contact.id || selectedContact?.uid === contact.uid;
              return (
                <button
                  type="button"
                  key={contact.id || contact.uid}
                  onClick={() => {
                    setSelectedContact(contact);
                    setMobileView('chat');
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-2.5 sm:p-3 rounded-xl transition-all text-left group border",
                    isSelected 
                      ? "bg-[#1b4332]/5 dark:bg-emerald-950/40 border-[#1b4332]/20 dark:border-emerald-800 shadow-xs" 
                      : "bg-white dark:bg-slate-900 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  )}
                >
                  {/* Avatar with Online / Offline Indicator */}
                  <div className="relative shrink-0">
                    <img 
                      src={contact.avatar} 
                      alt={contact.name} 
                      className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                    />
                    {contact.online ? (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full">
                        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                      </span>
                    ) : (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-slate-400 dark:bg-slate-500 border-2 border-white dark:border-slate-900 rounded-full" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={cn(
                        "text-xs sm:text-sm font-bold truncate",
                        isSelected ? "text-[#1b4332] dark:text-emerald-400" : "text-slate-900 dark:text-slate-100"
                      )}>
                        {contact.name}
                      </span>
                      {contact.timestamp && (
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {contact.timestamp}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                        {getTranslatedRole(contact.role, language)}
                      </span>
                      {contact.online ? (
                        <span className="text-[9px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-full border border-emerald-200/80 dark:border-emerald-800 shrink-0">
                          Online
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded-full shrink-0">
                          Offline
                        </span>
                      )}
                      {contact.isAssignedNakes ? (
                        <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-1 border border-emerald-200/80 dark:border-emerald-800">
                          <ShieldCheck className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                          {currentUser.role === 'nakes' ? txt.badgeYourPatient : txt.badgeYourNakes}
                        </span>
                      ) : (
                        currentUser.role === 'orang_tua' && (
                          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-0.5 border border-slate-200/60 dark:border-slate-700">
                            <Lock className="w-2.5 h-2.5 text-slate-400" />
                            {txt.badgeNeedReferral}
                          </span>
                        )
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate font-normal flex-1">
                        {contact.lastMessage || txt.startNewChat}
                      </p>
                      {Boolean(contact.unreadCount && contact.unreadCount > 0) && (
                        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-xs">
                          {contact.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* RIGHT MAIN PANEL: Active Medical Consultation Chat Window */}
      <section 
        aria-label="Ruang Percakapan Konsultasi Medis"
        className={cn(
          "flex-1 bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-full overflow-hidden relative",
          mobileView === 'chat' ? 'flex' : 'hidden md:flex'
        )}
      >
        {!selectedContact ? (
          currentUser.role === 'orang_tua' ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 text-center bg-gradient-to-b from-slate-50/70 via-white to-slate-50/50 dark:from-slate-950/60 dark:via-slate-900 dark:to-slate-950/80 relative overflow-y-auto">
              {/* Language Toggle in Top-Right */}
              <div 
                className="absolute top-4 right-4 flex items-center bg-white dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs"
                role="group"
                aria-label={txt.languageToggleTitle}
              >
                <button
                  type="button"
                  onClick={() => setLanguage('id')}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                    language === 'id'
                      ? "bg-[#1b4332] text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                  title="Bahasa Indonesia"
                >
                  <span className="text-[10px]">🇮🇩</span>
                  <span>ID</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                    language === 'en'
                      ? "bg-[#1b4332] text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                  title="English"
                >
                  <span className="text-[10px]">🇬🇧</span>
                  <span>EN</span>
                </button>
              </div>

              {/* Hero Icon with glowing badge */}
              <div className="relative mb-4 mt-6 sm:mt-0">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#1b4332] to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
                  <Stethoscope className="w-10 h-10" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white dark:bg-slate-900 p-0.5 shadow-md flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {txt.referralOnlyBadge}
              </span>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight mb-2 max-w-lg">
                {txt.emptyReferralTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md leading-relaxed mb-6">
                {txt.emptyReferralSubtitle}
              </p>

              {/* Feature Preview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl w-full mb-6 text-left">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center mb-2.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-1">
                    {txt.featureKmsTitle}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {txt.featureKmsDesc}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-2.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-1">
                    {txt.featureKpspTitle}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {txt.featureKpspDesc}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center mb-2.5">
                    <Video className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-1">
                    {txt.featureCallTitle}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {txt.featureCallDesc}
                  </p>
                </div>
              </div>

              {/* Referral Notice */}
              <div className="max-w-xl w-full p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-900/60 rounded-2xl flex items-start gap-3 text-left mb-6 shadow-2xs">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                  <span className="font-bold block mb-0.5">{txt.noReferralAlertTitle}</span>
                  {txt.noReferralAlertDesc}
                </div>
              </div>

              {/* CTA Button to return to Dashboard */}
              <button
                type="button"
                onClick={onBackToDashboard}
                className="py-3 px-6 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <span>{txt.backToDashboardAction}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/60 dark:bg-slate-950/40 relative">
              {/* Language Toggle in Empty State */}
              <div 
                className="absolute top-4 right-4 flex items-center bg-white dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs"
                role="group"
                aria-label={txt.languageToggleTitle}
              >
                <button
                  type="button"
                  onClick={() => setLanguage('id')}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                    language === 'id'
                      ? "bg-[#1b4332] text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                  title="Bahasa Indonesia"
                >
                  <span className="text-[10px]">🇮🇩</span>
                  <span>ID</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                    language === 'en'
                      ? "bg-[#1b4332] text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                  title="English"
                >
                  <span className="text-[10px]">🇬🇧</span>
                  <span>EN</span>
                </button>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center mb-4 text-[#1b4332] dark:text-emerald-400">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
                {txt.emptySelectPromptTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                {txt.emptySelectPromptDesc}
              </p>
            </div>
          )
        ) : (
          <>
            {/* Chat Window Header */}
            <header className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile Back Button */}
                <button
                  type="button"
                  onClick={() => setMobileView('list')}
                  className="md:hidden p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0"
                  title={txt.backToList}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Doctor/Nakes Avatar with Live Indicator */}
                <div 
                  className="relative cursor-pointer shrink-0"
                  onClick={() => setShowInfoModal(true)}
                  title={txt.clickProfile}
                >
                  <img 
                    src={selectedContact.avatar} 
                    alt={selectedContact.name} 
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                  />
                  {selectedContact.online ? (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full">
                      <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                    </span>
                  ) : (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-slate-400 dark:bg-slate-500 border-2 border-white dark:border-slate-900 rounded-full" />
                  )}
                </div>

                {/* Name & Role */}
                <div className="min-w-0">
                  <h2 
                    onClick={() => setShowInfoModal(true)}
                    className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-50 cursor-pointer hover:text-[#1b4332] dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5 truncate"
                  >
                    <span className="truncate">{selectedContact.name}</span>
                    {selectedContact.isAssignedNakes ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] border border-emerald-200/80 dark:border-emerald-800 shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{currentUser.role === 'nakes' ? txt.badgeYourPatient : txt.badgeYourNakes}</span>
                      </span>
                    ) : (
                      currentUser.role === 'orang_tua' && (
                        <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] border border-amber-200 dark:border-amber-800 shrink-0">
                          <Lock className="w-3 h-3 text-amber-600" />
                          <span>{txt.badgeNotReferred}</span>
                        </span>
                      )
                    )}
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate flex items-center gap-1.5">
                    <span>{getTranslatedRole(selectedContact.role, language)}</span>
                    <span>•</span>
                    {selectedContact.online ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] border border-emerald-200/80 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {txt.online}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] border border-slate-200 dark:border-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        {txt.offline}
                      </span>
                    )}
                  </p>
                </div>
              </div>

          {/* Action Icons & Language Toggle (Brand Style: Forest Green & Emerald) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Language Toggle in Chat Header */}
            <div 
              className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs mr-1"
              role="group"
              aria-label={txt.languageToggleTitle}
            >
              <button
                type="button"
                onClick={() => setLanguage('id')}
                className={cn(
                  "px-2 py-1 rounded-lg text-[11px] font-bold transition-all",
                  language === 'id'
                    ? "bg-[#1b4332] text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                )}
                title="Bahasa Indonesia"
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={cn(
                  "px-2 py-1 rounded-lg text-[11px] font-bold transition-all",
                  language === 'en'
                    ? "bg-[#1b4332] text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                )}
                title="English"
              >
                EN
              </button>
            </div>

            <button
              type="button"
              disabled={!isChatAllowed}
              onClick={() => {
                if (!isChatAllowed) return;
                setActiveCall('audio');
                setIsMuted(false);
              }}
              title={!isChatAllowed ? txt.callRestricted : txt.callVoice}
              className={cn(
                "p-2 sm:p-2.5 rounded-xl transition-all",
                isChatAllowed 
                  ? "text-slate-600 dark:text-slate-300 hover:text-[#1b4332] hover:bg-[#1b4332]/10 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/30"
                  : "text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40"
              )}
            >
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              type="button"
              disabled={!isChatAllowed}
              onClick={() => {
                if (!isChatAllowed) return;
                setActiveCall('video');
                setIsMuted(false);
                setIsVideoOff(false);
              }}
              title={!isChatAllowed ? txt.callRestricted : txt.callVideo}
              className={cn(
                "p-2 sm:p-2.5 rounded-xl transition-all",
                isChatAllowed 
                  ? "text-slate-600 dark:text-slate-300 hover:text-[#1b4332] hover:bg-[#1b4332]/10 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/30"
                  : "text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40"
              )}
            >
              <Video className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              type="button"
              onClick={() => setShowInfoModal(true)}
              title={txt.practiceProfile}
              className="p-2 sm:p-2.5 text-slate-600 dark:text-slate-300 hover:text-[#1b4332] hover:bg-[#1b4332]/10 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/30 rounded-xl transition-all"
            >
              <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </header>

        {/* Chat Feed Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/60 dark:bg-slate-950/40">
          
          {/* Emergency Alert Banner - Mandatory per Design System 4.6 */}
          <div className="max-w-lg mx-auto p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-center justify-center gap-2 text-xs text-[#B91C1C] dark:text-rose-300 font-semibold text-center shadow-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span>Chat ini bukan untuk kondisi darurat. Hubungi 119 atau datang ke IGD.</span>
          </div>

          {/* Referral Status Notice Banner */}
          {selectedContact.isAssignedNakes ? (
            <div className="max-w-lg mx-auto p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-center text-xs text-emerald-900 dark:text-emerald-300 shadow-xs">
              <span className="font-bold flex items-center justify-center gap-1.5 mb-1 text-emerald-800 dark:text-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {txt.officialReferralTitle}
              </span>
              <p className="text-[11px] leading-relaxed text-emerald-700 dark:text-emerald-400">
                {txt.officialReferralDesc}
              </p>
            </div>
          ) : (
            currentUser.role === 'orang_tua' && (
              <div className="max-w-lg mx-auto p-4 bg-amber-50/95 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 rounded-2xl text-amber-900 dark:text-amber-200 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-800 dark:text-amber-300 mb-1.5">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{txt.lockedChatBannerTitle}</span>
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-300/90 leading-relaxed mb-3">
                  {txt.lockedChatBannerDesc}
                </p>
                
                {/* Dynamic Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-amber-200/60 dark:border-amber-800/50">
                  <button
                    type="button"
                    onClick={() => setShowInfoModal(true)}
                    className="text-xs font-semibold px-3 py-1.5 bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-200 rounded-xl border border-amber-200 dark:border-amber-700 hover:bg-amber-100/50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>{txt.practiceProfile}</span>
                  </button>

                  {referredContact ? (
                    <button
                      type="button"
                      onClick={() => setSelectedContact(referredContact)}
                      className="text-xs font-bold px-3 py-1.5 bg-[#0F766E] text-white rounded-xl hover:bg-[#115E59] transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>{txt.switchToReferredAction} ({referredContact.name.split(',')[0]})</span>
                    </button>
                  ) : (
                    <div className="w-full mt-1 p-2.5 bg-amber-100/70 dark:bg-amber-900/30 rounded-xl border border-amber-200/80 dark:border-amber-800/50 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                      <span>{txt.awaitingNakesReferralNote}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          )}

          {/* Offline Health Worker Notice Banner */}
          {!selectedContact.online && (
            <div className="max-w-lg mx-auto p-3.5 bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 mt-1 shrink-0" />
              <div className="flex-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  {language === 'en' ? 'Health Worker is currently Offline' : 'Tenaga Medis Sedang Offline'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 leading-relaxed">
                  {selectedContact.statusText || (language === 'en' ? 'You can still leave messages or submit KPSP records. The health worker will reply once online.' : 'Anda tetap dapat mengirimkan pesan konsultasi atau data skrining. Tenaga medis akan merespons saat kembali bertugas.')}
                </span>
              </div>
            </div>
          )}

          {/* Messages Stream */}
          {messages.map(msg => {
            if (msg.isMe) {
              // Outgoing Message (Brand Primary Teal #0F766E, crisp white text, radius 16px ekor 4px)
              return (
                <div key={msg.id} className="flex flex-col items-end">
                  <div className="bg-[#0F766E] text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl rounded-tr-xs text-xs sm:text-sm font-normal leading-relaxed max-w-[85%] sm:max-w-[70%] shadow-xs">
                    {msg.isVoice ? (
                      <div className="flex items-center gap-2 font-medium">
                        <Mic className="w-4 h-4 text-teal-200 animate-pulse" />
                        <span>{msg.text}</span>
                        <span className="text-[11px] text-teal-100">({msg.voiceDuration})</span>
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 pr-1 flex items-center gap-1 font-medium">
                    {msg.timestamp}
                    <CheckCheck className="w-3.5 h-3.5 text-[#0F766E] dark:text-teal-400 inline" />
                  </span>
                </div>
              );
            } else {
              // Incoming Message (Soft bg-subtle Slate/White Card, radius 16px ekor 4px)
              return (
                <div key={msg.id} className="flex flex-col items-start">
                  <div className="bg-[#F1F5F9] dark:bg-[#1B2942] text-[#0F172A] dark:text-[#F1F5F9] border border-slate-200/80 dark:border-slate-700/60 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl rounded-tl-xs text-xs sm:text-sm font-normal leading-relaxed max-w-[85%] sm:max-w-[70%] shadow-xs">
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 pl-1 font-medium">
                    {msg.timestamp}
                  </span>
                </div>
              );
            }
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Consultation Chips (Only when chat is allowed) */}
        {isChatAllowed && (
          <div className="px-4 sm:px-6 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              {txt.quickQuestionsLabel}
            </span>
            {txt.quickQuestions.map((topic) => (
              <button
                type="button"
                key={topic}
                onClick={() => handleSendMessage(topic)}
                className="text-xs font-medium px-3 py-1.5 bg-slate-100 hover:bg-[#1b4332]/10 dark:bg-slate-800 dark:hover:bg-emerald-950/50 text-slate-700 hover:text-[#1b4332] dark:text-slate-300 dark:hover:text-emerald-300 rounded-full transition-colors whitespace-nowrap shrink-0 border border-slate-200/60 dark:border-slate-700"
              >
                {topic}
              </button>
            ))}
          </div>
        )}

        {/* Bottom Message Input Capsule Bar vs Locked State */}
        {isChatAllowed ? (
          <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="bg-slate-100/90 dark:bg-slate-800/90 rounded-2xl p-1.5 sm:p-2 pl-3 sm:pl-4 flex items-center gap-2 border border-slate-200 dark:border-slate-700 shadow-xs"
            >
              {/* Attachment Button */}
              <input 
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title={txt.attachTooltip}
                className="p-1.5 text-slate-500 hover:text-[#1b4332] dark:hover:text-emerald-400 transition-colors"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* Input Box */}
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={txt.chatPlaceholder}
                className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />

              {/* Camera Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title={txt.cameraTooltip}
                className="p-1.5 text-slate-500 hover:text-[#1b4332] dark:hover:text-emerald-400 transition-colors hidden sm:block"
              >
                <Camera className="w-5 h-5" />
              </button>

              {/* Emoji Button */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="Emoji"
                className="p-1.5 text-slate-500 hover:text-[#1b4332] dark:hover:text-emerald-400 transition-colors relative"
              >
                <Smile className="w-5 h-5" />

                {showEmojiPicker && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-12 right-0 bg-white dark:bg-slate-800 p-2.5 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 z-30"
                  >
                    {['👍', '❤️', '👶', '🥛', '🍎', '🩺', '🙏', '😊'].map(emoji => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => {
                          setInputText(prev => prev + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="text-base hover:scale-125 transition-transform p-1"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </button>

              {/* Send / Microphone Button in Brand Green */}
              {inputText.trim() ? (
                <button
                  type="submit"
                  title={txt.sendMessageTooltip}
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-xl flex items-center justify-center transition-all shadow-sm shrink-0 hover:scale-105"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (isRecordingVoice) {
                      handleVoiceSend();
                    } else {
                      setIsRecordingVoice(true);
                    }
                  }}
                  title={isRecordingVoice ? txt.sendVoiceTooltip : txt.recordVoiceTooltip}
                  className={cn(
                    "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all shadow-sm shrink-0 hover:scale-105",
                    isRecordingVoice 
                      ? "bg-rose-600 text-white animate-pulse" 
                      : "bg-[#1b4332] hover:bg-[#143527] text-white"
                  )}
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Voice recording alert */}
            {isRecordingVoice && (
              <div className="mt-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center justify-between text-xs text-rose-700 dark:text-rose-400">
                <span className="flex items-center gap-2 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  {txt.recordingVoice} (0:{voiceSeconds < 10 ? '0' : ''}{voiceSeconds})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRecordingVoice(false)}
                    className="text-slate-500 hover:text-slate-800 text-[11px] underline"
                  >
                    {txt.cancel}
                  </button>
                  <button
                    type="button"
                    onClick={handleVoiceSend}
                    className="bg-rose-600 text-white font-bold px-2.5 py-1 rounded-lg text-[11px]"
                  >
                    {txt.send}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <div className="bg-white dark:bg-slate-800 border border-amber-200/80 dark:border-amber-900/60 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5">
                    <span>{txt.lockedChatBannerTitle}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {referredContact 
                      ? `${txt.badgeYourNakes}: ${referredContact.name}` 
                      : txt.awaitingNakesReferral}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                {referredContact ? (
                  <button
                    type="button"
                    onClick={() => setSelectedContact(referredContact)}
                    className="px-3.5 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <span>{txt.switchToReferredAction}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowInfoModal(true)}
                    className="px-3.5 py-2 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>{txt.practiceProfile}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        </>
        )}
      </section>

      {/* --- MODAL 1: Audio Call Simulation --- */}
      {activeCall === 'audio' && selectedContact && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center">
            <div className="relative mb-5">
              <img 
                src={selectedContact.avatar} 
                alt={selectedContact.name} 
                className="w-24 h-24 rounded-full object-cover border-4 border-[#1b4332] shadow-md"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {selectedContact.name}
            </h3>
            <p className="text-xs text-[#1b4332] dark:text-emerald-400 font-semibold mb-1">
              {getTranslatedRole(selectedContact.role, language)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-6">
              {callDuration > 0 
                ? `${txt.connectedVoice} ${Math.floor(callDuration / 60)}:${(callDuration % 60).toString().padStart(2, '0')}` 
                : txt.connectingVoice}
            </p>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={cn(
                  "p-3.5 rounded-full transition-all",
                  isMuted ? "bg-amber-100 text-amber-700" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                )}
                title={isMuted ? txt.micMuted : txt.micActive}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveCall(null)}
                className="p-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg shadow-rose-600/30 transition-all hover:scale-105"
                title={txt.endCall}
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: Telemedicine Video Call Simulation --- */}
      {activeCall === 'video' && selectedContact && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-slate-900 rounded-3xl overflow-hidden max-w-3xl w-full h-[520px] shadow-2xl border border-slate-800 relative flex flex-col justify-between">
            <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-[#1b4332]/50 to-slate-950">
              <div className="relative mb-3 flex items-center justify-center">
                <img 
                  src={selectedContact.avatar} 
                  alt={selectedContact.name} 
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-emerald-500/40 shadow-2xl shadow-emerald-950/60"
                />
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />
              </div>
              <p className="text-sm font-semibold text-white/90">{selectedContact.name}</p>
              <p className="text-xs text-emerald-400/80 font-medium">{txt.doctorCameraActive}</p>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
            </div>

            <div className="relative z-10 p-6 flex items-center justify-between text-white">
              <div>
                <h4 className="text-base sm:text-lg font-bold">{selectedContact.name}</h4>
                <p className="text-xs text-emerald-400 font-mono">
                  {txt.callVideo} • {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}
                </p>
              </div>
              <span className="text-xs bg-[#1b4332]/90 px-3 py-1 rounded-full font-semibold border border-emerald-400/30">
                {txt.medicalEncryptedBadge}
              </span>
            </div>

            <div className="absolute bottom-24 right-6 w-32 sm:w-36 h-44 sm:h-48 bg-slate-800 rounded-2xl overflow-hidden border-2 border-white/40 shadow-2xl z-10">
              {isVideoOff ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
                  <VideoOff className="w-5 h-5" />
                  {txt.cameraOffBadge}
                </div>
              ) : (
                <img 
                  src={getParentPlaceholder(currentUser.name || currentUser.email)} 
                  alt="Self Camera" 
                  className="w-full h-full object-cover" 
                />
              )}
              <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                {txt.youBadge}
              </span>
            </div>

            <div className="relative z-10 p-6 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={cn(
                  "p-3.5 rounded-full transition-all text-white",
                  isMuted ? "bg-amber-600" : "bg-white/20 hover:bg-white/30 backdrop-blur-md"
                )}
                title={isMuted ? txt.micMuted : txt.micActive}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={cn(
                  "p-3.5 rounded-full transition-all text-white",
                  isVideoOff ? "bg-amber-600" : "bg-white/20 hover:bg-white/30 backdrop-blur-md"
                )}
                title={isVideoOff ? txt.cameraOffBadge : txt.doctorCameraActive}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveCall(null)}
                className="p-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg shadow-rose-600/40 transition-all hover:scale-105"
                title={txt.endCall}
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: Contact & SIP Details Modal --- */}
      {showInfoModal && selectedContact && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {txt.profileDetailsTitle}
              </h3>
              <button 
                type="button" 
                onClick={() => setShowInfoModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center mb-5">
              <img 
                src={selectedContact.avatar} 
                alt={selectedContact.name} 
                className="w-18 h-18 rounded-full object-cover border-2 border-[#1b4332] shadow-sm mb-2.5"
              />
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {selectedContact.name}
              </h4>
              <p className="text-xs font-semibold text-[#1b4332] dark:text-emerald-400">
                {getTranslatedRole(selectedContact.role, language)}
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-start gap-2.5">
                <Award className="w-4 h-4 text-[#1b4332] dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{txt.specialtyLabel}</span>
                  <span>{selectedContact.specialty || (language === 'en' ? 'Child Growth, Nutrition & Stimulation' : 'Tumbuh Kembang, Nutrisi & Stimulasi Balita')}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{txt.sipLabel}</span>
                  <span>{selectedContact.sipNumber || (language === 'en' ? 'SIP.440/1082/DS-A/2024 (Verified)' : 'SIP.440/1082/DS-A/2024 (Terverifikasi)')}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{txt.facilityLabel}</span>
                  <span>{selectedContact.facility || (language === 'en' ? 'UMS Hospital & Primary Community Health Center' : 'RS UMS & Puskesmas Pembina')}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{txt.hoursLabel}</span>
                  <span>{selectedContact.activeHours || (language === 'en' ? 'Monday - Friday, 08:00 - 15:00 WIB' : 'Senin - Jumat, 08:00 - 15:00 WIB')}</span>
                </div>
              </div>

              {/* Live Presence Status in Profile Modal (Real-time read-only) */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                    Status Layanan Nakes
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                    {selectedContact.statusText || (selectedContact.online 
                      ? (language === 'en' ? 'Online • Ready for Consultation' : 'Online • Siap Melayani Konsultasi') 
                      : (language === 'en' ? 'Offline • Outside Service Hours' : 'Offline • Di Luar Jam Pelayanan'))}
                  </span>
                </div>
                <div className="shrink-0">
                  {selectedContact.online ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Online
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      Offline
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowInfoModal(false)}
              className="mt-5 w-full py-2.5 bg-[#1b4332] hover:bg-[#143527] text-white font-semibold rounded-xl text-xs transition-colors"
            >
              {txt.closeInfo}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
