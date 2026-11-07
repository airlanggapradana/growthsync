export interface RecommendedActivity {
  id: string;
  title: string;
  titleEn: string;
  aspect: 'gerak_kasar' | 'gerak_halus' | 'bicara_bahasa' | 'kemandirian';
  aspectLabel: string;
  aspectLabelEn: string;
  description: string;
  descriptionEn: string;
  frequency: string;
  frequencyEn: string;
  tips: string;
  tipsEn: string;
}

export interface TrustedResource {
  id: string;
  title: string;
  organization: string;
  url: string;
  description: string;
  descriptionEn: string;
  badge: string;
  badgeEn: string;
  category: 'kemenkes' | 'idai' | 'who' | 'unicef' | 'primaku';
}

export interface CategoryEducationContent {
  categoryKey: 'sesuai' | 'meragukan' | 'penyimpangan';
  title: string;
  titleEn: string;
  badgeText: string;
  badgeTextEn: string;
  scoreRange: string;
  summary: string;
  summaryEn: string;
  clinicalMeaning: string;
  clinicalMeaningEn: string;
  parentingAdvice: {
    title: string;
    titleEn: string;
    points: { text: string; textEn: string }[];
  };
  recommendedActivities: RecommendedActivity[];
  medicalNextSteps: {
    actionTitle: string;
    actionTitleEn: string;
    timeline: string;
    timelineEn: string;
    steps: { text: string; textEn: string }[];
  };
}

