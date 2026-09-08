const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Masjid = require('./models/Masjid');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/masjid_nearby';

const masjidsData = [
  // Lahore
  {
    name: 'Badshahi Mosque',
    nameUrdu: 'بادشاہی مسجد',
    address: 'Walled City, Lahore',
    city: 'Lahore',
    area: 'Old City',
    location: { type: 'Point', coordinates: [74.3100, 31.5880] },
    phone: '042-37232545',
    facilities: ['Wudu Area', 'Parking', 'Women Section', 'Jummah'],
    prayerTimes: { fajr: '04:45', dhuhr: '12:30', asr: '16:15', maghrib: '18:45', isha: '20:15', jummah: '13:00' },
    capacity: 100000,
    rating: 4.9,
    reviewsCount: 12500,
    isVerified: true,
    description: 'One of the largest mosques in the world, built by Mughal Emperor Aurangzeb.'
  },
  {
    name: 'Data Darbar Mosque',
    nameUrdu: 'داتا دربار مسجد',
    address: 'Data Ganj Bakhsh Road, Lahore',
    city: 'Lahore',
    area: 'Data Darbar',
    location: { type: 'Point', coordinates: [74.3050, 31.5760] },
    facilities: ['Wudu Area', 'Parking', 'Women Section', 'Jummah', 'Funeral Services'],
    prayerTimes: { fajr: '04:50', dhuhr: '12:35', asr: '16:20', maghrib: '18:50', isha: '20:20', jummah: '13:15' },
    capacity: 50000,
    rating: 4.8,
    isVerified: true,
    description: 'Associated with the shrine of Data Ganj Bakhsh.'
  },
  {
    name: 'Masjid-e-Shuhada',
    nameUrdu: 'مسجد شہداء',
    address: 'The Mall, Lahore',
    city: 'Lahore',
    area: 'Mall Road',
    location: { type: 'Point', coordinates: [74.3310, 31.5605] },
    facilities: ['Wudu Area', 'AC', 'Women Section', 'Jummah'],
    prayerTimes: { fajr: '04:48', dhuhr: '12:32', asr: '16:18', maghrib: '18:48', isha: '20:18', jummah: '13:00' },
    capacity: 5000,
    rating: 4.6,
    isVerified: true
  },
  {
    name: 'Grand Jamia Mosque',
    nameUrdu: 'گرینڈ جامع مسجد',
    address: 'Bahria Town, Lahore',
    city: 'Lahore',
    area: 'Bahria Town',
    location: { type: 'Point', coordinates: [74.1850, 31.3650] },
    facilities: ['Wudu Area', 'Parking', 'Women Section', 'AC', 'Library', 'Jummah', 'Wheelchair Access'],
    prayerTimes: { fajr: '04:55', dhuhr: '12:40', asr: '16:25', maghrib: '18:55', isha: '20:25', jummah: '13:30' },
    capacity: 70000,
    rating: 4.7,
    isVerified: true,
    description: 'One of the largest mosques in Pakistan located in Bahria Town.'
  },
  {
    name: 'Masjid-e-Aqsa',
    nameUrdu: 'مسجد اقصٰی',
    address: 'Model Town, Lahore',
    city: 'Lahore',
    area: 'Model Town',
    location: { type: 'Point', coordinates: [74.3220, 31.4830] },
    facilities: ['Wudu Area', 'Parking', 'Women Section', 'Jummah'],
    capacity: 3000,
    rating: 4.5,
    isVerified: true
  },
  {
    name: 'Jamia Masjid Al-Sadiq',
    nameUrdu: 'جامعہ مسجد الصادق',
    address: 'Gulberg III, Lahore',
    city: 'Lahore',
    area: 'Gulberg',
    location: { type: 'Point', coordinates: [74.3500, 31.5100] },
    facilities: ['Wudu Area', 'Parking', 'AC', 'Jummah'],
    capacity: 2000,
    rating: 4.4
  },
  // Islamabad
  {
    name: 'Faisal Mosque',
    nameUrdu: 'فیصل مسجد',
    address: 'Shah Faisal Avenue, Islamabad',
    city: 'Islamabad',
    area: 'F-8 / Margalla Hills',
    location: { type: 'Point', coordinates: [73.0380, 33.7295] },
    phone: '051-9203210',
    facilities: ['Wudu Area', 'Parking', 'Women Section', 'Library', 'Jummah', 'Wheelchair Access'],
    prayerTimes: { fajr: '04:40', dhuhr: '12:25', asr: '16:05', maghrib: '18:35', isha: '20:05', jummah: '13:00' },
    capacity: 300000,
    rating: 4.9,
    reviewsCount: 28000,
    isVerified: true,
    description: 'National mosque of Pakistan. Designed by Turkish architect Vedat Dalokay.'
  },
  {
    name: 'Lal Masjid',
    nameUrdu: 'لال مسجد',
    address: 'Aabpara, Islamabad',
    city: 'Islamabad',
    area: 'Aabpara',
    location: { type: 'Point', coordinates: [73.0780, 33.7080] },
    facilities: ['Wudu Area', 'Jummah', 'Madrasa'],
    capacity: 5000,
    rating: 4.2,
    isVerified: true
  },
  {
    name: 'Masjid-e-Rahmatul-lil-Alameen',
    nameUrdu: 'مسجد رحمت للعالمین',
    address: 'F-10 Markaz, Islamabad',
    city: 'Islamabad',
    area: 'F-10',
    location: { type: 'Point', coordinates: [73.0150, 33.6930] },
    facilities: ['Wudu Area', 'Parking', 'Women Section', 'AC', 'Jummah'],
    capacity: 4000,
    rating: 4.6,
    isVerified: true
  },
  // Karachi
  {
    name: 'Masjid-e-Tooba',
    nameUrdu: 'مسجد طوبیٰ',
    address: 'Defence Phase 2, Karachi',
    city: 'Karachi',
    area: 'DHA',
    location: { type: 'Point', coordinates: [67.0650, 24.8150] },
    facilities: ['Wudu Area', 'Parking', 'Women Section', 'Jummah'],
    capacity: 5000,
    rating: 4.7,
    isVerified: true,
    description: 'Also known as Gol Masjid due to its unique dome structure.'
  },
  {
    name: 'Memon Masjid',
    nameUrdu: 'میمن مسجد',
    address: 'Burns Road, Karachi',
    city: 'Karachi',
    area: 'Saddar',
    location: { type: 'Point', coordinates: [67.0250, 24.8600] },
    facilities: ['Wudu Area', 'Parking', 'Jummah'],
    capacity: 10000,
    rating: 4.5,
    isVerified: true
  },
  {
    name: 'Grand Jamia Masjid Bahria Town',
    nameUrdu: 'گرینڈ جامع مسجد بحریہ ٹاؤن',
    address: 'Bahria Town, Karachi',
    city: 'Karachi',
    area: 'Bahria Town',
    location: { type: 'Point', coordinates: [67.3100, 25.0100] },
    facilities: ['Wudu Area', 'Parking', 'Women Section', 'AC', 'Jummah', 'Wheelchair Access'],
    capacity: 25000,
    rating: 4.8,
    isVerified: true
  },
  {
    name: 'Usmania Masjid',
    nameUrdu: 'عثمانیہ مسجد',
    address: 'Gulshan-e-Iqbal, Karachi',
    city: 'Karachi',
    area: 'Gulshan',
    location: { type: 'Point', coordinates: [67.0900, 24.9200] },
    facilities: ['Wudu Area', 'Parking', 'Women Section', 'Jummah'],
    capacity: 3000,
    rating: 4.4
  },
  // Rawalpindi
  {
    name: 'Jamia Masjid Raja Bazaar',
    nameUrdu: 'جامع مسجد راجہ بازار',
    address: 'Raja Bazaar, Rawalpindi',
    city: 'Rawalpindi',
    area: 'Raja Bazaar',
    location: { type: 'Point', coordinates: [73.0550, 33.6000] },
    facilities: ['Wudu Area', 'Jummah'],
    capacity: 8000,
    rating: 4.3,
    isVerified: true
  },
  {
    name: 'Masjid-e-Noor',
    nameUrdu: 'مسجد نور',
    address: 'Saddar, Rawalpindi',
    city: 'Rawalpindi',
    area: 'Saddar',
    location: { type: 'Point', coordinates: [73.0480, 33.5950] },
    facilities: ['Wudu Area', 'Parking', 'Women Section', 'Jummah'],
    capacity: 2500,
    rating: 4.5
  },
  // Faisalabad
  {
    name: 'Jamia Masjid Clock Tower',
    nameUrdu: 'جامع مسجد کلاک ٹاور',
    address: 'Clock Tower, Faisalabad',
    city: 'Faisalabad',
    area: 'Clock Tower',
    location: { type: 'Point', coordinates: [73.0800, 31.4180] },
    facilities: ['Wudu Area', 'Jummah'],
    capacity: 6000,
    rating: 4.4,
    isVerified: true
  },
  // Multan
  {
    name: 'Masjid Wali Muhammad',
    nameUrdu: 'مسجد ولی محمد',
    address: 'Hussain Agahi, Multan',
    city: 'Multan',
    area: 'Old City',
    location: { type: 'Point', coordinates: [71.4750, 30.1970] },
    facilities: ['Wudu Area', 'Jummah'],
    capacity: 4000,
    rating: 4.5,
    isVerified: true
  },
  // Peshawar
  {
    name: 'Mahabat Khan Mosque',
    nameUrdu: 'محبت خان مسجد',
    address: 'Andar Shehr, Peshawar',
    city: 'Peshawar',
    area: 'Old City',
    location: { type: 'Point', coordinates: [71.5750, 34.0080] },
    facilities: ['Wudu Area', 'Jummah'],
    capacity: 5000,
    rating: 4.6,
    isVerified: true,
    description: 'Historic Mughal-era mosque in the heart of Peshawar.'
  },
  // More Lahore nearby for testing
  {
    name: 'Masjid Al-Huda',
    nameUrdu: 'مسجد الہدیٰ',
    address: 'Johar Town, Lahore',
    city: 'Lahore',
    area: 'Johar Town',
    location: { type: 'Point', coordinates: [74.2800, 31.4700] },
    facilities: ['Wudu Area', 'Parking', 'Women Section', 'AC', 'Jummah'],
    capacity: 1500,
    rating: 4.3
  },
  {
    name: 'Masjid Bilal',
    nameUrdu: 'مسجد بلال',
    address: 'DHA Phase 5, Lahore',
    city: 'Lahore',
    area: 'DHA',
    location: { type: 'Point', coordinates: [74.3800, 31.4700] },
    facilities: ['Wudu Area', 'Parking', 'Women Section', 'AC', 'Jummah', 'Wheelchair Access'],
    capacity: 2500,
    rating: 4.6,
    isVerified: true
  },
  {
    name: 'Masjid-e-Nabvi Colony',
    nameUrdu: 'مسجد نبوی کالونی',
    address: 'Garden Town, Lahore',
    city: 'Lahore',
    area: 'Garden Town',
    location: { type: 'Point', coordinates: [74.3400, 31.5000] },
    facilities: ['Wudu Area', 'Parking', 'Jummah'],
    capacity: 1200,
    rating: 4.2
  }
];

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await Masjid.deleteMany({});
    console.log('Cleared existing masjids');

    await Masjid.insertMany(masjidsData);
    console.log(`✅ Seeded ${masjidsData.length} masjids successfully!`);

    console.log('\nCities covered: Lahore, Islamabad, Karachi, Rawalpindi, Faisalabad, Multan, Peshawar');
    console.log('You can now search nearby using lat/lng of any of these cities.\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
