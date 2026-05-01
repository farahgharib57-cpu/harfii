const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ══════════════════════════════════════════
//  IN-MEMORY DATABASE
// ══════════════════════════════════════════
const db = {
  users: [
    { id: 'u_demo', name: 'Ahmed Demo', email: 'demo@harfi.app', password: 'demo1234', phone: '+20 100 000 0000', avatar: 'A', color: '#2979FF', bookings: 2, completed: 1, rating: 4.8, location: 'Maadi, Cairo' }
  ],
  sessions: {}, // token -> userId

  workers: [
    // ── سباكة ──
    { id:'w01', name:'Ahmed El-Sayed',   nameAr:'أحمد السيد',   profession:'Master Plumber',       profAr:'سباك محترف',    category:'Plumbing',    categoryAr:'سباكة',    rating:4.9, reviews:128, jobs:340, exp:8,  price:150, status:'online',  dist:0.8, avatar:'A', color:'#2979FF' },
    { id:'w02', name:'Mostafa Salah',    nameAr:'مصطفى صلاح',   profession:'Plumbing Technician',  profAr:'فني سباكة',     category:'Plumbing',    categoryAr:'سباكة',    rating:4.7, reviews:88,  jobs:210, exp:5,  price:120, status:'online',  dist:1.1, avatar:'M', color:'#1565C0' },
    { id:'w03', name:'Karim Hassan',     nameAr:'كريم حسن',     profession:'Sanitary Expert',      profAr:'خبير صحي',      category:'Plumbing',    categoryAr:'سباكة',    rating:4.6, reviews:72,  jobs:190, exp:7,  price:140, status:'busy',    dist:1.9, avatar:'K', color:'#0288D1' },
    { id:'w04', name:'Omar Farouk',      nameAr:'عمر فاروق',    profession:'Pipe Specialist',      profAr:'متخصص أنابيب', category:'Plumbing',    categoryAr:'سباكة',    rating:4.5, reviews:55,  jobs:130, exp:4,  price:110, status:'online',  dist:2.3, avatar:'O', color:'#006064' },
    { id:'w05', name:'Samir Nour',       nameAr:'سمير نور',     profession:'Leak Repair Expert',   profAr:'خبير تسريبات', category:'Plumbing',    categoryAr:'سباكة',    rating:4.8, reviews:103, jobs:280, exp:10, price:160, status:'online',  dist:0.5, avatar:'S', color:'#37474F' },
    { id:'w06', name:'Hany Abdallah',    nameAr:'هاني عبدالله', profession:'Senior Plumber',       profAr:'سباك أول',     category:'Plumbing',    categoryAr:'سباكة',    rating:4.4, reviews:41,  jobs:98,  exp:3,  price:100, status:'online',  dist:3.1, avatar:'H', color:'#4527A0' },
    // ── كهرباء ──
    { id:'w07', name:'Mohamed Ali',      nameAr:'محمد علي',     profession:'Certified Electrician',profAr:'كهربائي معتمد',category:'Electrical',  categoryAr:'كهرباء',   rating:4.7, reviews:95,  jobs:210, exp:6,  price:200, status:'online',  dist:1.2, avatar:'M', color:'#FF6D00' },
    { id:'w08', name:'Tamer Ezz',        nameAr:'تامر عز',      profession:'Electrical Engineer',  profAr:'مهندس كهرباء', category:'Electrical',  categoryAr:'كهرباء',   rating:4.9, reviews:140, jobs:380, exp:12, price:250, status:'online',  dist:0.9, avatar:'T', color:'#E65100' },
    { id:'w09', name:'Wael Ibrahim',     nameAr:'وائل إبراهيم', profession:'Panel Specialist',     profAr:'متخصص لوحات', category:'Electrical',  categoryAr:'كهرباء',   rating:4.6, reviews:67,  jobs:155, exp:5,  price:180, status:'busy',    dist:2.0, avatar:'W', color:'#BF360C' },
    { id:'w10', name:'Fady Nader',       nameAr:'فادي نادر',    profession:'Wiring Expert',        profAr:'خبير أسلاك',  category:'Electrical',  categoryAr:'كهرباء',   rating:4.5, reviews:50,  jobs:120, exp:4,  price:170, status:'online',  dist:2.8, avatar:'F', color:'#FF8F00' },
    { id:'w11', name:'Bassem Samir',     nameAr:'باسم سمير',    profession:'Solar Technician',     profAr:'فني طاقة شمسية',category:'Electrical', categoryAr:'كهرباء',   rating:4.8, reviews:88,  jobs:200, exp:7,  price:220, status:'online',  dist:1.5, avatar:'B', color:'#F57F17' },
    { id:'w12', name:'Ramy Fathy',       nameAr:'رامي فتحي',    profession:'Electrician',          profAr:'كهربائي',     category:'Electrical',  categoryAr:'كهرباء',   rating:4.3, reviews:38,  jobs:90,  exp:3,  price:160, status:'online',  dist:3.5, avatar:'R', color:'#FF6F00' },
    // ── ميكانيكي ──
    { id:'w13', name:'Khaled Ibrahim',   nameAr:'خالد إبراهيم', profession:'Auto Mechanic',        profAr:'ميكانيكي سيارات',category:'Mechanic', categoryAr:'ميكانيكي', rating:4.8, reviews:203, jobs:520, exp:12, price:180, status:'busy',    dist:2.1, avatar:'K', color:'#00BCD4' },
    { id:'w14', name:'Sherif Hamdy',     nameAr:'شريف حمدي',    profession:'Engine Specialist',    profAr:'متخصص محركات',category:'Mechanic',    categoryAr:'ميكانيكي', rating:4.7, reviews:155, jobs:390, exp:9,  price:200, status:'online',  dist:1.7, avatar:'S', color:'#00838F' },
    { id:'w15', name:'Hassan Ramzy',     nameAr:'حسن رمزي',     profession:'Transmission Expert',  profAr:'خبير ناقل حركة',category:'Mechanic',  categoryAr:'ميكانيكي', rating:4.5, reviews:88,  jobs:210, exp:6,  price:160, status:'online',  dist:2.9, avatar:'H', color:'#006064' },
    { id:'w16', name:'Amr Moustafa',     nameAr:'عمرو مصطفى',   profession:'Auto Electrician',     profAr:'كهربائي سيارات',category:'Mechanic',  categoryAr:'ميكانيكي', rating:4.6, reviews:110, jobs:270, exp:8,  price:190, status:'online',  dist:1.3, avatar:'A', color:'#00ACC1' },
    { id:'w17', name:'Nader Salem',      nameAr:'نادر سالم',    profession:'Tire & Brake Tech',    profAr:'فني إطارات',  category:'Mechanic',    categoryAr:'ميكانيكي', rating:4.4, reviews:62,  jobs:150, exp:5,  price:140, status:'busy',    dist:3.2, avatar:'N', color:'#0097A7' },
    { id:'w18', name:'Youssef Gamal',    nameAr:'يوسف جمال',    profession:'Diagnostic Specialist',profAr:'خبير تشخيص',  category:'Mechanic',    categoryAr:'ميكانيكي', rating:4.9, reviews:190, jobs:460, exp:14, price:230, status:'online',  dist:0.7, avatar:'Y', color:'#00BFA5' },
    // ── تكييف ──
    { id:'w19', name:'Yasser Hassan',    nameAr:'ياسر حسن',     profession:'AC Technician',        profAr:'فني تكييف',   category:'AC',          categoryAr:'تكييف',    rating:4.6, reviews:77,  jobs:190, exp:5,  price:170, status:'online',  dist:1.5, avatar:'Y', color:'#9C27B0' },
    { id:'w20', name:'Magdy Shafik',     nameAr:'مجدي شفيق',    profession:'HVAC Engineer',        profAr:'مهندس تكييف', category:'AC',          categoryAr:'تكييف',    rating:4.8, reviews:120, jobs:310, exp:10, price:220, status:'online',  dist:0.9, avatar:'M', color:'#6A1B9A' },
    { id:'w21', name:'Islam Reda',       nameAr:'إسلام رضا',    profession:'AC Installation',      profAr:'تركيب تكييف', category:'AC',          categoryAr:'تكييف',    rating:4.5, reviews:60,  jobs:140, exp:4,  price:150, status:'busy',    dist:2.4, avatar:'I', color:'#7B1FA2' },
    { id:'w22', name:'Tarek Mourad',     nameAr:'طارق مراد',    profession:'Refrigeration Tech',   profAr:'فني تبريد',   category:'AC',          categoryAr:'تكييف',    rating:4.7, reviews:95,  jobs:240, exp:7,  price:190, status:'online',  dist:1.8, avatar:'T', color:'#8E24AA' },
    { id:'w23', name:'Hossam Bakr',      nameAr:'حسام بكر',     profession:'Central AC Expert',    profAr:'خبير مركزي',  category:'AC',          categoryAr:'تكييف',    rating:4.9, reviews:160, jobs:400, exp:13, price:260, status:'online',  dist:0.6, avatar:'H', color:'#AB47BC' },
    { id:'w24', name:'Walid Fawzy',      nameAr:'وليد فوزي',    profession:'AC Maintenance',       profAr:'صيانة تكييف', category:'AC',          categoryAr:'تكييف',    rating:4.4, reviews:44,  jobs:100, exp:3,  price:130, status:'online',  dist:3.0, avatar:'W', color:'#CE93D8' },
    // ── دهانات ──
    { id:'w25', name:'Rami Fawzi',       nameAr:'رامي فوزي',    profession:'Painter & Decorator',  profAr:'دهان وديكور', category:'Painting',    categoryAr:'دهانات',   rating:4.4, reviews:44,  jobs:98,  exp:4,  price:120, status:'busy',    dist:2.8, avatar:'R', color:'#E91E63' },
    { id:'w26', name:'Samy Lotfy',       nameAr:'سامي لطفي',    profession:'Interior Painter',     profAr:'دهان داخلي',  category:'Painting',    categoryAr:'دهانات',   rating:4.6, reviews:70,  jobs:175, exp:6,  price:140, status:'online',  dist:1.6, avatar:'S', color:'#C2185B' },
    { id:'w27', name:'George Hanna',     nameAr:'جورج حنا',     profession:'Texture Specialist',   profAr:'متخصص ديكور', category:'Painting',    categoryAr:'دهانات',   rating:4.8, reviews:105, jobs:260, exp:9,  price:180, status:'online',  dist:1.1, avatar:'G', color:'#AD1457' },
    { id:'w28', name:'Mina Ramsis',      nameAr:'مينا رمسيس',   profession:'Exterior Painter',     profAr:'دهان خارجي',  category:'Painting',    categoryAr:'دهانات',   rating:4.5, reviews:58,  jobs:135, exp:5,  price:130, status:'online',  dist:2.2, avatar:'M', color:'#880E4F' },
    { id:'w29', name:'Adel Girgis',      nameAr:'عادل جرجس',    profession:'3D Wall Artist',       profAr:'فنان جداريات',category:'Painting',    categoryAr:'دهانات',   rating:4.9, reviews:135, jobs:320, exp:11, price:220, status:'online',  dist:0.8, avatar:'A', color:'#F06292' },
    { id:'w30', name:'Nabil Shehata',    nameAr:'نبيل شحاتة',   profession:'Wallpaper Installer',  profAr:'تركيب ورق حائط',category:'Painting',  categoryAr:'دهانات',   rating:4.3, reviews:35,  jobs:80,  exp:3,  price:110, status:'busy',    dist:3.3, avatar:'N', color:'#F8BBD0' },
    // ── نجارة ──
    { id:'w31', name:'Amr El-Shafei',    nameAr:'عمرو الشافعي', profession:'Master Carpenter',     profAr:'نجار محترف',  category:'Carpentry',   categoryAr:'نجارة',    rating:4.5, reviews:60,  jobs:130, exp:9,  price:130, status:'online',  dist:3.0, avatar:'A', color:'#795548' },
    { id:'w32', name:'Ibrahim Mansour',  nameAr:'إبراهيم منصور','profession':'Furniture Maker',    profAr:'صانع أثاث',   category:'Carpentry',   categoryAr:'نجارة',    rating:4.7, reviews:90,  jobs:220, exp:11, price:160, status:'online',  dist:1.4, avatar:'I', color:'#5D4037' },
    { id:'w33', name:'Mahmoud Selim',    nameAr:'محمود سليم',   profession:'Kitchen Specialist',   profAr:'متخصص مطابخ', category:'Carpentry',   categoryAr:'نجارة',    rating:4.8, reviews:115, jobs:285, exp:8,  price:180, status:'online',  dist:0.9, avatar:'M', color:'#4E342E' },
    { id:'w34', name:'Gamal Osman',      nameAr:'جمال عثمان',   profession:'Door & Window Expert', profAr:'خبير أبواب',  category:'Carpentry',   categoryAr:'نجارة',    rating:4.4, reviews:48,  jobs:110, exp:5,  price:120, status:'busy',    dist:2.6, avatar:'G', color:'#6D4C41' },
    { id:'w35', name:'Saad Kamal',       nameAr:'سعد كمال',     profession:'Wood Flooring Tech',   profAr:'فني باركيه',  category:'Carpentry',   categoryAr:'نجارة',    rating:4.6, reviews:75,  jobs:180, exp:7,  price:150, status:'online',  dist:1.8, avatar:'S', color:'#8D6E63' },
    { id:'w36', name:'Ashraf Maged',     nameAr:'أشرف ماجد',    profession:'Wardrobe Specialist',  profAr:'متخصص دواليب',category:'Carpentry',   categoryAr:'نجارة',    rating:4.9, reviews:140, jobs:350, exp:13, price:200, status:'online',  dist:0.5, avatar:'A', color:'#A1887F' },
    // ── بناء ──
    { id:'w37', name:'Farid Abdou',      nameAr:'فريد عبده',    profession:'Master Builder',       profAr:'بنّاء محترف',  category:'Construction',categoryAr:'بناء',     rating:4.7, reviews:98,  jobs:250, exp:15, price:200, status:'online',  dist:1.0, avatar:'F', color:'#607D8B' },
    { id:'w38', name:'Anwar Tantawy',    nameAr:'أنور الطنطاوي','profession':'Tiling Specialist',  profAr:'متخصص بلاط',  category:'Construction',categoryAr:'بناء',     rating:4.6, reviews:80,  jobs:200, exp:10, price:170, status:'online',  dist:1.7, avatar:'A', color:'#546E7A' },
    { id:'w39', name:'Refaat Gaber',     nameAr:'رفعت جابر',    profession:'Plastering Expert',    profAr:'خبير بياض',   category:'Construction',categoryAr:'بناء',     rating:4.5, reviews:62,  jobs:155, exp:7,  price:150, status:'busy',    dist:2.5, avatar:'R', color:'#455A64' },
    { id:'w40', name:'Lotfy Ahmed',      nameAr:'لطفي أحمد',    profession:'Concrete Specialist',  profAr:'متخصص خرسانة',category:'Construction',categoryAr:'بناء',     rating:4.8, reviews:120, jobs:300, exp:12, price:210, status:'online',  dist:0.8, avatar:'L', color:'#37474F' },
    { id:'w41', name:'Zaher Mahmoud',    nameAr:'زاهر محمود',   profession:'Interior Finisher',    profAr:'تشطيب داخلي', category:'Construction',categoryAr:'بناء',     rating:4.4, reviews:50,  jobs:120, exp:6,  price:140, status:'online',  dist:2.9, avatar:'Z', color:'#78909C' },
    { id:'w42', name:'Wahid Nasser',     nameAr:'وحيد ناصر',    profession:'Waterproofing Expert', profAr:'خبير عزل',    category:'Construction',categoryAr:'بناء',     rating:4.9, reviews:150, jobs:380, exp:14, price:240, status:'online',  dist:0.4, avatar:'W', color:'#B0BEC5' },
  ],

  bookings: [],
  messages: {}, // bookingId -> [{from, text, time}]
};

