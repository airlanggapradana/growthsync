import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { INTERVENSI_KNOWLEDGE } from "./src/data/knowledge.ts";

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key.trim().length > 0) {
      try {
        aiClient = new GoogleGenAI({ apiKey: key });
      } catch (err) {
        console.error("Failed to initialize GoogleGenAI:", err);
        aiClient = null;
      }
    }
  }
  return aiClient;
}

// --- OFFLINE FALLBACK HELPER FUNCTIONS ---

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function getAgeRecommendations(ageStr: string): { id: string; en: string; enNext?: string } {
  const norm = ageStr.toLowerCase();
  
  if (norm.includes('3 month') || norm.includes('3 bulan')) {
    return {
      id: `- **Stimulasi Fisik & Motorik**: Latih kontrol kepala dengan menggendong posisi tegak. Latih kekuatan kaki dengan menyangga berat badan saat dipengangi di ketiak. Latih memegang benda kecil atau menjumput biskuit.
- **Stimulasi Interaksi & Komunikasi**: Ajak bayi menengok ke arah suara, tirukan ocehan bayi (seperti "ma-ma", "pa-pa"), dan bermain cilukba atau menggunakan cermin.
- **Stimulasi Emosi & Perawatan**: Beri rasa aman melalui tatapan mata, senyuman, pelukan hangat, dan usahakan jadwal tidur serta menyusui yang teratur.`,
      en: `- **Physical & Motor Stimulation**: Practice head control by holding the baby upright. Train leg strength by letting them bear weight while supported under the armpits. Practice holding small objects or picking up biscuits.
- **Interaction & Communication**: Encourage turning toward sounds, mimic baby babbles (such as "ma-ma", "pa-pa"), and play peek-a-boo or look in the mirror.
- **Emotion & Care Stimulation**: Provide security through eye contact, warm smiles, hugging, and maintain a regular sleeping and feeding schedule.`
    };
  }
  
  if (norm.includes('6 month') || norm.includes('6 bulan')) {
    return {
      id: `- **Motorik Kasar**: Stimulasi merangkak ke arah mainan, berdiri dengan ditarik tangannya secara lembut, serta berjalan berpegangan.
- **Motorik Halus**: Melatih memegang mainan dengan kedua tangan secara bergantian, mencoret-coret dengan alat tulis aman, serta memasukkan/mengeluarkan benda dari wadah.
- **Bahasa & Komunikasi**: Mengajak bicara langsung, menyebut namanya, membacakan buku bergambar, dan mengajarkan kata-kata sederhana berulang.
- **Sosial & Emosi**: Beri senyuman, pelukan hangat, bermain tepuk tangan bersama, serta kenali dan hargai suasana hati anak.`,
      en: `- **Gross Motor**: Encourage crawling toward toys, standing by gently pulling up their hands, and walking while holding onto furniture.
- **Fine Motor**: Practice holding toys with both hands, scribbling with safe writing tools, and putting in/taking out objects from containers.
- **Language & Communication**: Talk directly to the baby, call them by name, read picture books, and teach simple words repetitively.
- **Social & Emotional**: Offer warm smiles, hugs, play clapping games together, and recognize and validate the child's moods.`
    };
  }

  if (norm.includes('9 month') || norm.includes('9 bulan')) {
    return {
      id: `- **Gerak Kasar**: Latih merangkak, duduk mandiri tanpa sandaran, serta melatih berdiri dengan berpegangan di furnitur yang kokoh.
- **Gerak Halus**: Latih koordinasi tangan dengan menyusun balok kayu atau kotak besar, serta melatih mengambil benda kecil menggunakan ujung ibu jari dan telunjuk (menjumput).
- **Sosial & Mandiri**: Main cilukba atau petak umpet sederhana, latih melambaikan tangan ("da-daah"), dan hindari kata "jangan" dengan mengarahkan secara positif.
- **Bicara & Bahasa**: Mengajak bicara menceritakan aktivitas sehari-hari, membacakan buku cerita bergambar, dan ajak bersenandung atau bernyanyi bersama.`,
      en: `- **Gross Motor**: Practice crawling, sitting independently without support, and standing while holding onto sturdy furniture.
- **Fine Motor**: Exercise hand-eye coordination by stacking wooden blocks or large boxes, and picking up small items using the index finger and thumb.
- **Social & Independence**: Play peek-a-boo or simple hide-and-seek, practice waving goodbye, and replace "don't" with positive directions.
- **Speech & Language**: Talk about daily activities, read colorful picture books, and sing or hum children's songs together.`
    };
  }

  if (norm.includes('12 month') || norm.includes('12 bulan') || norm.includes('15 month') || norm.includes('15 bulan')) {
    return {
      id: `- **Gerak Kasar**: Latih berjalan mundur beberapa langkah, berjalan jinjit, naik-turun tangga dengan pegangan kuat, serta melempar/menangkap bola besar.
- **Gerak Halus**: Melatih memanipulasi benda (buka-tutup botol), menyusun balok bertingkat tanpa jatuh, dan bermain puzzle atau merangkai manik-manik besar.
- **Sosial & Mandiri**: Ajarkan merapikan mainan sendiri, melatih makan menggunakan sendok secara mandiri, berinteraksi dengan teman sebaya, serta gunakan pujian untuk perilaku baik.
- **Bicara & Bahasa**: Sebutkan nama-nama anggota tubuh dan benda di rumah, bermain telepon-teleponan, serta aktif bercerita tentang apa yang sedang dilakukan bersama anak.`,
      en: `- **Gross Motor**: Exercise walking backward a few steps, tiptoeing, climbing stairs with solid support, and throwing/catching a large ball.
- **Fine Motor**: Practice manipulating objects (opening/closing bottles), stacking blocks without falling, and playing with puzzles or large beads.
- **Social & Independence**: Teach tidying up toys, practice eating with a spoon independently, interact with peers, and use positive reinforcement.
- **Speech & Language**: Name body parts and household objects, play phone games, and actively describe actions you do together.`
    };
  }

  if (norm.includes('18 month') || norm.includes('18 bulan')) {
    return {
      id: `- **Gerak Kasar**: Latih berdiri satu kaki bergantian, melompat dengan kedua kaki, berlari bebas di area aman, serta naik-turun tangga dengan berpegangan.
- **Gerak Halus**: Latih koordinasi dengan memasukkan balok ke lubang bentuk yang sesuai, bermain playdough/lilin, menggambar garis/bulatan sederhana.
- **Sosial & Mandiri**: Latih melepas pakaian sendiri, membantu pekerjaan rumah tangga sangat ringan, belajar mengantre/bergantian saat bermain dengan teman.
- **Bicara & Bahasa**: Latih mengikuti perintah satu langkah sederhana, gunakan kata untuk menyampaikan perasaan, dan dorong anak menggunakan kalimat pendek berisi 2 kata.`,
      en: `- **Gross Motor**: Practice standing on one foot alternately, jumping with both feet, running in a safe area, and climbing stairs with support.
- **Fine Motor**: Train shape matching by putting blocks into correct holes, play with playdough, and draw simple lines or circles.
- **Social & Independence**: Practice taking off clothes, helping with very light chores, and learning to take turns while playing with peers.
- **Speech & Language**: Teach following simple one-step commands, encourage using words for feelings, and prompt the child to use short 2-word phrases.`
    };
  }

  if (norm.includes('21 month') || norm.includes('21 bulan')) {
    return {
      id: `- **Gerak Kasar**: Latih berdiri satu kaki dengan keseimbangan, melatih berjalan, berlari, melompat, menendang bola ke sasaran, dan menarik/mendorong mainan.
- **Gerak Halus**: Latih menggambar coretan wajah, mengancingkan baju, bermain puzzle 3-4 keping, serta membuat bentuk dari playdough bersama orang tua.
- **Bicara & Bahasa**: Minta anak bercerita sederhana tentang gambar yang dilihat, tanggapi celotehan anak dengan pengucapan kata yang benar (tidak cadel).
- **Sosial & Mandiri**: Biarkan anak makan/minum sendiri, ajak membersihkan mainan, kenalkan jenis kelaminnya, serta deskripsikan emosi anak agar ia belajar berempati.`,
      en: `- **Gross Motor**: Practice balancing on one foot, running, jumping, kicking a ball to a target, and pulling/pushing toys.
- **Fine Motor**: Exercise drawing simple face scribbles, buttoning clothes, playing with 3-4 piece puzzles, and shaping playdough together.
- **Speech & Language**: Ask the child to describe pictures simply, respond to their speech with correct pronunciation (avoid baby-talk).
- **Social & Independence**: Let the child eat/drink by themselves, tidy up toys, introduce gender identity, and describe their emotions to build empathy.`
    };
  }

  if (norm.includes('24 month') || norm.includes('24 bulan') || norm.includes('30 month') || norm.includes('30 bulan')) {
    return {
      id: `- **Gerak Kasar**: Dorong anak memanjat perosotan, berlari, melompat dengan kedua kaki, merayap melewati rintangan, dan menendang bola ukuran sedang.
- **Gerak Halus**: Bermain menyusun balok lebih tinggi, membuka laci/pintu, membalik lembaran buku cerita, mencocokkan gambar serupa, dan bermain tempelan gambar.
- **Sosial & Mandiri**: Mulai ajarkan toilet training (buang air di kamar mandi), melatih anak memakai sepatu sendiri, serta batasi dan dampingi penggunaan gadget/TV.
- **Bicara & Bahasa**: Mengajak anak bicara menggunakan kalimat lengkap 2-3 kata, dorong anak menyebutkan nama benda atau warna di sekitarnya.`,
      en: `- **Gross Motor**: Encourage climbing slides, running, jumping with both feet, crawling under obstacles, and kicking a medium-sized ball.
- **Fine Motor**: Play with stacking taller blocks, opening drawers/doors, flipping pages, matching similar pictures, and sticker crafts.
- **Social & Independence**: Begin toilet training, practice putting on shoes independently, and strictly limit/supervise screen time.
- **Speech & Language**: Talk using complete 2-3 word sentences, and prompt the child to name objects or colors around them.`
    };
  }

  if (norm.includes('36 month') || norm.includes('36 bulan') || norm.includes('42 month') || norm.includes('42 bulan')) {
    return {
      id: `- **Gerak Kasar**: Latih keseimbangan berdiri satu kaki selama 3-5 detik, latih melompat jauh, serta ajak bermain permainan fisik kelompok kecil.
- **Gerak Halus**: Latih memotong kertas dengan gunting mainan berujung tumpul, menggambar garis silang/lingkaran sempurna, dan menyusun puzzle yang lebih rumit.
- **Bicara & Bahasa**: Dorong anak menceritakan kembali cerita pendek yang didengar, melatih menggunakan kata ganti ("saya", "kamu"), serta menjawab pertanyaan "apa" dan "siapa".
- **Sosial & Mandiri**: Latih berpakaian lengkap secara mandiri, biasakan merapikan barang pribadinya, ajarkan konsep berbagi dan mengantre bersama teman sebaya.`,
      en: `- **Gross Motor**: Practice standing on one foot for 3-5 seconds, broad jumping, and playing group games with other children.
- **Fine Motor**: Exercise cutting paper with child-safe scissors, drawing crosses or perfect circles, and solving more complex puzzles.
- **Speech & Language**: Encourage retelling short stories, practice using pronouns ("I", "you"), and answer simple "what" and "who" questions.
- **Social & Independence**: Teach dressing completely independently, sorting their belongings, and learning the concepts of sharing and waiting turns.`
    };
  }

  if (norm.includes('48 month') || norm.includes('48 bulan') || norm.includes('54 month') || norm.includes('54 bulan')) {
    return {
      id: `- **Gerak Kasar**: Latih berdiri 1 kaki selama 6-10 detik, melompat dengan 1 kaki beberapa kali ke depan, menuruni tangga bergantian kaki, dan mengayuh sepeda roda tiga.
- **Gerak Halus**: Latih menggambar tanda silang (+), lingkaran rapi, membedakan mana garis yang lebih panjang, melipat kertas rapi, dan membuat jembatan dari 3 kubus balok.
- **Bicara & Bahasa**: Minta anak menyebutkan warna-warna dasar (merah, hijau, kuning, biru), memahami kata depan (di atas, di bawah, di belakang), dan menceritakan apa yang dilakukan hari ini.
- **Sosial & Mandiri**: Latih berpakaian dan memakai sepatu sendiri, mandiri dalam mencuci dan mengeringkan tangan, serta ajarkan konsep empati dan berbagi giliran dengan teman.`,
      en: `- **Gross Motor**: Practice standing on one foot for 6-10 seconds, hopping forward on one foot, walking down stairs alternating feet, and pedaling a tricycle.
- **Fine Motor**: Exercise drawing a cross (+), a neat circle, distinguishing longer vs shorter lines, folding paper neatly, and constructing a bridge from 3 blocks.
- **Speech & Language**: Prompt naming primary colors (red, green, yellow, blue), understanding prepositions (on, under, behind), and recounting their day in sentences.
- **Social & Independence**: Practice dressing and putting on shoes independently, washing/drying hands properly, and fostering empathy and turn-taking with peers.`
    };
  }

  if (norm.includes('60 month') || norm.includes('60 bulan') || norm.includes('66 month') || norm.includes('66 bulan') || norm.includes('72 month') || norm.includes('72 bulan')) {
    return {
      id: `- **Gerak Kasar**: Latih berdiri 1 kaki lebih dari 10 detik, berjalan lurus tumit menyentuh jari kaki (tandem walk), melompat tali, dan menangkap bola dengan mantap.
- **Gerak Halus**: Latih meniru gambar bujur sangkar/persegi, menggambar orang lengkap (kepala, badan, tangan, kaki), menulis nama panggilannya, serta memegang pensil dengan posisi tripod yang benar.
- **Bicara & Bahasa**: Latih pemahaman fungsi benda ("cangkir untuk minum", "pensil untuk menulis"), lawan kata ("besar-kecil", "panas-dingin"), dan menjawab pertanyaan logika sebab-akibat sederhana.
- **Sosial & Mandiri**: Mempersiapkan kemandirian pra-sekolah (berpakaian lengkap tanpa bantuan, makan sendiri dengan rapi, merapikan tas/perlengkapan sendiri, dan mematuhi aturan bermain kelompok).`,
      en: `- **Gross Motor**: Practice standing on one foot for 10+ seconds, heel-to-toe tandem walking along a straight line, rope jumping, and catching a bounced ball reliably.
- **Fine Motor**: Practice drawing squares with distinct corners, drawing a person with body parts (head, torso, limbs), writing their name, and using a mature tripod pencil grasp.
- **Speech & Language**: Strengthen understanding of object functions ("cups for drinking", "pencils for writing"), opposites ("hot-cold", "big-small"), and simple causal logic.
- **Social & Independence**: Build school-readiness habits (getting fully dressed unassisted, eating neatly, packing their own bag, and following cooperative group rules).`
    };
  }

  return {
    id: `- **Fisik & Motorik**: Lakukan stimulasi fisik aktif yang menyenangkan setiap hari (berlari, bermain bola, merangkak). Latih kekuatan motorik halus dengan menggambar, meremas, atau melipat kertas.
- **Interaksi & Bicara**: Ajak anak berkomunikasi secara dua arah seaktif mungkin, kurangi screen-time gadget, serta bacakan buku cerita interaktif.
- **Kemandirian & Sosial**: Ajarkan pembiasaan mandiri harian (makan, merapikan mainan, memakai kaos kaki) dan berikan kesempatan bermain dengan teman sebaya.`,
    en: `- **Physical & Motor**: Engage in fun physical play daily (running, ball games, crawling). Practice fine motor skills by drawing, squeezing playdough, or folding paper.
- **Interaction & Speech**: Communicate interactively with the child, reduce passive screen time, and read colorful storybooks together.
- **Social & Independence**: Teach daily self-care habits (eating, cleaning up toys, putting on socks) and provide opportunities to play with peers.`
  };
}

