const fs = require('fs');

const numerasiData = [];
for (let i = 1; i <= 30; i++) {
  const operations = [
    { name: 'tambah', f: (a,b) => a+b, symbol: 'ditambah' },
    { name: 'kurang', f: (a,b) => a-b, symbol: 'dikurangi' },
    { name: 'kali', f: (a,b) => a*b, symbol: 'dikali' }
  ];
  const op = operations[Math.floor(Math.random() * operations.length)];
  let a, b;
  if(op.name === 'kali') {
    a = Math.floor(Math.random() * 15) + 2;
    b = Math.floor(Math.random() * 15) + 2;
  } else {
    a = Math.floor(Math.random() * 80) + 20;
    b = Math.floor(Math.random() * 80) + 10;
    if(op.name === 'kurang' && a < b) {
      let t = a; a = b; b = t;
    }
  }
  const ans = op.f(a,b);
  const options = new Set();
  options.add(ans);
  while(options.size < 4) {
    const wrong = ans + Math.floor(Math.random() * 20) - 10;
    if(wrong !== ans && wrong > 0) options.add(wrong);
  }
  const opsArr = Array.from(options).sort((A,B) => A - B);
  const ansIndex = opsArr.indexOf(ans);

  numerasiData.push({
    id: i,
    type: 'numerasi',
    narasi: `Mas Rusdi sedang menyelesaikan tantangan matematika di level ${i}.`,
    pertanyaan: `Berapa hasil dari ${a} ${op.symbol} ${b}?`,
    opsi: opsArr.map(x => x.toString()),
    jawabanBenar: ansIndex
  });
}

const literasiData = [
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

while(literasiData.length < 30) {
    const extra = [
        { p: "Seni pertunjukan tradisional yang sering ditampilkan pada acara syukuran di Pasuruan adalah?", ops: ["Ludruk", "Ketoprak", "Wayang Kulit", "Pencak Macan"], ans: 0 },
        { p: "Nama stasiun kereta api utama yang berada di wilayah Pasuruan kota adalah?", ops: ["Stasiun Bangil", "Stasiun Pasuruan", "Stasiun Grati", "Stasiun Pandaan"], ans: 1 },
        { p: "Apa makanan khas berkuah yang terkenal di Jawa Timur termasuk di Pasuruan?", ops: ["Soto Madura", "Soto Lamongan", "Rawon", "Soto Banjar"], ans: 2 },
        { p: "Kecamatan di Pasuruan yang terkenal dengan sumber air mancur alamnya adalah?", ops: ["Lumbang", "Winongan", "Grati", "Puspo"], ans: 1 },
        { p: "Rumah sakit dr. R. Soedarsono terletak di wilayah mana?", ops: ["Bangil", "Pandaan", "Kota Pasuruan", "Kraton"], ans: 2 },
        { p: "Minuman khas kopi dari Pasuruan sering dipromosikan dengan singkatan?", ops: ["Kopi Joss", "Kopi Kapiten", "Kopi Lelet", "Kopi Klotok"], ans: 1 },
        { p: "Salah satu upacara adat masyarakat Tengger di kawasan Bromo adalah?", ops: ["Kasada", "Grebeg Suro", "Kebo-keboan", "Larung Sesaji"], ans: 0 },
        { p: "Nama tokoh penyebar agama Islam yang makamnya ramai diziarahi di Pasuruan adalah?", ops: ["Sunan Ampel", "Mbah Semendik / KH. Abdul Hamid", "Sunan Giri", "Sunan Bonang"], ans: 1 },
        { p: "Julukan apa yang sering disematkan pada Kota Pasuruan?", ops: ["Kota Pahlawan", "Kota Angin", "Kota Santri", "Kota Hujan"], ans: 2 },
        { p: "Nama salah satu danau wisata di Kabupaten Pasuruan adalah?", ops: ["Ranu Kumbolo", "Danau Ranu Grati", "Telaga Sarangan", "Danau Toba"], ans: 1 },
    ];
    for(const t of extra) {
        if(literasiData.length >= 30) break;
        literasiData.push(t);
    }
}

const literasiOut = literasiData.map((d, i) => ({
    id: i + 1,
    type: 'literasi',
    narasi: 'Informasi dan wawasan seputar budaya, sejarah, dan geografi lokal Pasuruan.',
    pertanyaan: d.p,
    opsi: d.ops,
    jawabanBenar: d.ans
}));

const content = `export type QuestionType = 'numerasi' | 'literasi';

export interface Question {
  id: number;
  type: QuestionType;
  narasi: string;
  pertanyaan: string;
  opsi: string[];
  jawabanBenar: number;
}

export const questionsNumerasi: Question[] = ${JSON.stringify(numerasiData, null, 2)};

export const questionsIPS: Question[] = ${JSON.stringify(literasiOut, null, 2)};
`;

fs.writeFileSync('/src/data/questions.ts', content);
console.log('Done!');