export const EDUKASI_CATEGORIES: Record<'sesuai' | 'meragukan' | 'penyimpangan', CategoryEducationContent> = {
  sesuai: {
    categoryKey: 'sesuai',
    title: 'Perkembangan Anak Sesuai',
    titleEn: 'Age-Appropriate Child Development',
    badgeText: 'Perkembangan Sesuai Usia (Skor 9 - 10)',
    badgeTextEn: 'Appropriate Development (Score 9 - 10)',
    scoreRange: '9 - 10 Jawaban Ya',
    summary: 'Anak menunjukkan penguasaan milestone tumbuh kembang yang optimal pada seluruh aspek (motorik, komunikasi, dan sosial-kemandirian) sesuai usia kronologisnya.',
    summaryEn: 'The child demonstrates optimal milestone mastery across all domains (motor, communication, and social-independence) matching chronological age.',
    clinicalMeaning: 'Hasil ini menandakan perkembangan anak berada dalam rentang normal kurva Kemenkes RI. Kunci utama adalah konsistensi stimulasi positif sehari-hari tanpa membebani anak.',
    clinicalMeaningEn: 'This indicates the child’s development lies safely within standard Indonesian Ministry of Health curves. The key is consistent daily stimulation without pressure.',
    parentingAdvice: {
      title: 'Saran & Pola Asuh yang Direkomendasikan:',
      titleEn: 'Recommended Parenting & Nurturing Guidance:',
      points: [
        {
          text: 'Pertahankan stimulasi teratur melalui bermain interaktif tanpa gawai (screen-free play) minimal 60 menit per hari.',
          textEn: 'Maintain daily interactive play without digital screens for at least 60 minutes per day.'
        },
        {
          text: 'Beri apresiasi verbal (pujian proses) saat anak mencoba hal baru untuk menumbuhkan rasa percaya diri dan ketahanan mental.',
          textEn: 'Provide process-oriented verbal praise when the child attempts new skills to foster confidence and resilience.'
        },
        {
          text: 'Penuhi nutrisi gizi seimbang kaya protein hewani (telur, ikan, daging) dan zat besi untuk mendukung pembentukan sinaps otak.',
          textEn: 'Ensure balanced nutrition rich in animal proteins (eggs, fish, meat) and iron to optimize brain synapse development.'
        },
        {
          text: 'Pertahankan jadwal tidur teratur (10–14 jam per hari sesuai usia) karena hormon pertumbuhan (HGH) diproduksi maksimal saat tidur lelap.',
          textEn: 'Keep a consistent sleep schedule (10–14 hours daily depending on age) as growth hormone peaks during deep sleep.'
        }
      ]
    },
    recommendedActivities: [
      {
        id: 'sesuai_1',
        title: 'Eksplorasi Rintangan Ceria & Gerak Bebas',
        titleEn: 'Obstacle Course & Free Movement Exploration',
        aspect: 'gerak_kasar',
        aspectLabel: 'Gerak Kasar',
        aspectLabelEn: 'Gross Motor',
        description: 'Buat jalur rintangan sederhana dengan bantal lantai, kardus, atau garis lakban. Ajak anak merangkak, melangkah, atau melompat dengan ceria.',
        descriptionEn: 'Create a gentle floor obstacle path using cushions or tape. Encourage crawling, stepping, and joyful hopping.',
        frequency: '15-20 menit setiap pagi/sore',
        frequencyEn: '15-20 minutes morning or afternoon',
        tips: 'Biarkan anak bertelanjang kaki di atas permukaan bervariasi (rumput, lantai kayu, karpet) untuk menstimulasi sensorik telapak kaki.',
        tipsEn: 'Let child play barefoot on varied surfaces (grass, mat, wooden floor) to stimulate foot sensory receptors.'
      },
      {
        id: 'sesuai_2',
        title: 'Bermain Meronce & Memilah Benda Warna-Warni',
        titleEn: 'Threading & Color Sorting Play',
        aspect: 'gerak_halus',
        aspectLabel: 'Gerak Halus',
        aspectLabelEn: 'Fine Motor',
        description: 'Gunakan makaroni berlubang besar, manik kayu ramah anak, atau penjepit baju plastik untuk memindahkan bola kapas ke mangkuk sesuai warna.',
        descriptionEn: 'Use large wooden beads, safe pasta, or child tongs to sort pom-poms into colored bowls.',
        frequency: '3–4 kali per minggu (10-15 menit)',
        frequencyEn: '3–4 times per week (10-15 minutes)',
        tips: 'Melatih koordinasi mata-tangan dan kekuatan jemari (pincer grasp) sebagai fondasi pra-menulis.',
        tipsEn: 'Develops eye-hand coordination and pincer grasp essential for future handwriting.'
      },
      {
        id: 'sesuai_3',
        title: 'Mendongeng Interaktif & Dialog Bolak-Balik',
        titleEn: 'Interactive Storytelling & Turn-Taking Dialogue',
        aspect: 'bicara_bahasa',
        aspectLabel: 'Bicara & Bahasa',
        aspectLabelEn: 'Speech & Language',
        description: 'Bacakan buku bergambar tebal (board book). Berhenti di setiap halaman, tunjuk objek, dan tanyakan: "Kucingnya sedang apa ya?" tunggu respons anak.',
        descriptionEn: 'Read sturdy board books. Pause on pages, point to pictures, and ask open questions: "What is the cat doing?" and wait for child reply.',
        frequency: 'Setiap hari sebelum tidur (15 menit)',
        frequencyEn: 'Every day before bedtime (15 minutes)',
        tips: 'Gunakan intonasi kaya dan perbanyak kosakata baru, ulangi kata yang diucapkan anak dengan kalimat yang lebih lengkap.',
        tipsEn: 'Use rich vocal inflection and expand your child’s words into full descriptive sentences.'
      },
      {
        id: 'sesuai_4',
        title: 'Bermain Peran & Mandiri Menyimpan Mainan',
        titleEn: 'Role-Playing & Independent Toy Cleanup',
        aspect: 'kemandirian',
        aspectLabel: 'Sosialisasi & Kemandirian',
        aspectLabelEn: 'Social & Independence',
        description: 'Bermain pura-pura (memasak, menjadi dokter boneka, atau memberi makan hewan mainan). Ajak anak merapikan mainan ke kotak bersama.',
        descriptionEn: 'Pretend play (cooking, caring for stuffed animals). Guide child to tidy up toys into bins together.',
        frequency: 'Setiap hari setelah selesai bermain',
        frequencyEn: 'Every day after play sessions',
        tips: 'Bangun rasa tanggung jawab secara menyenangkan dengan nyanyian bersih-bersih mainan.',
        tipsEn: 'Build autonomy and responsibility playfully with a cleanup song.'
      }
    ],
    medicalNextSteps: {
      actionTitle: 'Jadwal Pemeriksaan & Skrining Lanjutan:',
      actionTitleEn: 'Follow-Up Screening Schedule:',
      timeline: 'Lakukan skrining berkala berikutnya pada usia milestone KPSP berikutnya (tiap 3 bulan hingga usia 2 tahun, lalu tiap 6 bulan).',
      timelineEn: 'Perform subsequent screening at the next KPSP milestone (every 3 months up to age 2, then every 6 months).',
      steps: [
        {
          text: 'Timbang berat badan, ukur panjang/tinggi badan, dan lingkar kepala rutin setiap bulan di Posyandu atau Puskesmas.',
          textEn: 'Weigh weight, length/height, and head circumference monthly at your local Posyandu or health clinic.'
        },
        {
          text: 'Catat hasil pengukuran pada Buku KIA / grafik KMS digital untuk memastikan kurva pertumbuhan naik mengikuti garis hijau.',
          textEn: 'Log anthropometric data on the Maternal & Child Book (Buku KIA) to confirm steady green-curve gains.'
        },
        {
          text: 'Buka kembali aplikasi GrowthSync saat anak menginjak usia skrining berikutnya untuk evaluasi berkala.',
          textEn: 'Reopen GrowthSync when your child reaches the next age category for regular screening.'
        }
      ]
    }
  },

  meragukan: {
    categoryKey: 'meragukan',
    title: 'Perkembangan Anak Meragukan',
    titleEn: 'Doubtful / Borderline Child Development',
    badgeText: 'Perkembangan Meragukan (Skor 7 - 8)',
    badgeTextEn: 'Doubtful Milestone (Score 7 - 8)',
    scoreRange: '7 - 8 Jawaban Ya',
    summary: 'Terdapat 1 hingga 2 pertanyaan skrining yang belum mampu dilakukan oleh anak. Kondisi ini memerlukan stimulasi intensif dan terfokus selama 2 minggu.',
    summaryEn: 'There are 1 to 2 questions where the child did not yet demonstrate the skill. Focused, intensive stimulation is recommended for 2 weeks.',
    clinicalMeaning: 'Kategori "Meragukan" bukan vonis keterlambatan permanen. Sebagian besar anak dapat mengejar milestone setelah orang tua memberikan stimulasi spesifik dan melatih aspek yang belum tercapai secara sabar.',
    clinicalMeaningEn: 'A "Doubtful" result is not a permanent diagnosis. Most children catch up after receiving targeted home stimulation on specific skills for 2 consecutive weeks.',
    parentingAdvice: {
      title: 'Saran & Strategi Intervensi untuk Orang Tua:',
      titleEn: 'Targeted Parental Intervention Guidance:',
      points: [
        {
          text: 'Fokuskan stimulasi pada aspek yang mendapat jawaban "Tidak" pada kuisioner KPSP tanpa membuat anak merasa tertekan.',
          textEn: 'Focus daily exercises on the specific questions answered "No" on the screening without pressuring the child.'
        },
        {
          text: 'Lakukan stimulasi 3–4 kali sehari dalam durasi pendek (10–15 menit tiap sesi) saat anak dalam kondisi ceria, kenyang, dan segar.',
          textEn: 'Conduct short 10–15 minute stimulation sessions 3–4 times daily when child is cheerful, fed, and rested.'
        },
        {
          text: 'Hindari perbandingan dengan anak lain. Setiap anak memiliki ritme kematangan saraf yang khas, dukung dengan pengulangan konsisten.',
          textEn: 'Avoid comparing with siblings or peers; neurodevelopment progresses at individual paces with repeated practice.'
        },
        {
          text: 'Batasi penggunaan gawai (screen time: TV, HP, tablet) menjadi 0 jam (usia <2 th) atau <30 menit (usia >2 th) karena pasivitas layar menghambat respon bicara.',
          textEn: 'Restrict screen time to zero (under 2 yrs) or under 30 mins (above 2 yrs) as passive viewing delays responsive speech.'
        }
      ]
    },
    recommendedActivities: [
      {
        id: 'meragukan_1',
        title: 'Latihan Penguatan Otot & Keseimbangan Target',
        titleEn: 'Targeted Core Balance & Muscle Strength Play',
        aspect: 'gerak_kasar',
        aspectLabel: 'Gerak Kasar',
        aspectLabelEn: 'Gross Motor',
        description: 'Jika motorik kasar belum tercapai: Latih berdiri bertumpu pada sofa stabil, bermain lempar tangkap bola spons besar, atau melatih jongkok-berdiri mengambil mainan di lantai.',
        descriptionEn: 'If gross motor milestone was unreached: Practice cruise-walking along a sturdy sofa, rolling a soft ball, or squat-to-stand pickups.',
        frequency: '3 kali sehari (10-15 menit per sesi)',
        frequencyEn: '3 times daily (10-15 minutes per session)',
        tips: 'Pegang kedua pinggul anak (bukan menarik tangan) untuk melatih tumpuan kekuatan inti tubuh (core muscles).',
        tipsEn: 'Support child by the hips rather than wrists to engage core postural stability.'
      },
      {
        id: 'meragukan_2',
        title: 'Stimulasi Menjumput Benda & Menggenggam Aktif',
        titleEn: 'Pincer Grasp & Fine Manipulative Drills',
        aspect: 'gerak_halus',
        aspectLabel: 'Gerak Halus',
        aspectLabelEn: 'Fine Motor',
        description: 'Sediakan potongan kecil buah lunak (pepaya/pisang) di piring datar. Ajak anak menjumput dengan ibu jari dan telunjuk. Latih mencoret bebas dengan krayon genggam bulat.',
        descriptionEn: 'Provide small pieces of soft fruits on a tray. Prompt child to pinch with thumb and index finger. Encourage free scribbling with palm crayons.',
        frequency: 'Setiap waktu makan cemilan & sore hari',
        frequencyEn: 'Every snack time and afternoon play',
        tips: 'Bimbing tangan anak dengan teknik "hand-over-hand" pertama kali, lalu kurangi bantuan secara bertahap saat anak mulai mandiri.',
        tipsEn: 'Use hand-over-hand gentle guidance at first, then fade prompts as the child gains autonomy.'
      },
      {
        id: 'meragukan_3',
        title: 'Teknik "Tunggu 5 Detik" & Cermin Bahasa Ekspresif',
        titleEn: 'The 5-Second Wait Technique & Mirror Speech Mimicry',
        aspect: 'bicara_bahasa',
        aspectLabel: 'Bicara & Bahasa',
        aspectLabelEn: 'Speech & Language',
        description: 'Saat anak menginginkan sesuatu, jangan langsung berikan. Tatap matanya setinggi wajahnya, sebutkan nama benda ("Mau bola?"), lalu tunggu 5 detik agar anak berusaha bersuara/menunjuk.',
        descriptionEn: 'When child gestures for an item, pause at eye level. Name the item clearly ("Want ball?"), and wait 5 seconds for a vocal or pointing attempt.',
        frequency: 'Setiap kali berinteraksi sepanjang hari',
        frequencyEn: 'During every natural interaction throughout the day',
        tips: 'Ajak anak berbicara di depan cermin besar agar anak melihat gerakan bibir dan lidah Anda saat melafalkan kata.',
        tipsEn: 'Talk in front of a mirror so child observes your lip and tongue movements as you enunciate.'
      },
      {
        id: 'meragukan_4',
        title: 'Latihan Minum Cangkir Sendiri & Melambaikan Tangan',
        titleEn: 'Independent Cup Drinking & Waving Social Rituals',
        aspect: 'kemandirian',
        aspectLabel: 'Sosialisasi & Kemandirian',
        aspectLabelEn: 'Social & Independence',
        description: 'Beri cangkir kecil dengan sedikit air untuk diminum sendiri dengan dua tangan. Biasakan ritual menyapa keluarga ("Halo", "Dah-dah") dan bermain cilukba interaktif.',
        descriptionEn: 'Offer a small cup with a sip of water for child to hold with two hands. Practice greeting rituals ("Hi", "Bye-bye") and peek-a-boo.',
        frequency: 'Setiap waktu makan dan saat bertemu anggota keluarga',
        frequencyEn: 'Meal times and during family greetings',
        tips: 'Bersabarlah bila tumpah atau belum rapi; kemandirian tumbuh dari kesempatan mencoba berulang kali.',
        tipsEn: 'Be patient with spills; self-reliance builds through repeated opportunities.'
      }
    ],
    medicalNextSteps: {
      actionTitle: 'Tindak Lanjut Medis & Evaluasi Ulang (Protokol Kemenkes):',
      actionTitleEn: 'Medical Follow-up & Re-Evaluation Protocol (Kemenkes):',
      timeline: 'Lakukan stimulasi intensif selama 2 minggu, kemudian lakukan skrining KPSP ulang untuk usia yang sama.',
      timelineEn: 'Carry out targeted stimulation for 2 weeks, then repeat the KPSP screening for the same age milestone.',
      steps: [
        {
          text: 'Fokuskan latihan harian pada butir-butir kuisioner yang belum terjawab "Ya" selama 14 hari penuh.',
          textEn: 'Focus daily exercises on the specific questionnaire items that lacked a "Yes" answer for 14 days.'
        },
        {
          text: 'Setelah 2 minggu, buka menu Skrining di aplikasi untuk mengisi kembali kuisioner KPSP usia tersebut.',
          textEn: 'After 2 weeks, re-enter the Screening menu to retake the KPSP assessment for that age.'
        },
        {
          text: 'Jika hasil skrining ulang naik menjadi Sesuai (skor 9-10), lanjutkan stimulasi rutin. Jika hasil tetap Meragukan (skor 7-8) atau turun, segera bawa anak ke Puskesmas/Dokter Spesialis Anak.',
          textEn: 'If repeat score reaches 9-10, continue routine stimulation. If score remains 7-8 or drops, visit your local clinic/pediatrician for clinical examination.'
        }
      ]
    }
  },

  penyimpangan: {
    categoryKey: 'penyimpangan',
    title: 'Ada Kemungkinan Penyimpangan Pada Perkembangan Anak',
    titleEn: 'Possible Developmental Delay / Deviation',
    badgeText: 'Perlu Rujukan Klinis (Skor ≤ 6)',
    badgeTextEn: 'Clinical Referral Required (Score ≤ 6)',
    scoreRange: '≤ 6 Jawaban Ya',
    summary: 'Ditemukan 3 atau lebih indikator perkembangan penting yang belum terpenuhi pada usia ini. Diperlukan pemeriksaan langsung oleh dokter atau tenaga medis rujukan.',
    summaryEn: 'Three or more developmental milestones were not demonstrated at this age. Direct in-person clinical assessment by a pediatrician or doctor is advised.',
    clinicalMeaning: 'Hasil ini merupakan sinyal kewaspadaan dini (red flag). Bukan diagnosis penyakit, melainkan indikasi kuat bahwa anak membutuhkan asesmen klinis komprehensif, evaluasi pendengaran/penglihatan, serta program intervensi dini yang terarah.',
    clinicalMeaningEn: 'This serves as an early red flag warning. It is not an adverse diagnosis, but a strong recommendation for clinical assessment (vision, hearing, sensory, motor) to start timely early intervention.',
    parentingAdvice: {
      title: 'Langkah Pertama yang Wajib Dilakukan Orang Tua:',
      titleEn: 'Essential Immediate Steps for Parents:',
      points: [
        {
          text: 'Tetap tenang dan jangan merasa bersalah. Deteksi dini adalah anugerah karena masa emas otak (golden age 0-5 tahun) memiliki plastisitas tinggi untuk diperbaiki bila ditangani cepat.',
          textEn: 'Remain calm and do not blame yourself. Early detection is an advantage: the brain’s high plasticity in the first 5 years responds well to early therapy.'
        },
        {
          text: 'Segera jadwalkan kunjungan ke Fasilitas Kesehatan Tingkat Pertama (Puskesmas / Klinik) untuk mendapatkan Surat Rujukan resmi ke Dokter Spesialis Anak (Sp.A).',
          textEn: 'Promptly schedule a visit to your primary healthcare center (Puskesmas) to obtain an official referral to a Pediatrician (Sp.A).'
        },
        {
          text: 'Bawa serta Buku KIA (Kesehatan Ibu dan Anak) serta hasil cetak / ringkasan skrining KPSP dari aplikasi GrowthSync saat berkonsultasi dengan dokter.',
          textEn: 'Bring your child’s KIA book along with the printed / digital summary report from GrowthSync to your medical consultation.'
        },
        {
          text: 'Jalani pemeriksaan menyeluruh untuk menepis faktor penyerta: infeksi telinga/gangguan dengar, defisiensi zat besi, gangguan refraksi mata, atau hipotiroid kongenital.',
          textEn: 'Rule out contributing causes: hearing impairment, iron-deficiency anemia, vision issues, or nutritional deficits.'
        }
      ]
    },
    recommendedActivities: [
      {
        id: 'penyimpangan_1',
        title: 'Stimulasi Sensori Multi-Modal Sederhana & Ramah',
        titleEn: 'Multi-Sensory Gentle Stimulation',
        aspect: 'gerak_kasar',
        aspectLabel: 'Sensori-Motor',
        aspectLabelEn: 'Sensory-Motor',
        description: 'Lakukan pemijatan lembut (baby massage) pada lengan, punggung, dan tungkai anak dengan minyak kelapa/losion hangat untuk membangun kesadaran tubuh (body awareness).',
        descriptionEn: 'Perform gentle massage on arms, back, and legs with warm lotion to enhance tactile and proprioceptive body awareness.',
        frequency: '10–15 menit setiap setelah mandi',
        frequencyEn: '10–15 minutes after bath time',
        tips: 'Gunakan tekanan mantap tapi lembut; amati respon kenyamanan anak dan bicarakan apa yang sedang disentuh.',
        tipsEn: 'Use firm yet gentle pressure; watch for soothing cues and narrate what body part you are touching.'
      },
      {
        id: 'penyimpangan_2',
        title: 'Kontak Mata Erat & Permainan Responsif Wajah',
        titleEn: 'Sustained Eye Contact & Facial Responsiveness',
        aspect: 'bicara_bahasa',
        aspectLabel: 'Komunikasi Dini',
        aspectLabelEn: 'Early Communication',
        description: 'Duduk berhadapan tepat setinggi mata anak. Tiru ekspresi anak, buat bunyi-bunyian vokal menyenangkan ("ooh", "baah"), dan berikan jeda agar anak merespons tatapan atau senyuman.',
        descriptionEn: 'Sit directly at eye level. Mimic your child’s vocalizations, create soothing sounds, and pause to invite gaze or reciprocal smiles.',
        frequency: 'Sepanjang hari setiap momen interaksi intim',
        frequencyEn: 'Throughout the day during quiet intimate moments',
        tips: 'Matikan suara TV atau radio yang bising di ruangan agar anak dapat memfokuskan pendengaran pada suara orang tua.',
        tipsEn: 'Mute background television or loud radio so the child can localize and focus on your voice.'
      },
      {
        id: 'penyimpangan_3',
        title: 'Latihan Tummy Time / Tumpuan Tangan Adaptif',
        titleEn: 'Supported Tummy Time & Weight-Bearing Exercises',
        aspect: 'gerak_kasar',
        aspectLabel: 'Motorik Kasar',
        aspectLabelEn: 'Gross Motor',
        description: 'Jika anak kesulitan mengangkat kepala atau tengkurap, ganjal dada anak dengan handuk kecil yang digulung atau tengkurapkan anak di atas dada orang tua yang sedang bersandar.',
        descriptionEn: 'If child struggles lifting chest or crawling, place a rolled towel under the chest or position child on your inclined chest.',
        frequency: '3–5 menit beberapa kali sehari sesuai toleransi anak',
        frequencyEn: '3–5 minutes multiple times daily as tolerated',
        tips: 'Letakkan mainan berbunyi kerincing atau lampu warna di depan pandangan anak untuk memancing anak mengangkat kepala.',
        tipsEn: 'Place a rattle or colorful soft object directly in sight to motivate head lifting.'
      },
      {
        id: 'penyimpangan_4',
        title: 'Konsultasi & Terapi Tumbuh Kembang Terpadu',
        titleEn: 'Comprehensive Developmental Therapy Consultation',
        aspect: 'kemandirian',
        aspectLabel: 'Intervensi Klinis',
        aspectLabelEn: 'Clinical Intervention',
        description: 'Segera konsultasikan dengan Nakes rujukan Anda di fitur Chat atau kunjungi Poli Tumbuh Kembang RS / Faskes untuk asesmen Fisioterapi, Terapi Wicara, atau Terapi Okupasi.',
        descriptionEn: 'Consult your assigned health worker via the Chat feature or visit a Child Developmental Clinic for Physiotherapy, Speech, or Occupational therapy evaluation.',
        frequency: 'Sesuai rekomendasi Dokter Spesialis Anak',
        frequencyEn: 'As advised by the attending pediatrician',
        tips: 'Catat video pendek (10-30 detik) saat di rumah bila ada gerakan atau respon anak yang ingin Anda konsultasikan ke dokter.',
        tipsEn: 'Record short 10-30s videos of everyday movements or communication attempts to share with your doctor.'
      }
    ],
    medicalNextSteps: {
      actionTitle: 'Alur Rujukan Klinis Resmi (Puskesmas & Rumah Sakit):',
      actionTitleEn: 'Official Clinical Referral Pathway (Health Center & Hospital):',
      timeline: 'Segera dalam waktu 3–7 hari kerja: jangan menunda pemeriksaan medis.',
      timelineEn: 'Promptly within 3–7 business days: do not postpone formal clinical examination.',
      steps: [
        {
          text: 'Kunjungi Dokter Umum di Puskesmas setempat dengan membawa data kuisioner KPSP ini.',
          textEn: 'Visit your primary health doctor at the Puskesmas with this KPSP screening report.'
        },
        {
          text: 'Minta pemeriksaan skrining SDIDTK (Stimulasi, Deteksi, dan Intervensi Dini Tumbuh Kembang) komprehensif.',
          textEn: 'Request a comprehensive SDIDTK (Early Childhood Stimulation & Detection) evaluation.'
        },
        {
          text: 'Dapatkan Surat Rujukan ke Dokter Spesialis Anak (Sp.A) Konsultan Tumbuh Kembang di RSUD / RS rujukan.',
          textEn: 'Obtain an official referral to a Consultant Pediatrician at the district or referral hospital.'
        },
        {
          text: 'Gunakan fitur "Konsultasi Nakes" di aplikasi GrowthSync untuk berdiskusi dengan tenaga kesehatan pendamping wilayah Anda.',
          textEn: 'Use the "Konsultasi Nakes" chat inside GrowthSync to confer directly with your assigned local health worker.'
        }
      ]
    }
  }
};

