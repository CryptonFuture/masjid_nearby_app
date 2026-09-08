const mongoose = require('mongoose');

const masjidSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  nameUrdu: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true,
    index: true
  },
  area: {
    type: String,
    default: ''
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  phone: {
    type: String,
    default: ''
  },
  facilities: [{
    type: String,
    enum: [
      'Wudu Area', 'Parking', 'Women Section', 'AC', 'Library',
      'Madrasa', 'Funeral Services', 'Wheelchair Access', 'Quran Classes', 'Jummah'
    ]
  }],
  prayerTimes: {
    fajr: String,
    dhuhr: String,
    asr: String,
    maghrib: String,
    isha: String,
    jummah: String
  },
  capacity: {
    type: Number,
    default: 0
  },
  images: [String],
  description: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'under_construction', 'closed'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Geospatial index for nearby search
masjidSchema.index({ location: '2dsphere' });
masjidSchema.index({ name: 'text', address: 'text', city: 'text', area: 'text' });

module.exports = mongoose.model('Masjid', masjidSchema);