// ══════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════

// Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Fill all fields' });
  if (db.users.find(u => u.email === email)) return res.status(400).json({ success: false, message: 'Email already registered' });

  const user = {
    id: 'u_' + Date.now(),
    name, email, phone: phone || '',
    password, // in production: bcrypt.hash
    avatar: name[0].toUpperCase(),
    color: '#2979FF',
    bookings: 0, completed: 0, rating: 5.0,
    location: 'Cairo, Egypt',
  };
  db.users.push(user);

  const token = crypto.randomBytes(24).toString('hex');
  db.sessions[token] = user.id;

  const { password: _, ...safeUser } = user;
  res.json({ success: true, token, user: safeUser });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ success: false, message: 'Wrong email or password' });

  const token = crypto.randomBytes(24).toString('hex');
  db.sessions[token] = user.id;

  const { password: _, ...safeUser } = user;
  res.json({ success: true, token, user: safeUser });
});

// Middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !db.sessions[token]) return res.status(401).json({ success: false, message: 'Please login first' });
  req.userId = db.sessions[token];
  req.user = db.users.find(u => u.id === req.userId);
  next();
}

// Logout
app.post('/api/auth/logout', auth, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  delete db.sessions[token];
  res.json({ success: true });
});

// ══════════════════════════════════════════
//  WORKERS
// ══════════════════════════════════════════
app.get('/api/workers', (req, res) => {
  const { category, sort, status, lang } = req.query;
  let result = [...db.workers];
  if (category && category !== 'All' && category !== 'الكل') {
    result = result.filter(w => w.category === category || w.categoryAr === category);
  }
  if (status === 'online') result = result.filter(w => w.status === 'online');
  if (sort === 'rating')   result.sort((a, b) => b.rating - a.rating);
  else if (sort === 'distance') result.sort((a, b) => a.dist - b.dist);
  else if (sort === 'price') result.sort((a, b) => a.price - b.price);
  res.json({ success: true, data: result });
});

