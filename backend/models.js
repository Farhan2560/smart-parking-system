const mongoose = require('mongoose');

const ZoneSchema = new mongoose.Schema({
  zone_id: Number,
  zone_name: String,
  location: String,
  total_slots: Number,
  available_slots: Number,
  hourly_rate: Number
});
const Zone = mongoose.model('Zone', ZoneSchema);

const SlotSchema = new mongoose.Schema({
  slot_id: Number,
  zone_id: Number,
  slot_number: String,
  slot_type: String,
  status: String
});
const Slot = mongoose.model('Slot', SlotSchema);

const SessionSchema = new mongoose.Schema({
  session_id: Number,
  slot_number: String,
  zone_name: String,
  vehicle_plate: String,
  driver_name: String,
  entry_time: String,
  exit_time: String,
  duration_hours: Number,
  amount_due: Number,
  status: String
});
const Session = mongoose.model('Session', SessionSchema);

const PaymentSchema = new mongoose.Schema({
  payment_id: Number,
  session_id: Number,
  driver_name: String,
  vehicle_plate: String,
  amount: Number,
  method: String,
  payment_time: String,
  status: String
});
const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = { Zone, Slot, Session, Payment };