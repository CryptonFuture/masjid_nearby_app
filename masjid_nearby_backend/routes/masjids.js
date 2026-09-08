const express = require('express');
const router = express.Router();
const Masjid = require('../models/Masjid');

// GET nearby masjids (main feature)
// Query: lat, lng, radius (km, default 5), limit
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 5, limit = 50 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'lat and lng are required' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusInMeters = parseFloat(radius) * 1000;

    const masjids = await Masjid.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          distanceField: 'distance',
          maxDistance: radiusInMeters,
          spherical: true,
          query: { status: 'active' }
        }
      },
      { $limit: parseInt(limit) },
      {
        $project: {
          name: 1,
          nameUrdu: 1,
          address: 1,
          city: 1,
          area: 1,
          location: 1,
          phone: 1,
          facilities: 1,
          prayerTimes: 1,
          capacity: 1,
          rating: 1,
          reviewsCount: 1,
          isVerified: 1,
          description: 1,
          distance: 1, // meters
          distanceKm: { $round: [{ $divide: ['$distance', 1000] }, 2] }
        }
      }
    ]);

    res.json({
      count: masjids.length,
      userLocation: { lat: latitude, lng: longitude },
      radiusKm: parseFloat(radius),
      masjids
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search masjids by text
router.get('/search', async (req, res) => {
  try {
    const { q, city, page = 1, limit = 20 } = req.query;
    const query = { status: 'active' };

    if (q) {
      query.$text = { $search: q };
    }
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const masjids = await Masjid.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort(q ? { score: { $meta: 'textScore' } } : { name: 1 });

    const total = await Masjid.countDocuments(query);

    res.json({
      count: masjids.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      masjids
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all masjids (with optional city filter)
router.get('/', async (req, res) => {
  try {
    const { city, page = 1, limit = 30 } = req.query;
    const query = { status: 'active' };
    if (city) query.city = { $regex: city, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const masjids = await Masjid.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ name: 1 });

    const total = await Masjid.countDocuments(query);

    res.json({
      count: masjids.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      masjids
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single masjid
router.get('/:id', async (req, res) => {
  try {
    const masjid = await Masjid.findById(req.params.id);
    if (!masjid) {
      return res.status(404).json({ message: 'Masjid not found' });
    }
    res.json(masjid);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create masjid
router.post('/', async (req, res) => {
  try {
    const { name, address, city, lat, lng, ...rest } = req.body;

    if (!name || !address || !city || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: 'name, address, city, lat, lng are required' });
    }

    const masjid = new Masjid({
      name,
      address,
      city,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      },
      ...rest
    });

    await masjid.save();
    res.status(201).json(masjid);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update masjid
router.put('/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.lat !== undefined && updates.lng !== undefined) {
      updates.location = {
        type: 'Point',
        coordinates: [parseFloat(updates.lng), parseFloat(updates.lat)]
      };
      delete updates.lat;
      delete updates.lng;
    }

    const masjid = await Masjid.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!masjid) {
      return res.status(404).json({ message: 'Masjid not found' });
    }
    res.json(masjid);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const masjid = await Masjid.findByIdAndDelete(req.params.id);
    if (!masjid) {
      return res.status(404).json({ message: 'Masjid not found' });
    }
    res.json({ message: 'Masjid deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Stats
router.get('/stats/overview', async (req, res) => {
  try {
    const total = await Masjid.countDocuments({ status: 'active' });
    const byCity = await Masjid.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({ total, byCity });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
