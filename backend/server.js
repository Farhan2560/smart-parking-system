const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Zone, Slot, Session, Payment } = require('./models');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in environment. Create backend/.env to configure it.');
  process.exit(1);
}

const connectWithRetry = () => {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas successfully!'))
    .catch((err) => {
      console.error('MongoDB Atlas is still blocking access. Retrying in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

// --- SEED ROUTE ---
app.post('/api/seed', async (req, res) => {
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

    const sessions = [
      { session_id: 1, slot_number: "DO-001", zone_name: "Downtown Central", vehicle_plate: "ABC-1234", driver_name: "Alice Johnson", entry_time: "2026-03-29T08:00:00", exit_time: "2026-03-29T10:30:00", duration_hours: 2.5, amount_due: 8.75, status: "Completed" },
      { session_id: 2, slot_number: "DO-002", zone_name: "Downtown Central", vehicle_plate: "XYZ-5678", driver_name: "Bob Smith", entry_time: "2026-03-29T09:15:00", exit_time: null, duration_hours: null, amount_due: null, status: "Active" }
    ];
    const payments = [
      { payment_id: 1, session_id: 1, driver_name: "Alice Johnson", vehicle_plate: "ABC-1234", amount: 8.75, method: "Credit Card", payment_time: "2026-03-29T10:32:00", status: "Paid" }
    ];

    await Zone.insertMany(zones);
    await Slot.insertMany(slots);
    await Session.insertMany(sessions);
    await Payment.insertMany(payments);

    res.json({ message: 'Database seeded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ZONES ---
app.get('/api/zones', async (req, res) => {
  const data = await Zone.find();
  res.json(data);
});
app.post('/api/zones', async (req, res) => {
  try {
    const newZone = new Zone(req.body);
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
    res.status(400).json({ error: err.message });
  }
});
app.put('/api/zones/:id', async (req, res) => {
  try {
    const updated = await Zone.findOneAndUpdate({ zone_id: req.params.id }, req.body, { new: true });
    // if zone_id not found try _id
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- SLOTS ---
app.get('/api/slots', async (req, res) => {
  const data = await Slot.find();
  res.json(data);
});
app.post('/api/slots', async (req, res) => {
  const obj = new Slot(req.body);
  await obj.save();
  res.status(201).json(obj);
});
app.put('/api/slots/:id', async (req, res) => {
  const updated = await Slot.findOneAndUpdate({ slot_id: req.params.id }, req.body, { new: true });
  res.json(updated);
});

// --- SESSIONS ---
app.get('/api/sessions', async (req, res) => {
  const data = await Session.find();
  res.json(data);
});

app.post('/api/sessions', async (req, res) => {
  try {
    // auto increment session_id
    const lastSession = await Session.findOne().sort({ session_id: -1 });
    const nextId = lastSession ? lastSession.session_id + 1 : 1;
    const obj = new Session({ ...req.body, session_id: nextId });
    await obj.save();

    // Mark slot as occupied
    await Slot.findOneAndUpdate(
      { slot_number: req.body.slot_number },
      { status: "Occupied" }
    );

    // Decrease zone availability
    await Zone.findOneAndUpdate(
      { zone_name: req.body.zone_name },
      { $inc: { available_slots: -1 } }
    );

    // Create a pending payment
    const lastItem = await Payment.findOne().sort({ payment_id: -1 });
    const nextPaymentId = lastItem ? lastItem.payment_id + 1 : 1;
    await Payment.create({
      payment_id: nextPaymentId,
      session_id: nextId,
      driver_name: req.body.driver_name,
      vehicle_plate: req.body.vehicle_plate,
      status: "Pending"
    });

    res.status(201).json(obj);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/sessions/:id', async (req, res) => {
  try {
    const updatedSession = await Session.findOneAndUpdate({ session_id: req.params.id }, req.body, { new: true });

    if (req.body.status === "Completed") {
      // Mark slot as available
      await Slot.findOneAndUpdate(
        { slot_number: updatedSession.slot_number },
        { status: "Available" }
      );

      // Increase zone availability
      await Zone.findOneAndUpdate(
        { zone_name: updatedSession.zone_name },
        { $inc: { available_slots: 1 } }
      );

      // Complete the payment
      await Payment.findOneAndUpdate(
        { session_id: updatedSession.session_id },
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
    res.status(400).json({ error: err.message });
  }
});

// --- PAYMENTS ---
app.get('/api/payments', async (req, res) => {
  const data = await Payment.find();
  res.json(data);
});
app.post('/api/payments', async (req, res) => {
  const lastItem = await Payment.findOne().sort({ payment_id: -1 });
  const nextId = lastItem ? lastItem.payment_id + 1 : 1;
  const obj = new Payment({ ...req.body, payment_id: nextId });
  await obj.save();
  res.status(201).json(obj);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend API server running on http://localhost:${PORT}`);
});