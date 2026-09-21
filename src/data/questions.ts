import { AgeCategory, Question } from '../types';

export const AGE_EQUIPMENT_DATA: Record<AgeCategory, string> = {
  "3_bulan": "Alat yang perlu disiapkan: Benang Wool Merah",
  "6_bulan": "Alat yang perlu disiapkan: Gulungan Wool Merah, Pensil, Kismis, manik-manik atau uang logam, mainan bayi",
  "9_bulan": "Alat yang perlu disiapkan: Gulungan Wool Merah, Pensil, Kismis-Kacang, atau uang logam, mainan",
  "12_bulan": "Alat yang perlu disiapkan: 2 mainan Kubus, Pensil, kacang-kacangan, manik-manik atau potongan biskuit",
  "15_bulan": "Alat yang perlu disiapkan: 2 mainan kubus, Cangkir",
  "18_bulan": "Alat yang perlu disiapkan: Mainan Kubus, Bola mainan, Pensil, Kertas",
  "21_bulan": "Alat yang perlu disiapkan: 2 Mainan Kubus, Bola tenis, Pensil dan Kertas",
  "24_bulan": "Alat yang perlu disiapkan: 4 Mainan Kubus, Bola Mainan, Pensil dan Kertas",
  "30_bulan": "Alat yang perlu disiapkan: 4 mainan kubus, Bola mainan, Pensil dan Kertas",
  "36_bulan": "Alat yang perlu disiapkan: 6 Kubus Mainan, Bola, Pensil dan Kertas",
  "42_bulan": "Alat yang perlu disiapkan: 8 Kubus, Pensil, Kertas dan Kertas warna-warni",
  "48_bulan": "Alat yang perlu disiapkan: 3 Mainan Kubus, Kertas, Pensil",
  "54_bulan": "Alat yang perlu disiapkan: Kertas, Kertas warna-warni (origami), Pensil",
  "60_bulan": "Alat yang perlu disiapkan: Kertas, Kertas warna-warni (origami), Pensil",
  "66_bulan": "Alat yang perlu disiapkan: Bola Kecil, Kertas, Pensil, 8 Mainan Kubus",
  "72_bulan": "Alat yang perlu disiapkan: Bola Kecil, Kertas, Pensil",
};

