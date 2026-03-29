const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { Zone, Slot, Session, Payment } = require('./models');

require('dotenv').config();

const app = express();

// Fix #4: Restrict CORS to the configured frontend origin instead of wildcard
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin }));

app.use(express.json());

// Rate limiting — prevents API abuse and database-level denial-of-service attacks.
// General limiter applied to all API routes: 200 requests per minute per IP.
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// Stricter limiter for write operations: 30 requests per minute per IP.
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/', generalLimiter);

// Fix #3: Admin-only middleware — protects infrastructure mutation endpoints.
// Set ADMIN_API_KEY in your .env file and supply the same value in the
// X-Admin-Token request header when calling protected routes.
const adminAuth = (req, res, next) => {
  const token = req.headers['x-admin-token'];
  if (!process.env.ADMIN_API_KEY || token !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in environment. Create backend/.env to configure it.');
  process.exit(1);
}

const connectWithRetry = () => {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas successfully!'))
    .catch((err) => {
      console.error('MongoDB connection failed, retrying in 5 seconds...', err.message);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

// Fix #1: Only allow seeding in development — prevents public database wipe in production
if (process.env.NODE_ENV === 'development') {
  app.post('/api/seed', writeLimiter, async (req, res) => {
    try {
      // Clear existing
      await Zone.deleteMany({});
      await Slot.deleteMany({});
      await Session.deleteMany({});
      await Payment.deleteMany({});

      // The data from frontend
      const zones = [
        { zone_id: 1, zone_name: "Downtown Central", location: "123 Main St", total_slots: 50, available_slots: 48, hourly_rate: 3.5 },
        { zone_id: 2, zone_name: "Westside Mall", location: "456 West Ave", total_slots: 120, available_slots: 120, hourly_rate: 2.0 },
        { zone_id: 3, zone_name: "Airport Terminal A", location: "Airport Rd", total_slots: 200, available_slots: 200, hourly_rate: 5.0 },
        { zone_id: 4, zone_name: "North Park Plaza", location: "789 North Blvd", total_slots: 80, available_slots: 80, hourly_rate: 1.5 },
      ];
      
      // Auto-generate realistic slot lists for these zones instead of just 4
      const slots = [];
      let slotCounter = 1;
      for (const z of zones) {
        let occupiedCount = z.total_slots - z.available_slots;
        for (let i = 1; i <= z.total_slots; i++) {
          slots.push({
            slot_id: slotCounter++,
            zone_id: z.zone_id,
            slot_number: `${z.zone_name.substring(0,2).toUpperCase()}-${i.toString().padStart(3, '0')}`,
            slot_type: i % 10 === 0 ? "Handicapped" : i % 8 === 0 ? "EV Charging" : "Standard",
            status: occupiedCount > 0 ? "Occupied" : "Available"
          });
          if (occupiedCount > 0) occupiedCount--;
        }
      }

      // Insert sessions and capture the inserted _ids for payment references
      const sessionDocs = await Session.insertMany([
        { slot_id: 1, zone_id: 1, slot_number: "DO-001", zone_name: "Downtown Central", vehicle_plate: "ABC-1234", driver_name: "Alice Johnson", entry_time: new Date("2026-03-29T08:00:00"), exit_time: new Date("2026-03-29T10:30:00"), duration_hours: 2.5, amount_due: 8.75, status: "Completed" },
        { slot_id: 2, zone_id: 1, slot_number: "DO-002", zone_name: "Downtown Central", vehicle_plate: "XYZ-5678", driver_name: "Bob Smith", entry_time: new Date("2026-03-29T09:15:00"), exit_time: null, duration_hours: null, amount_due: null, status: "Active" }
      ]);

      const payments = [
        { session_ref: sessionDocs[0]._id, amount: 8.75, method: "Credit Card", payment_time: new Date("2026-03-29T10:32:00"), status: "Paid" }
      ];

      await Zone.insertMany(zones);
      await Slot.insertMany(slots);
      await Payment.insertMany(payments);

      res.json({ message: 'Database seeded successfully' });
    } catch (error) {
      console.error('Seed error:', error);
      res.status(500).json({ error: 'An internal server error occurred' });
    }
  });
}

// --- ZONES ---
app.get('/api/zones', async (req, res) => {
  try {
    const data = await Zone.find();
    res.json(data);
  } catch (err) {
    console.error('GET /api/zones error:', err);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Fix #2: Destructure only the expected fields to prevent mass assignment.
// Fix #3: Require admin token for infrastructure mutations.
app.post('/api/zones', writeLimiter, adminAuth, async (req, res) => {
  try {
    const { zone_id, zone_name, location, total_slots, available_slots, hourly_rate } = req.body;
    const newZone = new Zone({ zone_id, zone_name, location, total_slots, available_slots, hourly_rate });
    await newZone.save();

    // Auto-generate slots for this new zone so it's usable immediately
    const slotsToCreate = [];
    const lastSlot = await Slot.findOne().sort({ slot_id: -1 });
    let nextSlotId = lastSlot ? lastSlot.slot_id + 1 : 1;

    for (let i = 1; i <= newZone.total_slots; i++) {
        slotsToCreate.push({
            slot_id: nextSlotId++,
            zone_id: newZone.zone_id,
            slot_number: `${newZone.zone_name.substring(0,2).toUpperCase()}-${i.toString().padStart(3, '0')}`,
            slot_type: i % 10 === 0 ? "Handicapped" : i % 8 === 0 ? "EV Charging" : "Standard",
            status: "Available"
        });
    }

    if (slotsToCreate.length > 0) {
        await Slot.insertMany(slotsToCreate);
    }

    res.status(201).json(newZone);
  } catch (err) {
    console.error('POST /api/zones error:', err);
    res.status(400).json({ error: err.message || 'Invalid zone data provided' });
  }
});

app.put('/api/zones/:id', writeLimiter, adminAuth, async (req, res) => {
  try {
    const { zone_name, location, total_slots, available_slots, hourly_rate } = req.body;
    const updated = await Zone.findOneAndUpdate(
      { zone_id: req.params.id },
      { zone_name, location, total_slots, available_slots, hourly_rate },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error('PUT /api/zones error:', err);
    res.status(400).json({ error: err.message || 'Invalid zone data provided' });
  }
});

// --- SLOTS ---
app.get('/api/slots', async (req, res) => {
  try {
    const data = await Slot.find();
    res.json(data);
  } catch (err) {
    console.error('GET /api/slots error:', err);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

app.post('/api/slots', writeLimiter, adminAuth, async (req, res) => {
  try {
    const { slot_id, zone_id, slot_number, slot_type, status } = req.body;
    const obj = new Slot({ slot_id, zone_id, slot_number, slot_type, status });
    await obj.save();
    res.status(201).json(obj);
  } catch (err) {
    console.error('POST /api/slots error:', err);
    res.status(400).json({ error: err.message || 'Invalid slot data provided' });
  }
});

app.put('/api/slots/:id', writeLimiter, adminAuth, async (req, res) => {
  try {
    const { slot_number, slot_type, status } = req.body;
    const updated = await Slot.findOneAndUpdate(
      { slot_id: req.params.id },
      { slot_number, slot_type, status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error('PUT /api/slots error:', err);
    res.status(400).json({ error: err.message || 'Invalid slot data provided' });
  }
});

// --- SESSIONS ---
// Fix #6: Paginated response — prevents unbounded queries on large datasets.
// Clients may pass ?page=<n>&limit=<n>; defaults to page 1, up to 100 records.
app.get('/api/sessions', async (req, res) => {
  try {
    const rawPage = req.query.page;
    const rawLimit = req.query.limit;
    if ((rawPage !== undefined && isNaN(parseInt(rawPage))) ||
        (rawLimit !== undefined && isNaN(parseInt(rawLimit)))) {
      return res.status(400).json({ error: 'page and limit must be numeric' });
    }
    const page = Math.max(1, parseInt(rawPage) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(rawLimit) || 100));
    const skip = (page - 1) * limit;
    const data = await Session.find().sort({ _id: -1 }).skip(skip).limit(limit);
    res.json(data);
  } catch (err) {
    console.error('GET /api/sessions error:', err);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

app.post('/api/sessions', writeLimiter, async (req, res) => {
  try {
    // Fix #2: Destructure only the expected fields.
    // Fix #8: No manual session_id — MongoDB _id (ObjectId) is unique by design
    //         and eliminates the race condition from manual auto-increment.
    // slot_id and zone_id are FK references; slot_number and zone_name are denormalized display fields.
    const { slot_id, zone_id, slot_number, zone_name, vehicle_plate, driver_name, entry_time, status } = req.body;
    const obj = new Session({ slot_id, zone_id, slot_number, zone_name, vehicle_plate, driver_name, entry_time, status });
    await obj.save();

    // Mark slot as occupied using the integer FK — immune to slot_number renames
    await Slot.findOneAndUpdate(
      { slot_id: obj.slot_id },
      { status: "Occupied" }
    );

    // Decrease zone availability using the integer FK — immune to zone_name renames
    await Zone.findOneAndUpdate(
      { zone_id: obj.zone_id },
      { $inc: { available_slots: -1 } }
    );

    // Create a pending payment linked by session ObjectId.
    // driver_name and vehicle_plate are NOT stored in Payment (3NF) — join from Session when needed.
    await Payment.create({
      session_ref: obj._id,
      status: "Pending"
    });

    res.status(201).json(obj);
  } catch (err) {
    console.error('POST /api/sessions error:', err);
    res.status(400).json({ error: err.message || 'Invalid session data provided' });
  }
});

app.put('/api/sessions/:id', writeLimiter, async (req, res) => {
  try {
    // Fix #2: Destructure only the expected fields.
    const { exit_time, duration_hours, amount_due, status } = req.body;
    const updatedSession = await Session.findByIdAndUpdate(
      req.params.id,
      { exit_time, duration_hours, amount_due, status },
      { new: true }
    );

    if (!updatedSession) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (updatedSession.status === "Completed") {
      // Mark slot as available using the integer FK — immune to slot_number renames
      await Slot.findOneAndUpdate(
        { slot_id: updatedSession.slot_id },
        { status: "Available" }
      );

      // Increase zone availability using the integer FK — immune to zone_name renames
      await Zone.findOneAndUpdate(
        { zone_id: updatedSession.zone_id },
        { $inc: { available_slots: 1 } }
      );

      // Complete the payment
      await Payment.findOneAndUpdate(
        { session_ref: updatedSession._id },
        { 
          amount: updatedSession.amount_due, 
          status: "Paid", 
          payment_time: updatedSession.exit_time,
          method: "Credit Card" 
        }
      );
    }

    res.json(updatedSession);
  } catch (err) {
    console.error('PUT /api/sessions error:', err);
    res.status(400).json({ error: err.message || 'Invalid session data provided' });
  }
});

// --- PAYMENTS ---
app.get('/api/payments', async (req, res) => {
  try {
    // Populate session_ref so the frontend can display driver/plate from the linked Session.
    // This avoids duplicating those fields in the Payment document (3NF).
    const data = await Payment.find().populate('session_ref', 'driver_name vehicle_plate');
    res.json(data);
  } catch (err) {
    console.error('GET /api/payments error:', err);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

app.post('/api/payments', writeLimiter, async (req, res) => {
  try {
    // Fix #2: Destructure only the expected fields.
    // Fix #8: payment_id removed — MongoDB _id (ObjectId) is used as identifier.
    // driver_name and vehicle_plate are not stored in Payment (3NF) — join from Session when needed.
    const { session_ref, amount, method, payment_time, status } = req.body;
    const obj = new Payment({ session_ref, amount, method, payment_time, status });
    await obj.save();
    res.status(201).json(obj);
  } catch (err) {
    console.error('POST /api/payments error:', err);
    res.status(400).json({ error: err.message || 'Invalid payment data provided' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend API server running on http://localhost:${PORT}`);
});