app.get('/api/workers/:id', (req, res) => {
  const w = db.workers.find(w => w.id === req.params.id);
  if (!w) return res.status(404).json({ success: false });
  res.json({ success: true, data: w });
});

// ══════════════════════════════════════════
//  BOOKINGS
// ══════════════════════════════════════════
app.get('/api/bookings', auth, (req, res) => {
  const bookings = db.bookings.filter(b => b.userId === req.userId);
  res.json({ success: true, data: bookings });
});

app.post('/api/bookings', auth, (req, res) => {
  const { workerId, description, payment, location } = req.body;
  const worker = db.workers.find(w => w.id === workerId);
  if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

  const fee = Math.round(worker.price * 0.1);
  const total = worker.price + fee;
  const id = Math.random().toString(36).substr(2, 6).toUpperCase();

  const booking = {
    id, userId: req.userId,
    workerId, workerName: worker.name, workerNameAr: worker.nameAr,
    profession: worker.profession, professionAr: worker.profAr,
    avatar: worker.avatar, color: worker.color,
    status: 'confirmed', amount: total,
    serviceFee: worker.price, platformFee: fee,
    payment: payment || 'Cash', description,
    location: location || req.user.location,
    createdAt: new Date().toISOString(),
  };

  db.bookings.unshift(booking);
  db.messages[booking.id] = [
    { from: 'system', text: `Booking #${id} confirmed! ${worker.name} will contact you soon.`, time: new Date().toISOString() }
  ];
  req.user.bookings++;

  res.json({ success: true, data: booking });
});