export const QUESTIONS_DATA: Record<AgeCategory, Question[]> = {
  "3_bulan": [
    {
      id: "q_3_1",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah kaki dan tangan bayi dapat bergerak bebas saat terlentang?"
    },
    {
      id: "q_3_2",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah bayi menatap wajah anda saat terjaga?"
    },
    {
      id: "q_3_3",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah bayi membalas senyum anda saat diajak tersenyum?"
    },
    {
      id: "q_3_4",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah bayi dapat mengoceh sendiri?"
    },
    {
      id: "q_3_5",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah bayi terkadang tertawa meskipun tidak digelitik?"
    },
    {
      id: "q_3_6",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah kepala bayi dapat mengikuti gerakan benang ke kanan dan ke kiri?",
      imageUrl: "https://lh3.googleusercontent.com/d/1znojDLZnTUQiNe-B9XY0OPRbXHZB_hKS"
    },
    {
      id: "q_3_7",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah bayi dapat mengikuti arah benagn digerakkan ke samping sekitar 180 derajat?",
      imageUrl: "https://lh3.googleusercontent.com/d/18wqpTasy-l_o2vQdqPT2wds9TOEv-VMl"
    },
    {
      id: "q_3_8",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah bayi dapat mengangkat kepalanya seperti pada gambar?",
      imageUrl: "https://lh3.googleusercontent.com/d/1W102GfrmLSs6rkakYlYgNw7KMpikNaj4"
    },
    {
      id: "q_3_9",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah bayi dapat mengangkat kepala membentuk sudut 45?",
      imageUrl: "https://lh3.googleusercontent.com/d/1OKuuvZsRvXi6eMbw8HM-kq5Xt7GgQoi7"
    },
    {
      id: "q_3_10",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah bayi dapat mengangkat kepalanya dengan tegak seperti pada gambar?",
      imageUrl: "https://lh3.googleusercontent.com/d/1Ze36ylaoucRZAkD_TSSawugDn4eKs50f"
    }
  ],
  "6_bulan": [
    {
      id: "q_6_1",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah bayi dapat mengikuti arah benang digerakkan ke samping sekitar 180 derajat?",
      imageUrl: "https://lh3.googleusercontent.com/d/12LgXs1gREQwOUpIkEHY4FrYyqEnAJeJ0"
    },
    {
      id: "q_6_2",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah bayi dapat mempertahankan lehernya saat kedua tangan diangkat/ditarik ke posisi duduk?",
      imageUrl: "https://lh3.googleusercontent.com/d/1arU4hWiAaqn68YqtPlSy8Z7EoW4TLU8r"
    },
    {
      id: "q_6_3",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah bayi dapat mengangkat dada saat tengkurap dengan lengan sebagai penyangga?",
      imageUrl: "https://lh3.googleusercontent.com/d/1NnmUMNRrdeEnfDbvhzEsu4ugVos6-l8U"
    },
    {
      id: "q_6_4",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah kepala bayi tetap tegak saat dipangku?",
      imageUrl: "https://lh3.googleusercontent.com/d/1UpPgTgJITxgtMgQHpW5c8yWBqp7sn6I9"
    },
    {
      id: "q_6_5",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah bayi dapat menggenggam mainan atau pensil saat diletakkan ditelapak tangannya?",
      imageUrl: "https://lh3.googleusercontent.com/d/1mYmkHwSErTDuXdZOUYPb_2tBC08mwxVL"
    },
    {
      id: "q_6_6",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah bayi dapat mengamati benda kecil berwarna warni di sekitarnya?"
    },
    {
      id: "q_6_7",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah bayi dapat menggapai mainan yang diletakkan dekatnya?"
    },
    {
      id: "q_6_8",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah bayi dapat berbalik dari terlentang ke tengkuran dan sebaliknya?"
    },
    {
      id: "q_6_9",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah bayi dapat mengeluarkan suara keras/tertawa saat bergembira?"
    },
    {
      id: "q_6_10",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah bayi tersenyum saat melihat mainan atau benda yang menarik?"
    }
  ],
  "9_bulan": [
    {
      id: "q_9_1",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah bayi dapat mengambil manik-manik/benda kecil dengan ibu jari dan jari telunjuk?",
      imageUrl: "https://lh3.googleusercontent.com/d/1q12Q2lcx42R1_lGh2UA8TFTyXLljKeg7"
    },
    {
      id: "q_9_2",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah bayi dapat mengambil dan memegang 2 kubus dengan kedua tangan?"
    },
    {
      id: "q_9_3",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah bayi mencari benda mencolok yang dijatuhkan dari ke lantai?"
    },
    {
      id: "q_9_4",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah bayi dapat menggapai mainan yang diletakkan agak jauh?"
    },
    {
      id: "q_9_5",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah bayi menengok saat ada orang diam-diam mendekat dari belakang?"
    },
    {
      id: "q_9_6",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "\"Apakah bayi dapat mengatakan 2 suku kata?\nContoh:\"Ma-ma\", \"da-da\", \"ba-ba\""
    },
    {
      id: "q_9_7",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah bayi dapat makan kue kering/biskuit sendiri?"
    },
    {
      id: "q_9_8",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah bayi dapat memindahkan mainan kecil atau kue dari tangan satu ke tangan lain?"
    },
    {
      id: "q_9_9",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah bayi dapat duduk sendiri selama 60 detik tanpa disangga?",
      imageUrl: "https://lh3.googleusercontent.com/d/1t7PAorkZXFYsfMVTaGYQsFqQ80GfIrWn"
    },
    {
      id: "q_9_10",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah bayi dapat mengangkat \nbadannya ke posisi berdiri tanpa bantuan?"
    }
  ],
  "12_bulan": [
    {
      id: "q_12_1",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah anak dapat menggenggam pensil dengan kuat?"
    },
    {
      id: "q_12_2",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah anak dapat mengambil manik-manik/benda kecil dengan ibu jari dan jari telunjuk?",
      imageUrl: "https://lh3.googleusercontent.com/d/1TLp6aQmRuZx2QMDOdDZEB4phkFC51Agf"
    },
    {
      id: "q_12_3",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah anak dapat membenturkan 2 kubus dengan kedua tangan?"
    },
    {
      id: "q_12_4",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat menirukan 2-3 kata?\nContoh: mama, minum, tidur, dll"
    },
    {
      id: "q_12_5",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat mengangkat \nbadannya ke posisi berdiri tanpa bantuan?",
      imageUrl: "https://lh3.googleusercontent.com/d/1Y4RkUJeS3UofhTDppCzneqLNoxxzh1Bx"
    },
    {
      id: "q_12_6",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat duduk sendiri tanpa bantuan dari posisi tidur atau tengkurap?"
    },
    {
      id: "q_12_7",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat mengerti kata \"jangan\"?"
    },
    {
      id: "q_12_8",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak akan mencari ibu atau pengasuh saat bersembunyi dibelakang sesuatu?"
    },
    {
      id: "q_12_9",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak dapat membedakan ibu atau pengasuh dengan orang lain yang belum dikenal?\nContoh: menangis atau tidak mau dipegang"
    },
    {
      id: "q_12_10",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat berdiri dengan berpegangan pada kursi atau meja selama 30 detik atau lebih?"
    }
  ],
  "15_bulan": [
    {
      id: "q_15_1",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah anak dapat membenturkan 2 kubus dengan kedua tangan?",
      imageUrl: "https://lh3.googleusercontent.com/d/1PBc1bacREjollIdbf6rmad6k6okt0p94"
    },
    {
      id: "q_15_2",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah anak dapat memasukkan 1 kubus atau mainan kedalam cangkir?"
    },
    {
      id: "q_15_3",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat berjalan dengan berpegangan?"
    },
    {
      id: "q_15_4",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat mengatakan papa atau ibu secara spesifik?"
    },
    {
      id: "q_15_5",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat mengucapkan 1 kata dengan jelas?"
    },
    {
      id: "q_15_6",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak dapat bertepuk tangan atau melambaikan tangan?"
    },
    {
      id: "q_15_7",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak dapat menunjukkan apa yang diinginkannya tanpa menangis atau merengek?"
    },
    {
      id: "q_15_8",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat berdiri sendiri selama 30 detik?"
    },
    {
      id: "q_15_9",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat membungkuk untu mengambil mainan di lantai tanpa berpegangan dan kemudian berdiri kembali?"
    },
    {
      id: "q_15_10",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat berjalan dengan baik tanpa terhuyung?",
      imageUrl: "https://lh3.googleusercontent.com/d/1ElOxaBY4fqF-K8j-vnHs4rPDdawqvaGo"
    }
  ],
  "18_bulan": [
    {
      id: "q_18_1",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah anak dapat mencorat coret kertas dengan pensil?"
    },
    {
      id: "q_18_2",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat mengucapkan 3 kata?\nContoh: Ibu, mama, nenek, susu, main, dll"
    },
    {
      id: "q_18_3",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak dapat menunjukkan apa yang diinginkannya tanpa menangis atau merengek?"
    },
    {
      id: "q_18_4",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak dapat minum dari cangkir/gelas sendiri?"
    },
    {
      id: "q_18_5",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak dapat menirukan pekerjaan rumah seperti menyapu, mencuci, dll?"
    },
    {
      id: "q_18_6",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah anak dapat menggelindingkan/melempar bola ke arah anda?"
    },
    {
      id: "q_18_7",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat mengambil benda dilantai dengan cara membungkuk kemudian berdiri?",
      imageUrl: "https://lh3.googleusercontent.com/d/1Wb_Q2Trh2sPTNXo-tGnNODFEKGSjlsUB"
    },
    {
      id: "q_18_8",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat berjalan dengan  baik tanpa terhuyung?"
    },
    {
      id: "q_18_9",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat berjalan mundur sebanyak 5 langkah tanpa kehilangan keseimbangan?"
    },
    {
      id: "q_18_10",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat melakukan 1 perintah dengan bantuan isyarat/gerak jari?\nContoh: ambil gelas, tutup pintu, taruh HP"
    }
  ],
  "21_bulan": [
    {
      id: "q_21_1",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah anak dapat mencorat coret kertas dengan pensil?"
    },
    {
      id: "q_21_2",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah anak dapat menyusun 2 kubus?"
    },
    {
      id: "q_21_3",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Sebutkan gambar dibawah ini, Apakah anak dapat menunjukkan minimal 1 gambar?",
      imageUrl: "https://lh3.googleusercontent.com/d/1xKtdjKhDcBdmWWyiG3z6Iae8izp_leng"
    },
    {
      id: "q_21_4",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat menunjukkan 1 bagian tubuh?\nContoh: tangan mana? hidung mana?, dll"
    },
    {
      id: "q_21_5",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat mengucapkan 7 kata?\nContoh: Ibu, mama, nenek, susu, main, bebek, ayam, bakso, dll"
    },
    {
      id: "q_21_6",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak dapat minum dari cangkir/gelas sendiri?"
    },
    {
      id: "q_21_7",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak dapat menirukan pekerjaan rumah seperti menyapu, mencuci, dll?"
    },
    {
      id: "q_21_8",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat berlari tanpa terjatuh?"
    },
    {
      id: "q_21_9",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat mengambil benda dilantai dengan cara membungkuk kemudian berdiri?",
      imageUrl: "https://lh3.googleusercontent.com/d/1up9UKPUU20a2rYl1KM22M-wUVgjMQ4SI"
    },
    {
      id: "q_21_10",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat berjalan mundur sebanyak 5 langkah tanpa kehilangan keseimbangan?"
    }
  ],
  "24_bulan": [
    {
      id: "q_24_1",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah anak dapat mencorat coret kertas dengan pensil?"
    },
    {
      id: "q_24_2",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah anak dapat menyusun 4 kubus?"
    },
    {
      id: "q_24_3",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat menunjukkan 2 bagian tubuh?\nContoh: tangan mana? hidung mana, dll"
    },
    {
      id: "q_24_4",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat merangkai 2 kata?\nContoh: Minum susu, naik motor, beli jajan"
    },
    {
      id: "q_24_5",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak dapat melepas baju dan celama sendiri?"
    },
    {
      id: "q_24_6",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak dapat makan menggunakan sendok sendiri?"
    },
    {
      id: "q_24_7",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat berlari tanpa terjatuh?"
    },
    {
      id: "q_24_8",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat naik tangga sendiri hanya berpegangan pada pegangan tangga?"
    },
    {
      id: "q_24_9",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat menendang bola ke depan tanpa berpegangan?"
    },
    {
      id: "q_24_10",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat melakukan 1 perintah?\nContoh: ambil gelas, tutup pintu, taruh HP"
    }
  ],
  "30_bulan": [
    {
      id: "q_30_1",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah anak dapat menyusun 4 kubus keatas membentuk kereta api?",
      imageUrl: "https://lh3.googleusercontent.com/d/1CY0fonFTVPEGOTRJVKDouS7b10MNbvxs"
    },
    {
      id: "q_30_2",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah anak bisa menirukan membuat garis lurus seperti gambar dibawah ini?\nContoh: minta anak menirukan garis yang anda buat kira-kira 2 cm",
      imageUrl: "https://lh3.googleusercontent.com/d/1-ydvjY4NZ-XHa4B0Jp21zku-lUJPvCq8"
    },
    {
      id: "q_30_3",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat menyebutkan nama 2 gambar dibawah? \njika anak menyebutkan suara hewannya maka tidak terhitung",
      imageUrl: "https://lh3.googleusercontent.com/d/1q1hrp3oQjHRr9V4By69g2QY7qULoVRDJ"
    },
    {
      id: "q_30_4",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat menunjuk 4 gambar di antara gambar-gambar di dibawah ini dengan benar ketika Anda sebutkan namanya?"
    },
    {
      id: "q_30_5",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat menunjukkan 6 bagian tubuh?\nContoh: tangan mana? hidung mana, dll"
    },
    {
      id: "q_30_6",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat mengikuti 2 perintah sekaligus?\nContoh: ambilkan bola dan taruh di meja; ambilkan gelas dan kasih ke ke ibu"
    },
    {
      id: "q_30_7",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak dapat memakai baju atau celana sendiri?"
    },
    {
      id: "q_30_8",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak dapat menyuapi boneka?"
    },
    {
      id: "q_30_9",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat menendang bola kedepan?"
    },
    {
      id: "q_30_10",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat melompat dengan mengangkat kedua kakinya secara bersamaan?"
    }
  ],
  "36_bulan": [
    {
      id: "q_36_1",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah anak dapat menyusun 6 kubus keatas membentuk menara?"
    },
    {
      id: "q_36_2",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah anak bisa menirukan membuat garis lurus kebawah?\nContoh: minta anak menirukan garis yang anda buat",
      imageUrl: "https://lh3.googleusercontent.com/d/1iyvPbjqKshjsiQ5-JsDrdwLMeS8H6wnR"
    },
    {
      id: "q_36_3",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat menyebutkan nama 4 gambar dibawah (bukan suara)?",
      imageUrl: "https://lh3.googleusercontent.com/d/1Z5xJBQtUJQo2GlofU4P38gS0SFbe-Dhu"
    },
    {
      id: "q_36_4",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat mengikuti 2 perintah sekaligus?\nContoh: ambilkan bola dan taruh di meja; ambilkan gelas dan kasih ke ke ibu"
    },
    {
      id: "q_36_5",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah orang lain bisa memahami sebagian isi perkataan/bicara anak?"
    },
    {
      id: "q_36_6",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat membuat kalimat dengan 3 kata?\nContoh: Aku mau minum; ibu beli es; aku makan roti"
    },
    {
      id: "q_36_7",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak dapat menggosok gigi dengan dibantu (ibu manaruh odol)?"
    },
    {
      id: "q_36_8",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak dapat memakai baju atau celana sendiri?"
    },
    {
      id: "q_36_9",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat melempar bola kearah anak dengan jarak 1,5 meter?"
    },
    {
      id: "q_36_10",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat melompati selembar kertas/benda sepanjang 22 cm dengan mengangkat kedua kakinya secara bersamaan?"
    }
  ],
  "42_bulan": [
    {
      id: "q_42_1",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah anak bisa menirukan membuat garis lurus kebawah?\nContoh: minta anak menirukan garis yang anda buat",
      imageUrl: "https://lh3.googleusercontent.com/d/1bWoMqhy_kZ_rALyC9w-3DeOolbbOMC_3"
    },
    {
      id: "q_42_2",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah anak dapat menyusun 8 kubus keatas membentuk menara?"
    },
    {
      id: "q_42_3",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat menunjukkan 2 kegiatan dari gambar yang ada?\nContoh: Mana yang terbang?, mana yang berbicara? manan yang menggonggong, mana yang mengeong?",
      imageUrl: "https://lh3.googleusercontent.com/d/1hDJbNLVyCWB7KKc0RJpkoEjlOod8hPMI"
    },
    {
      id: "q_42_4",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Tanyakan kepada anak pertanyaan dibawah ini satu persatu:\nContoh: kalo lapar, kamu . . . . , kalo haus maka kamu . . . . , kalo mengantuk, maka kamu . . . , kalo dingin, maka kamu . . . ."
    },
    {
      id: "q_42_5",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat menyebutkan 1 warna?",
      imageUrl: "https://lh3.googleusercontent.com/d/1n8ULOJPotNxvsqm51zVcvbYYps8Bh78N"
    },
    {
      id: "q_42_6",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak dapat mencuci tangan dengan benar?"
    },
    {
      id: "q_42_7",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak dapat menyebutkan nama teman atau saudara?"
    },
    {
      id: "q_42_8",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak dapat memakai kaos sendiri?"
    },
    {
      id: "q_42_9",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat melompati selembar kertas/benda sepanjang 22 cm dengan mengangkat kedua kakinya secara bersamaan, tanpa lari?"
    },
    {
      id: "q_42_10",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat berdiri dengan 1 kaki selama 1 detik atau lebih?",
      imageUrl: "https://lh3.googleusercontent.com/d/1K9U3dHtZX-b9wfd9bzhYvD77ywpGdbdf"
    }
  ],
  "48_bulan": [
    {
      id: "q_48_1",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah anak bisa membuat jembatan dari 3 kubus seperti contoh?",
      imageUrl: "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 240 180\" width=\"240\" height=\"180\"><rect x=\"35\" y=\"90\" width=\"60\" height=\"60\" fill=\"%238cc63f\" stroke=\"%23263c32\" stroke-width=\"4\" rx=\"6\"/><rect x=\"145\" y=\"90\" width=\"60\" height=\"60\" fill=\"%238cc63f\" stroke=\"%23263c32\" stroke-width=\"4\" rx=\"6\"/><rect x=\"90\" y=\"30\" width=\"60\" height=\"60\" fill=\"%2365a30d\" stroke=\"%23263c32\" stroke-width=\"4\" rx=\"6\"/></svg>"
    },
    {
      id: "q_48_2",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah anak dapat meniru gambar lingkaran?",
      imageUrl: "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 200\" width=\"200\" height=\"200\"><circle cx=\"100\" cy=\"100\" r=\"70\" fill=\"none\" stroke=\"%231e293b\" stroke-width=\"6\"/></svg>"
    },
    {
      id: "q_48_3",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat menunjukkan 2 kegiatan dari gambar yang ada?\nContoh: Mana yang terbang?, mana yang berbicara? manan yang menggonggong, mana yang mengeong?",
      imageUrl: "https://lh3.googleusercontent.com/d/1hDJbNLVyCWB7KKc0RJpkoEjlOod8hPMI"
    },
    {
      id: "q_48_4",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat menyebutkan nama lengkapnya dengan jelas?"
    },
    {
      id: "q_48_5",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat mengambil dan menghitung 1 kubus/benda?"
    },
    {
      id: "q_48_6",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat menyebutkan kegunaan atau bahan dari 3 benda? \nContoh: gelas untuk apa? piring untuk apa? kursi untuk apa? pensil untuk apa? meja terbuat terbuat dari apa? dll."
    },
    {
      id: "q_48_7",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak bisa bermain ular tangga, kartu, petak umpet, atau  permainan lainnya"
    },
    {
      id: "q_48_8",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak dapat memakai kaos sendiri?"
    },
    {
      id: "q_48_9",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat melompati selembar kertas/benda sepanjang 22 cm?"
    },
    {
      id: "q_48_10",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat berdiri dengan 1 kaki selama 2 detik atau lebih?"
    }
  ],
  "54_bulan": [
    {
      id: "q_54_1",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah anak dapat menunjuk garis yang lebih panjang sebanyak 3 kali dengan benar pada posisi yang berbeda?",
      imageUrl: "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 260 140\" width=\"260\" height=\"140\"><line x1=\"30\" y1=\"45\" x2=\"230\" y2=\"45\" stroke=\"%231e293b\" stroke-width=\"6\" stroke-linecap=\"round\"/><line x1=\"30\" y1=\"95\" x2=\"160\" y2=\"95\" stroke=\"%231e293b\" stroke-width=\"6\" stroke-linecap=\"round\"/></svg>"
    },
    {
      id: "q_54_2",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah anak dapat mencontoh tanda + ?\nJawablah \"Ya\" jika kedua garis berpotongan ditengah",
      imageUrl: "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 200\" width=\"200\" height=\"200\"><line x1=\"100\" y1=\"25\" x2=\"100\" y2=\"175\" stroke=\"%231e293b\" stroke-width=\"6\" stroke-linecap=\"round\"/><line x1=\"25\" y1=\"100\" x2=\"175\" y2=\"100\" stroke=\"%231e293b\" stroke-width=\"6\" stroke-linecap=\"round\"/></svg>"
    },
    {
      id: "q_54_3",
      kategori: "Gerak Halus",
      pertanyaan: "Minta anak menggambar orang tanpa diberi contoh, kemudian hitunglah jumlah bagian tubuh yang digambar.\nApakah anak bisa menggambar orang sebanyak 3 bagian tubuh?"
    },
    {
      id: "q_54_4",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat menyebutkan 2 warna?"
    },
    {
      id: "q_54_5",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah orang lain dapat mengerti semua perkataan/pembicaraan anak?"
    },
    {
      id: "q_54_6",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak bisa bermain ular tangga, kartu, petak umpet, atau  permainan lainnya?"
    },
    {
      id: "q_54_7",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak bisa menggosok gigi tanpa di bantu?"
    },
    {
      id: "q_54_8",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak dapat mengancingkan baju nya sendiri?"
    },
    {
      id: "q_54_9",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat melakukan minimal 2 perintah terkait kata depan?\nContoh: Taruh mainan/benda diatas meja, taruh boneka/mainan dibawah meja, taruh benda/mainan di depan ibu, taruh benda dibelakang pintu, dll"
    },
    {
      id: "q_54_10",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat berdiri dengan 1 kaki selama 2 detik atau lebih?"
    }
  ],
  "60_bulan": [
    {
      id: "q_60_1",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah anak dapat menunjukkan garis yang lebih panjang sebanyak 3 kali? (lihat contoh)",
      imageUrl: "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 260 140\" width=\"260\" height=\"140\"><line x1=\"30\" y1=\"45\" x2=\"230\" y2=\"45\" stroke=\"%231e293b\" stroke-width=\"6\" stroke-linecap=\"round\"/><line x1=\"30\" y1=\"95\" x2=\"160\" y2=\"95\" stroke=\"%231e293b\" stroke-width=\"6\" stroke-linecap=\"round\"/></svg>"
    },
    {
      id: "q_60_2",
      kategori: "Gerak Halus",
      pertanyaan: "Minta anak menggambar orang tanpa diberi contoh, kemudian hitunglah jumlah bagian tubuh yang digambar.\nApakah anak bisa menggambar orang sebanyak 3 bagian tubuh?"
    },
    {
      id: "q_60_3",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat menyebutkan 4 warna?"
    },
    {
      id: "q_60_4",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak mengerti 3 kata sifat?\nContoh: kalo lapar, kamu . . . . , kalo haus maka kamu . . . . , kalo mengantuk, maka kamu . . . , kalo dingin, maka kamu . . . ."
    },
    {
      id: "q_60_5",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak dapat mengancingkan baju nya sendiri?"
    },
    {
      id: "q_60_6",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak tidak rewel dan tenang saat di tinggal orang tua beberapa saat?"
    },
    {
      id: "q_60_7",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak dapat berpakaian sendiri tanpa dibantu?"
    },
    {
      id: "q_60_8",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat melakukan perintah terkait kata depan?\nContoh: Taruh mainan/benda diatas meja, taruh boneka/mainan dibawah meja, taruh benda/mainan di depan ibu, taruh benda dibelakang pintu, dll"
    },
    {
      id: "q_60_9",
      kategori: "Gerak Kasar",
      pertanyaan: "Minta anak untuk berdiri 1 kaki tanpa berpegangan. \nDapatkah ia mempertahankan keseimbangan dalam waktu 2 detik atau lebih?"
    },
    {
      id: "q_60_10",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat melompat dengan 1 kaki?"
    }
  ],
  "66_bulan": [
    {
      id: "q_66_1",
      kategori: "Gerak Halus",
      pertanyaan: "Apakah anak dapat mencontoh tanda + \nJawablah \"Ya\" jika kedua garis berpotongan ditengah",
      imageUrl: "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 200\" width=\"200\" height=\"200\"><line x1=\"100\" y1=\"25\" x2=\"100\" y2=\"175\" stroke=\"%231e293b\" stroke-width=\"6\" stroke-linecap=\"round\"/><line x1=\"25\" y1=\"100\" x2=\"175\" y2=\"100\" stroke=\"%231e293b\" stroke-width=\"6\" stroke-linecap=\"round\"/></svg>"
    },
    {
      id: "q_66_2",
      kategori: "Gerak Halus",
      pertanyaan: "Tunjukkan gambar kotak dibawah dan minta anak menirukan gambar tersebut.  \nApakah anak dapat menggambar seperti contoh?",
      imageUrl: "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 200\" width=\"200\" height=\"200\"><rect x=\"30\" y=\"30\" width=\"140\" height=\"140\" fill=\"none\" stroke=\"%231e293b\" stroke-width=\"6\" rx=\"2\"/></svg>"
    },
    {
      id: "q_66_3",
      kategori: "Gerak Halus",
      pertanyaan: "Minta anak menggambar orang tanpa diberi contoh, kemudian hitunglah jumlah bagian tubuh yang digambar.\nApakah anak bisa menggambar orang sebanyak 3 bagian tubuh?"
    },
    {
      id: "q_66_4",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Minta anak mengambil dan menghitung 5 kubus, dapatkan anak melakukannya dengan benar?"
    },
    {
      id: "q_66_5",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat mengartikan 5 kata? \nContoh: apa itu bola, piring, baju, kursi, TV, mobil, jeruk, dll."
    },
    {
      id: "q_66_6",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Minta anak menyebutkan lawan kata seperti \"kalo gajah besar, maka tikus . . . .\"; kalo api panas, maka es . . . . .\", kalo siang terang, maka malam . . ..\"; kalo ayah tinggi, maka adek . . . .\" \nApakah anak bisa menjawab 3 pertanyaan dengan benar?"
    },
    {
      id: "q_66_7",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak tidak rewel dan tenang saat di tinggal orang tua beberapa saat?"
    },
    {
      id: "q_66_8",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak dapat berpakaian sendiri tanpa dibantu?"
    },
    {
      id: "q_66_9",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat berdiri dengan 1 kaki selama 6 detik?"
    },
    {
      id: "q_66_10",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat mengangkap bola dengan kedua tangannya?"
    }
  ],
  "72_bulan": [
    {
      id: "q_72_1",
      kategori: "Gerak Halus",
      pertanyaan: "Tunjukkan gambar kotak dibawah dan minta anak menirukan gambar tersebut.  \nApakah anak dapat menggambar seperti contoh?",
      imageUrl: "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 200\" width=\"200\" height=\"200\"><rect x=\"30\" y=\"30\" width=\"140\" height=\"140\" fill=\"none\" stroke=\"%231e293b\" stroke-width=\"6\" rx=\"2\"/></svg>"
    },
    {
      id: "q_72_2",
      kategori: "Gerak Halus",
      pertanyaan: "Minta anak menggambar orang tanpa diberi contoh, kemudian hitunglah jumlah bagian tubuh yang digambar.\nApakah anak bisa menggambar orang sebanyak 6 bagian tubuh?"
    },
    {
      id: "q_72_3",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Minta anak menyebutkan lawan kata seperti \"kalo gajah besar, maka tikus . . . .\"; kalo api panas, maka es . . . . .\", kalo siang terang, maka malam . . ..\"; kalo ayah tinggi, maka adek . . . .\" \nApakah anak bisa menjawab 3 pertanyaan dengan benar?"
    },
    {
      id: "q_72_4",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat mengartikan 7 kata? \nContoh: apa itu bola, piring, baju, kursi, TV, mobil, jeruk, dll."
    },
    {
      id: "q_72_5",
      kategori: "Bicara dan Bahasa",
      pertanyaan: "Apakah anak dapat menyebutkan kegunaan atau bahan dari 3 benda? \nContoh: gelas untuk apa? piring untuk apa? kursi untuk apa? pensil untuk apa? meja terbuat terbuat dari apa? dll."
    },
    {
      id: "q_72_6",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak dapat menggosok giginya tanpa bantuan?"
    },
    {
      id: "q_72_7",
      kategori: "Sosialisasi dan Kemandirian",
      pertanyaan: "Apakah anak dapat mengambil makanan atau minuman sendiri tanpa tumpah?"
    },
    {
      id: "q_72_8",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat menangkap bola kecil sebesar bola tenis atau bola kasti hanya dengan menggunakan kedua tangannya?"
    },
    {
      id: "q_72_9",
      kategori: "Gerak Kasar",
      pertanyaan: "Apakah anak dapat berjalan digaris lurus seperti contoh? (posisi tumit kaki depan saat berjalan adalah berdekatan dengan jari kaki yang belakang)"
    },
    {
      id: "q_72_10",
      kategori: "Gerak Kasar",
      pertanyaan: "apakah anak dapat berdiri 1 kaki selama 11 detik?"
    }
  ]
};
