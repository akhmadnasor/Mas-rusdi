export type QuestionType = 'numerasi' | 'literasi';

export interface Question {
  id: number;
  type: QuestionType;
  narasi: string;
  pertanyaan: string;
  opsi: string[];
  jawabanBenar: number;
}

export const questionsNumerasi: Question[] = [];
for (let i = 1; i <= 30; i++) {
  const typeIdx = i % 6; // 0..5
  let a, b, ans, narasi, pertanyaan;
  
  if (typeIdx === 0) { // Penjumlahan
    a = Math.floor(Math.random() * 50) + 20;
    b = Math.floor(Math.random() * 50) + 20;
    ans = a + b;
    narasi = `Mas Rusdi menemukan ${a} koin emas di sebuah goa. Saat berjalan lebih jauh, ia menemukan harta karun berisi ${b} koin emas lagi.`;
    pertanyaan = `Berapa total koin emas yang dimiliki Mas Rusdi sekarang?`;
  } else if (typeIdx === 1) { // Pengurangan
    a = Math.floor(Math.random() * 100) + 50;
    b = Math.floor(Math.random() * 40) + 10;
    ans = a - b;
    narasi = `Dalam perjalanannya, Mas Rusdi membawa ${a} buah apel sebagai perbekalan. Namun karena lapar, ia memakan ${b} buah apel.`;
    pertanyaan = `Sisa buah apel yang dimiliki Mas Rusdi adalah?`;
  } else if (typeIdx === 2) { // Perkalian
    a = Math.floor(Math.random() * 12) + 4;
    b = Math.floor(Math.random() * 10) + 3;
    ans = a * b;
    narasi = `Mas Rusdi melewati ladang jamur yang luas. Ia melihat ada ${a} baris jamur yang tumbuh rapi, setiap baris berisi ${b} jamur bercahaya.`;
    pertanyaan = `Berapa jumlah keseluruhan jamur bercahaya tersebut?`;
  } else if (typeIdx === 3) { // Pembagian
    b = Math.floor(Math.random() * 8) + 3;
    ans = Math.floor(Math.random() * 15) + 5;
    a = b * ans;
    narasi = `Setelah mengalahkan monster, Mas Rusdi mendapatkan hadiah ${a} permata ajaib. Ia ingin membagikannya secara rata kepada ${b} temannya.`;
    pertanyaan = `Berapa banyak permata yang diterima masing-masing teman Mas Rusdi?`;
  } else if (typeIdx === 4) { // FPB
    const fpb = (x: number, y: number): number => y === 0 ? x : fpb(y, x % y);
    const multiplier = Math.floor(Math.random() * 5) + 2;
    const factorA = Math.floor(Math.random() * 5) + 2;
    const factorB = factorA + 1; // coprime
    a = factorA * multiplier;
    b = factorB * multiplier;
    ans = fpb(a, b);
    narasi = `Mas Rusdi ingin membuat bingkisan berisi ${a} permen dan ${b} cokelat. Setiap bingkisan harus memiliki jumlah permen dan cokelat yang sama banyak, dan ia ingin membuat bingkisan sebanyak mungkin.`;
    pertanyaan = `Berapa jumlah bingkisan terbanyak yang bisa dibuat oleh Mas Rusdi (FPB)?`;
  } else { // KPK
    const gcd = (x: number, y: number): number => y === 0 ? x : gcd(y, x % y);
    a = Math.floor(Math.random() * 6) + 3; // 3..8
    b = Math.floor(Math.random() * 6) + 4; // 4..9
    if (a === b) b++;
    ans = (a * b) / gcd(a, b);
    narasi = `Tikus musuh Mas Rusdi muncul di permukaan tanah setiap ${a} menit, sementara burung hantu muncul setiap ${b} menit. Mereka baru saja muncul bersamaan.`;
    pertanyaan = `Dalam berapa menit lagi tikus dan burung hantu itu akan muncul secara bersamaan untuk kedua kalinya (KPK)?`;
  }

  const opsSet = new Set<number>();
  opsSet.add(ans);
  while (opsSet.size < 4) {
    const wrong = ans + Math.floor(Math.random() * 20) - 10;
    if (wrong !== ans && wrong > 0) {
      opsSet.add(wrong);
    }
  }
  const opsList = Array.from(opsSet).sort((A,B) => A - B);
  
  questionsNumerasi.push({
    id: i,
    type: 'numerasi',
    narasi: narasi,
    pertanyaan: pertanyaan,
    opsi: opsList.map(String),
    jawabanBenar: opsList.indexOf(ans)
  });
}

const baseLiterasi = [
  { p: "Siapakah Bupati dan Wakil Bupati Pasuruan saat ini (2025)?", ops: ["Irsyad Yusuf & Mujib Imron", "Rusdi Sutejo & Shobih Asrori", "Khofifah & Emil Dardak", "Gus Ipul & Mas Adi"], ans: 1 },
  { p: "Daerah di Pasuruan yang dijuluki sebagai Bangkodir (Bangil Kota Bordir) adalah?", ops: ["Pandaan", "Prigen", "Bangil", "Sukorejo"], ans: 2 },
  { p: "Gunung apakah yang menjadi salah satu ikon pariwisata favorit di perbatasan Pasuruan?", ops: ["Gunung Kelud", "Gunung Semeru", "Gunung Bromo", "Gunung Ijen"], ans: 2 },
  { p: "Oleh-oleh khas Pasuruan yang berbentuk manis dan berbahan dasar beras ketan adalah?", ops: ["Bipang Jangkar", "Getuk Pisang", "Brem", "Ledre"], ans: 0 },
  { p: "Candi peninggalan Singhasari yang terletak di Kecamatan Prigen adalah?", ops: ["Candi Singosari", "Candi Jago", "Candi Jawi", "Candi Penataran"], ans: 2 },
  { p: "Masjid yang memiliki arsitektur unik perpaduan gaya Tiongkok dan Islam di Pandaan adalah?", ops: ["Masjid Cheng Hoo", "Masjid Ampel", "Masjid Tiban", "Masjid Agung"], ans: 0 },
  { p: "Wisata alam air terjun yang terkenal di Prigen adalah?", ops: ["Air Terjun Sedudo", "Air Terjun Kakek Bodo", "Air Terjun Madakaripura", "Air Terjun Coban Rondo"], ans: 1 },
  { p: "Taman Safari Indonesia II yang terletak di Pasuruan berada di wilayah?", ops: ["Pandaan", "Bangil", "Prigen", "Gempol"], ans: 2 },
  { p: "Produk mangga unggulan khas Pasuruan yang bisa dikupas seperti pisang adalah?", ops: ["Mangga Manalagi", "Mangga Harum Manis", "Mangga Alpukat", "Mangga Golek"], ans: 2 },
  { p: "Kabupaten Pasuruan dikenal dekat dengan kawasan industri yang bernama?", ops: ["Sier", "PIER (Pasuruan Industrial Estate Rembang)", "KIM", "Ngoro Industrial Park"], ans: 1 },
];

export const questionsLiterasi: Question[] = [];
for (let i = 0; i < 30; i++) {
  const q = baseLiterasi[i % baseLiterasi.length];
  questionsLiterasi.push({
    id: i + 1,
    type: 'literasi',
    narasi: 'Wawasan Lokal dan Literasi: Eksplorasi Daerah Pasuruan.',
    pertanyaan: i < baseLiterasi.length ? q.p : `[Bagian ${i+1}] ${q.p}`,
    opsi: q.ops,
    jawabanBenar: q.ans
  });
}