app.get('/api/bookings/:id', auth, (req, res) => {
  const b = db.bookings.find(b => b.id === req.params.id && b.userId === req.userId);
  if (!b) return res.status(404).json({ success: false });
  res.json({ success: true, data: b });
});

// ══════════════════════════════════════════
//  CHAT
// ══════════════════════════════════════════
app.get('/api/bookings/:id/messages', auth, (req, res) => {
  const b = db.bookings.find(b => b.id === req.params.id && b.userId === req.userId);
  if (!b) return res.status(404).json({ success: false });
  res.json({ success: true, data: db.messages[req.params.id] || [] });
});

app.post('/api/bookings/:id/messages', auth, (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ success: false });
  const b = db.bookings.find(b => b.id === req.params.id && b.userId === req.userId);
  if (!b) return res.status(404).json({ success: false });

  const msg = { from: 'user', text: text.trim(), time: new Date().toISOString() };
  if (!db.messages[req.params.id]) db.messages[req.params.id] = [];
  db.messages[req.params.id].push(msg);

  // Auto-reply from worker after 2 seconds
  setTimeout(() => {
    const replies = [
      'Hello! I received your message.',
      'I\'ll be there soon, thank you for your patience.',
      'Understood, I\'ll handle it right away.',
      'On my way! ETA 15 minutes.',
      'Thank you! I\'ll contact you when I arrive.',
    ];
    const workerReply = { from: 'worker', text: replies[Math.floor(Math.random() * replies.length)], time: new Date().toISOString() };
    db.messages[req.params.id].push(workerReply);
  }, 2000);

  res.json({ success: true, data: msg });
});