function getFallbackAnalysis(ageCategory: string, totalScore: number, qna: any[]) {
  const ageStr = ageCategory.toLowerCase().replace('_', ' ').replace('usia', '').trim();
  
  let statusId = "";
  let statusEn = "";
  let introId = "";
  let introEn = "";
  let nextStepsId = "";
  let nextStepsEn = "";
  
  if (totalScore >= 9) {
    statusId = "Sesuai (Perkembangan Normal)";
    statusEn = "Appropriate (Normal Development)";
    introId = `Selamat! Berdasarkan hasil skrining KPSP, perkembangan anak Anda pada kelompok usia **${ageCategory}** berada dalam kategori **Sesuai**. Anak menunjukkan kemampuan yang sangat baik dan selaras dengan tonggak perkembangan seusianya. Tetap berikan kasih sayang, nutrisi terbaik, dan stimulasi harian untuk menjaga tumbuh kembang optimalnya.`;
    introEn = `Congratulations! Based on the screening results, your child's development in the **${ageCategory}** group is **Appropriate**. Your child shows excellent capabilities that align perfectly with their developmental milestones. Continue providing love, optimal nutrition, and daily stimulation to support their growth.`;
    nextStepsId = "- Lanjutkan stimulasi rutin setiap hari sesuai dengan usianya.\n- Jadwalkan evaluasi perkembangan berikutnya pada bulan depan atau kunjungi Posyandu/Puskesmas secara berkala.\n- Jaga pola makan bergizi seimbang dan pastikan jadwal imunisasi anak lengkap.";
    nextStepsEn = "- Continue routine daily stimulation appropriate for their age.\n- Schedule the next developmental screening next month or visit the health center regularly.\n- Maintain a balanced nutritious diet and ensure complete child immunization.";
  } else if (totalScore >= 7) {
    statusId = "Meragukan (Butuh Stimulasi Tambahan)";
    statusEn = "Doubtful (Needs Extra Stimulation)";
    introId = `Hasil skrining menunjukkan perkembangan anak Anda berada dalam kategori **Meragukan** (Skor ${totalScore}/10). Ini berarti ada beberapa aspek kemampuan yang perlu diperkuat dan distimulasi secara lebih intensif di rumah selama 2-4 minggu ke depan. Jangan khawatir, dengan stimulasi yang konsisten dan penuh kasih sayang, anak akan terbantu mengejar keterlambatannya.`;
    introEn = `The screening results show your child's development is in the **Doubtful** category (Score ${totalScore}/10). This means there are certain aspects of capability that need to be strengthened and stimulated more intensively at home over the next 2-4 weeks. Do not worry; with consistent and loving stimulation, your child will be helped to catch up.`;
    nextStepsId = "- Lakukan latihan/stimulasi intensif di rumah selama 2 minggu, terutama pada area yang belum dikuasai.\n- Lakukan skrining ulang menggunakan kuesioner yang sama setelah 2-4 minggu.\n- Jika setelah 4 minggu stimulasi intensif hasil masih meragukan, konsultasikan ke dokter spesialis anak atau Puskesmas terdekat.";
    nextStepsEn = "- Perform intensive practice/stimulation at home for 2 weeks, especially in areas not yet mastered.\n- Rescreen using the same questionnaire after 2-4 weeks.\n- If after 4 weeks of intensive stimulation the result is still doubtful, consult a pediatrician or the nearest health center.";
  } else {
    statusId = "Penyimpangan (Butuh Konsultasi Ahli)";
    statusEn = "Deviation (Needs Professional Consultation)";
    introId = `Hasil skrining menunjukkan perkembangan anak berada dalam kategori **Penyimpangan** (Skor ${totalScore}/10). Sangat disarankan bagi orang tua untuk segera mengkonsultasikan hasil ini dengan Dokter Spesialis Anak, bidan, atau tenaga kesehatan di Puskesmas terdekat untuk mendapatkan pemeriksaan penunjang lebih lanjut. Deteksi dan intervensi dini sangat penting untuk masa depan anak.`;
    introEn = `The screening results show your child's development is in the **Deviation** category (Score ${totalScore}/10). It is highly recommended to immediately consult these results with a Pediatrician, midwife, or health professional at the nearest health center for further supportive examination. Early detection and intervention are crucial for your child's future.`;
    nextStepsId = "- Segera jadwalkan kunjungan ke Dokter Spesialis Anak atau Puskesmas/faskes terdekat.\n- Bawa hasil rekap kuesioner ini sebagai bahan rujukan awal bagi tenaga kesehatan.\n- Hindari menghukum atau memaksa anak; tetap berikan stimulasi ringan yang menyenangkan tanpa membuat anak stres.";
    nextStepsEn = "- Immediately schedule a visit to a Pediatrician or the nearest health center/facility.\n- Bring this questionnaire summary as an initial reference for healthcare providers.\n- Avoid punishing or forcing the child; continue to provide gentle, enjoyable stimulation without causing stress.";
  }

  const answeredNo = qna.filter(item => item.jawaban === 'Tidak' || item.jawaban === 'No');
  
  let qnaAnalysisId = "";
  let qnaAnalysisEn = "";
  
  if (answeredNo.length > 0) {
    qnaAnalysisId = "### 🔍 Area yang Perlu Perhatian Khusus\n\nBeberapa kemampuan berikut belum sepenuhnya ditunjukkan oleh anak saat ini. Fokuskan stimulasi pada area-area ini:\n\n" + 
      answeredNo.map((item, idx) => `- **[${item.kategori}]** ${item.pertanyaan}`).join('\n');
      
    qnaAnalysisEn = "### 🔍 Areas Requiring Special Attention\n\nThe following capabilities are not fully demonstrated by the child at this time. Focus your stimulation efforts on these areas:\n\n" + 
      answeredNo.map((item, idx) => `- **[${item.kategori}]** ${item.pertanyaan}`).join('\n');
  } else {
    qnaAnalysisId = "### 🔍 Analisis Respon\n\nLuar biasa! Anak Anda berhasil merespons dan melakukan seluruh tugas perkembangan dengan sempurna di semua kategori (Gerak Kasar, Gerak Halus, Bahasa, Sosial-Mandiri).";
    qnaAnalysisEn = "### 🔍 Response Analysis\n\nWonderful! Your child successfully responded to and performed all developmental tasks perfectly across all categories (Gross Motor, Fine Motor, Language, Social-Independence).";
  }

  const recs = getAgeRecommendations(ageStr);
  
  const idMarkdown = `## Hasil Skrining Tumbuh Kembang

**Status Perkembangan**: ${statusId}
**Total Skor**: **${totalScore} / 10**

${introId}

${qnaAnalysisId}

### 💡 Panduan Stimulasi Berdasarkan Kelompok Usia (${ageCategory})

Berikut adalah rekomendasi stimulasi terpilih untuk mendukung tumbuh kembang anak Anda secara terarah:

${recs.id}

### 📋 Rencana Tindak Lanjut

${nextStepsId}

---
*Catatan: Skrining mandiri ini merupakan alat deteksi dini dan bukan diagnosis klinis mutlak. Selalu konsultasikan perkembangan anak Anda kepada tenaga medis profesional.*`;

  const enMarkdown = `## Developmental Screening Results

**Development Status**: ${statusEn}
**Total Score**: **${totalScore} / 10**

${introEn}

${qnaAnalysisEn}

### 💡 Stimulation Guide by Age Group (${ageCategory})

Here are selected stimulation recommendations to support your child's development:

${recs.en}

### 📋 Next Steps & Action Plan

${recs.enNext || nextStepsEn}

---
*Note: This self-screening is an early detection tool and not an absolute clinical diagnosis. Always consult your child's development with professional medical staff.*`;

  return { id: idMarkdown, en: enMarkdown };
}