export const TRUSTED_RESOURCES: TrustedResource[] = [
  {
    id: 'res_kemenkes_buku_kia',
    title: 'Buku KIA (Kesehatan Ibu & Anak) Digital',
    organization: 'Kementerian Kesehatan Republik Indonesia',
    url: 'https://ayosehat.kemkes.go.id/buku-kia',
    description: 'Panduan resmi pemerintah Indonesia untuk memantau kesehatan ibu hamil, grafik pertumbuhan balita (KMS), catatan imunisasi lengkap, dan stimulasi tumbuh kembang anak usia 0-6 tahun.',
    descriptionEn: 'The official Indonesian government guide for child growth curves (KMS), immunization records, and early developmental milestones from age 0 to 6 years.',
    badge: 'Kemenkes RI Resmi',
    badgeEn: 'Official Kemenkes RI',
    category: 'kemenkes'
  },
  {
    id: 'res_idai_tumbuh_kembang',
    title: 'Portal Edukasi Tumbuh Kembang & Pengasuhan Anak',
    organization: 'Ikatan Dokter Anak Indonesia (IDAI)',
    url: 'https://www.idai.or.id/artikel/klinik/pengasuhan-anak',
    description: 'Kumpulan artikel ilmiah dan panduan klinis dari para Dokter Spesialis Anak Indonesia mengenai milestone perkembangan, stimulasi bicara, gizi MPASI, dan jadwal imunisasi mutakhir.',
    descriptionEn: 'Authoritative clinical guides and articles from Indonesian pediatricians covering milestone progression, speech stimulation, weaning nutrition, and vaccination schedules.',
    badge: 'Ikatan Dokter Anak Indonesia',
    badgeEn: 'Indonesian Pediatric Society',
    category: 'idai'
  },
  {
    id: 'res_primaku',
    title: 'Aplikasi Resmi PrimaKu (Mitra IDAI & Kemenkes)',
    organization: 'PrimaKu & IDAI',
    url: 'https://primaku.com',
    description: 'Aplikasi resmi pelacak tumbuh kembang anak berbasis rekomendasi IDAI dengan fitur kurva KMS WHO, kalkulator nutrisi, dan pemantau jadwal imunisasi nasional terpadu.',
    descriptionEn: 'Official Indonesian child development tracker partner of IDAI featuring WHO growth charts, nutrition calculators, and national immunization calendars.',
    badge: 'Aplikasi Rekomendasi IDAI',
    badgeEn: 'IDAI-Endorsed App',
    category: 'primaku'
  },
  {
    id: 'res_who_child_growth',
    title: 'WHO Child Growth & Development Standards',
    organization: 'World Health Organization (WHO)',
    url: 'https://www.who.int/tools/child-growth-standards',
    description: 'Standar baku emas internasional rujukan Kementerian Kesehatan RI untuk kurva antropometri (Berat Badan per Usia, Tinggi Badan per Usia, IMT, dan Lingkar Kepala Balita).',
    descriptionEn: 'The international gold standard charts referenced by the Ministry of Health for assessing infant and toddler weight, length/height, BMI, and head circumference.',
    badge: 'Standar Global WHO',
    badgeEn: 'WHO Global Standard',
    category: 'who'
  },
  {
    id: 'res_unicef_ecd',
    title: 'Panduan Pengasuhan Positif & Tumbuh Kembang Anak',
    organization: 'UNICEF Indonesia',
    url: 'https://www.unicef.org/indonesia/id/tumbuh-kembang-anak',
    description: 'Materi edukasi pengasuhan responsif, stimulasi motorik dan bahasa masa emas (golden age), serta pencegahan stunting melalui asupan protein hewani dan sanitasi sehat.',
    descriptionEn: 'Evidence-based positive parenting resources on responsive caregiving, golden age speech/motor stimulation, and stunting prevention.',
    badge: 'UNICEF Indonesia',
    badgeEn: 'UNICEF Indonesia',
    category: 'unicef'
  },
  {
    id: 'res_ayosehat_kemkes',
    title: 'Direktori Fasilitas Kesehatan & Skrining SDIDTK',
    organization: 'Kemenkes RI - Ayo Sehat',
    url: 'https://ayosehat.kemkes.go.id',
    description: 'Layanan informasi publik Kemenkes RI untuk mencari Puskesmas, Posyandu binaan terdekat, dan jadwal pos pelayanan terpadu di wilayah tempat tinggal Anda.',
    descriptionEn: 'Public health directory by the Ministry of Health to locate nearby Community Health Centers (Puskesmas), Posyandu clinics, and child screening schedules.',
    badge: 'Fasilitas Layanan Kemenkes',
    badgeEn: 'Kemenkes Facilities',
    category: 'kemenkes'
  }
];
