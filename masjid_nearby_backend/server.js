const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/masjid_nearby';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Error:', err.message));

// Routes
app.use('/api/masjids', require('./routes/masjids'));

app.get('/', (req, res) => {
  res.json({
    message: 'Masjid Nearby API is running',
    version: '1.0.0',
    endpoints: {
      nearby: 'GET /api/masjids/nearby?lat=..&lng=..&radius=5',
      search: 'GET /api/masjids/search?q=...',
      all: 'GET /api/masjids',
      single: 'GET /api/masjids/:id',
      create: 'POST /api/masjids'
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`🕌 Masjid Nearby API running on http://localhost:${PORT}`);
});