// ══════════════════════════════════════════
//  USER / PROFILE
// ══════════════════════════════════════════
app.get('/api/user', auth, (req, res) => {
  const { password: _, ...safeUser } = req.user;
  res.json({ success: true, data: safeUser });
});

app.put('/api/user/location', auth, (req, res) => {
  const { location, lat, lng } = req.body;
  req.user.location = location;
  req.user.lat = lat;
  req.user.lng = lng;
  res.json({ success: true, data: { location, lat, lng } });
});

app.put('/api/user', auth, (req, res) => {
  const { name, phone } = req.body;
  if (name) req.user.name = name;
  if (phone) req.user.phone = phone;
  const { password: _, ...safeUser } = req.user;
  res.json({ success: true, data: safeUser });
});

// ══════════════════════════════════════════
//  SEARCH
// ══════════════════════════════════════════
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ success: true, data: [] });
  const lower = q.toLowerCase();
  const results = db.workers.filter(w =>
    w.name.toLowerCase().includes(lower) ||
    w.nameAr.includes(q) ||
    w.profession.toLowerCase().includes(lower) ||
    w.profAr.includes(q) ||
    w.category.toLowerCase().includes(lower) ||
    w.categoryAr.includes(q)
  );
  res.json({ success: true, data: results });
});

// ══════════════════════════════════════════
//  OTP
// ══════════════════════════════════════════
app.post('/api/verify-otp', (req, res) => {
  const { otp } = req.body;
  if (otp === '1234') res.json({ success: true });
  else res.status(400).json({ success: false, message: 'Wrong OTP' });
});

// ══════════════════════════════════════════
//  TRACKING
// ══════════════════════════════════════════
app.get('/api/bookings/:id/track', auth, (req, res) => {
  const b = db.bookings.find(b => b.id === req.params.id);
  if (!b) return res.status(404).json({ success: false });
  const steps = [
    { key: 'confirmed', label: 'Booking Confirmed', done: true },
    { key: 'on_way',    label: 'Craftsman on the way', done: b.status !== 'confirmed' },
    { key: 'arrived',   label: 'Craftsman Arrived', done: b.status === 'arrived' || b.status === 'completed' },
    { key: 'completed', label: 'Service Completed', done: b.status === 'completed' },
  ];
  res.json({ success: true, data: { booking: b, steps } });
});

// Fallback SPA
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔨 Harfi API → http://localhost:${PORT}`);
});