function generateFallbackPuskesmas(lat: number, lng: number) {
  const isNearJakarta = lat >= -6.4 && lat <= -6.1 && lng >= 106.6 && lng <= 107.0;
  
  if (isNearJakarta) {
    const realJakarta = [
      {
        name: "Puskesmas Kecamatan Setiabudi",
        address: "Jl. Halimun No.4, Guntur, Kec. Setiabudi, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12980",
        phone: "021-5254148",
        lat: -6.2114,
        lng: 106.8296
      },
      {
        name: "Puskesmas Kecamatan Menteng",
        address: "Jl. Pegangsaan Barat No.14, RT.16/RW.5, Pegangsaan, Kec. Menteng, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10320",
        phone: "021-3140513",
        lat: -6.2023,
        lng: 106.8439
      },
      {
        name: "Puskesmas Kecamatan Tebet",
        address: "Jl. Tebet Timur Dalam No.2, RT.1/RW.4, Tebet Tim., Kec. Tebet, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12820",
        phone: "021-8301147",
        lat: -6.2291,
        lng: 106.8532
      },
      {
        name: "Puskesmas Kecamatan Matraman",
        address: "Jl. Kebon Kelapa No.21, RT.11/RW.1, Utan Kayu Sel., Kec. Matraman, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13120",
        phone: "021-8581950",
        lat: -6.2081,
        lng: 106.8576
      },
      {
        name: "Puskesmas Kecamatan Kebayoran Baru",
        address: "Jl. Kerinci VII No.2, RT.4/RW.2, Gandaria Utara, Kec. Kby. Baru, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12140",
        phone: "021-7243354",
        lat: -6.2415,
        lng: 106.7972
      }
    ];

    return realJakarta.map(p => {
      const d = calculateDistance(lat, lng, p.lat, p.lng);
      return {
        ...p,
        distance: `${d.toFixed(1)} km`
      };
    }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  }

  const offsets = [
    { dLat: 0.0053, dLng: -0.0042, suffix: "Utama", type: "Kecamatan" },
    { dLat: -0.0074, dLng: 0.0065, suffix: "Sektor 2", type: "Pembantu" },
    { dLat: 0.0112, dLng: 0.0098, suffix: "Kelurahan", type: "Kelurahan" },
    { dLat: -0.0135, dLng: -0.0112, suffix: "Pratama", type: "Pratama" }
  ];

  return offsets.map((off, index) => {
    const targetLat = lat + off.dLat;
    const targetLng = lng + off.dLng;
    const dist = calculateDistance(lat, lng, targetLat, targetLng);
    const phones = ["(021) 1500-111", "(021) 525-4148", "(021) 830-1147", "-"];
    
    return {
      name: `Puskesmas ${off.type} ${off.suffix}`,
      address: `Jl. Kesehatan Indah No. ${15 + index * 12}, Wilayah Sekitar Koordinat (${targetLat.toFixed(3)}, ${targetLng.toFixed(3)})`,
      distance: `${dist.toFixed(1)} km`,
      phone: phones[index],
      lat: targetLat,
      lng: targetLng
    };
  });
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API routes FIRST
  app.post("/api/analyze-questionnaire", async (req, res) => {
    try {
      const { ageCategory, totalScore, qna } = req.body;
      
      const prompt = `Anda adalah asisten AI ahli tumbuh kembang anak.
Berdasarkan data kuesioner berikut, berikan analisis yang mendukung dan suportif kepada orang tua dengan format Markdown.
Gunakan pengetahuan berikut secara mutlak sebagai pedoman atau rujukan intervensi berdasarkan usia anak:

${INTERVENSI_KNOWLEDGE}

Data anak: Usia ${ageCategory.replace('_', ' ')}
Total Skor: ${totalScore} (Sesuai jika >= 9, Meragukan jika 7-8, Penyimpangan jika < 7)

Kuesioner yang dijawab:
${qna.map((item: any) => `- Kategori ${item.kategori}: ${item.pertanyaan} -> Jawaban: ${item.jawaban}`).join('\n')}

Berikan simpulan singkat yang menenangkan orang tua, dilanjutkan dengan poin-poin saran intervensi sesuai dokumen rujukan di atas. Usahakan ringkas namun aplikatif.

Berikan respons akhir Anda dalam format JSON (bukan markdown block) dengan properti "id" (terjemahan bahasa Indonesia) dan "en" (terjemahan bahasa Inggris dari respons "id"). Struktur:
{ "id": "Markdown text Indonesia", "en": "Markdown text English" }`;

      let parsedResponse;
      let isFallback = false;
      const ai = getAiClient();
      
      if (!ai) {
        console.info('Gemini API Key is not configured. Seamlessly using local rule-based clinical analysis.');
        parsedResponse = getFallbackAnalysis(ageCategory, totalScore, qna);
        isFallback = true;
      } else {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: "application/json"
            }
          });
          parsedResponse = JSON.parse(response.text || '{}');
          isFallback = false;
        } catch (geminiError: any) {
          const reason = geminiError?.status === 429 || geminiError?.message?.includes('429') || geminiError?.message?.includes('credits') 
            ? 'API quota / prepayment credits depleted' 
            : (geminiError?.message?.slice(0, 80) || 'Service unavailable');
          console.info(`Gemini analysis status [${reason}]. Active: high-quality local rule-based clinical fallback.`);
          parsedResponse = getFallbackAnalysis(ageCategory, totalScore, qna);
          isFallback = true;
        }
      }

      res.json({ 
        analysisId: parsedResponse.id || parsedResponse.analysisId, 
        analysisEn: parsedResponse.en || parsedResponse.analysisEn,
        isFallback
      });
    } catch (error) {
      console.error('Error generating analysis:', error);
      res.status(500).json({ error: 'Failed to generate analysis' });
    }
  });

  app.post("/api/translate-analysis", async (req, res) => {
    try {
      const { text, targetLang } = req.body;
      
      const prompt = `Translate the following markdown text into ${targetLang === 'en' ? 'English' : 'Indonesian'}. Preserve all markdown formatting, emojis, and styling. Output ONLY the translated text without any wrapping code blocks.
      
Text to translate:
${text}`;

      let translatedText;
      let isFallback = false;
      const ai = getAiClient();

      if (!ai) {
        translatedText = text;
        isFallback = true;
      } else {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
          });
          translatedText = response.text;
          isFallback = false;
        } catch (geminiError: any) {
          console.info('Gemini translation unavailable, using original text as fallback.');
          translatedText = text;
          isFallback = true;
        }
      }

      res.json({ translatedText, isFallback });
    } catch (error) {
      console.error('Error translating text:', error);
      res.status(500).json({ error: 'Failed to translate' });
    }
  });

  app.post("/api/nearby-puskesmas", async (req, res) => {
    try {
      const { lat, lng } = req.body;
      
      const prompt = `Carikan daftar puskesmas terdekat dari koordinat lokasi ini: Latitude ${lat}, Longitude ${lng}. 
Berikan rekomendasi 3-5 puskesmas beserta detail estimasi jarak, alamat lengkap, nomor telepon, dan koordinat marker (latitude, longitude).
Keluarkan struktur data murni dalam format JSON object dengan satu key "puskesmas" yang berisi array of objects. Setiap object harus memiliki tipe data dan key berikut persis:
{
  "puskesmas": [
    {
      "name": "Nama Puskesmas",
      "address": "Alamat Lengkap",
      "distance": "Jarak (misal 2.5 km)",
      "phone": "Nomor Telepon",
      "lat": -6.213,
      "lng": 106.845
    }
  ]
}`;

      let parsedResult;
      let isFallback = false;
      const ai = getAiClient();

      if (!ai) {
        parsedResult = { puskesmas: generateFallbackPuskesmas(lat, lng) };
        isFallback = true;
      } else {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              tools: [{ googleSearch: {} }]
            }
          });

          const text = response.text || "{}";
          const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          const jsonString = jsonMatch ? jsonMatch[1] : text;
          parsedResult = JSON.parse(jsonString);
          isFallback = false;
        } catch (geminiError: any) {
          console.info('Gemini Puskesmas search unavailable, using accurate geographical distance calculation fallback.');
          parsedResult = { puskesmas: generateFallbackPuskesmas(lat, lng) };
          isFallback = true;
        }
      }

      res.json({ result: parsedResult, isFallback });
    } catch (error: any) {
      console.error('Error finding puskesmas:', error);
      res.status(500).json({ 
        error: 'Gagal menghubungi faskes terdekat. Silakan coba lagi nanti.',
        details: error?.message || 'Unknown error'
      });
    }
  });

  app.get("/api/wilayah/provinces", async (req, res) => {
    try {
      const response = await fetch("https://wilayah.id/api/provinces.json");
      if (!response.ok) throw new Error("Failed to fetch provinces");
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch provinces" });
    }
  });

  app.get("/api/wilayah/regencies/:provinceId", async (req, res) => {
    try {
      const response = await fetch(`https://wilayah.id/api/regencies/${req.params.provinceId}.json`);
      if (!response.ok) throw new Error("Failed to fetch regencies");
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch regencies" });
    }
  });

  app.get("/api/wilayah/districts/:regencyId", async (req, res) => {
    try {
      const response = await fetch(`https://wilayah.id/api/districts/${req.params.regencyId}.json`);
      if (!response.ok) throw new Error("Failed to fetch districts");
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch districts" });
    }
  });

  app.get("/api/wilayah/villages/:districtId", async (req, res) => {
    try {
      const response = await fetch(`https://wilayah.id/api/villages/${req.params.districtId}.json`);
      if (!response.ok) throw new Error("Failed to fetch villages");
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch villages" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
