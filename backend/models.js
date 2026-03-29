const mongoose = require('mongoose');

const ZoneSchema = new mongoose.Schema({
  zone_id: { type: Number, required: true, unique: true },
  zone_name: { type: String, required: true },
  location: { type: String, required: true },
  total_slots: { type: Number, required: true, min: 1 },
  available_slots: { type: Number, required: true, min: 0 },
  hourly_rate: { type: Number, required: true, min: 0 }
});
const Zone = mongoose.model('Zone', ZoneSchema);

const SlotSchema = new mongoose.Schema({
  slot_id: { type: Number, required: true, unique: true },
  zone_id: { type: Number, required: true },
  slot_number: { type: String, required: true, unique: true },
  slot_type: { type: String, enum: ['Standard', 'Handicapped', 'EV Charging'], default: 'Standard' },
  status: { type: String, enum: ['Available', 'Occupied', 'Maintenance'], default: 'Available' }
});
const Slot = mongoose.model('Slot', SlotSchema);

// session_id removed — MongoDB _id (ObjectId) is used instead to avoid race conditions
const SessionSchema = new mongoose.Schema({
  slot_number: { type: String, required: true },
  zone_name: { type: String, required: true },
  vehicle_plate: { type: String, required: true },
  driver_name: { type: String, required: true },
  entry_time: { type: String, required: true },
  exit_time: String,
  duration_hours: Number,
  amount_due: Number,
  status: { type: String, enum: ['Active', 'Completed'], default: 'Active' }
});
const Session = mongoose.model('Session', SessionSchema);

// payment_id removed — MongoDB _id (ObjectId) is used instead to avoid race conditions
const PaymentSchema = new mongoose.Schema({
  session_ref: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  driver_name: String,
  vehicle_plate: String,
  amount: Number,
  method: String,
  payment_time: String,
  status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' }
});
const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = { Zone, Slot, Session, Payment };