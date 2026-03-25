// ============================================================
// Urban Smart Parking System (USPS)
// MongoDB CRUD Operation Examples
// Run with: mongosh usps_db --file mongodb/crud_examples.js
// ============================================================

// Switch to the USPS database
use("usps_db");

// ============================================================
// CREATE EXAMPLES
// ============================================================

// ----------------------------------------------------------
// C1: Register a new driver with nested contact numbers and
//     a nested array of vehicles.
// ----------------------------------------------------------
db.drivers.insertOne({
    _id: "driver_4",
    name: {
        first: "David",
        last:  "Brown"
    },
    email:          "david.brown@email.com",
    license_number: "DL-CC-200002",
    contact_numbers: [
        { number: "501-555-0401", type: "Mobile" },
        { number: "501-555-0402", type: "Work"   }
    ],
    vehicles: [
        {
            vehicle_id:    "vehicle_6",
            license_plate: "CC-MNO-2345",
            vehicle_model: "Toyota Prius 2022",
            fuel_type:     "Hybrid"
        }
    ]
});

// ----------------------------------------------------------
// C2: Add a new parking zone with embedded slots
// ----------------------------------------------------------
db.parking_zones.insertOne({
    _id:           "zone_4",
    zone_name:     "Zone D – Tech Park",
    location: {
        street:   "300 Innovation Dr",
        city:     "Capital City",
        zip_code: "72002"
    },
    slot_rate:     4.00,
    zone_capacity: 60,
    slots: [
        {
            slot_id:     "slot_401",
            slot_number: "D-01",
            slot_type:   "Standard",
            slot_status: "Available"
        },
        {
            slot_id:     "slot_402",
            slot_number: "D-02",
            slot_type:   "EV",
            slot_status: "Available"
        }
    ]
});

// ----------------------------------------------------------
// C3: Log a new parking session (vehicle enters a slot)
// ----------------------------------------------------------
db.parking_sessions.insertOne({
    _id:        "session_1006",
    vehicle_id: "vehicle_6",
    slot_id:    "slot_401",
    zone_id:    "zone_4",
    entry_time: new Date("2024-03-11T09:00:00Z"),
    exit_time:  null,
    payment:    null
});

// Mark slot as Occupied
db.parking_zones.updateOne(
    { _id: "zone_4", "slots.slot_id": "slot_401" },
    { $set: { "slots.$.slot_status": "Occupied" } }
);


// ============================================================
// READ EXAMPLES
// ============================================================

// ----------------------------------------------------------
// R1: Find all Available slots in a specific Zip Code (62701)
// ----------------------------------------------------------
const availableSlots = db.parking_zones.aggregate([
    { $match: { "location.zip_code": "62701" } },
    { $unwind: "$slots" },
    { $match: { "slots.slot_status": "Available" } },
    {
        $project: {
            _id:         0,
            zone_name:   1,
            zip_code:    "$location.zip_code",
            slot_id:     "$slots.slot_id",
            slot_number: "$slots.slot_number",
            slot_type:   "$slots.slot_type",
            slot_rate:   1
        }
    },
    { $sort: { slot_number: 1 } }
]);

print("=== Available Slots in Zip Code 62701 ===");
availableSlots.forEach(printjson);

// ----------------------------------------------------------
// R2: Find all drivers who own Electric or Hybrid vehicles
// ----------------------------------------------------------
const ecoDrivers = db.drivers.find(
    { "vehicles.fuel_type": { $in: ["Electric", "Hybrid"] } },
    {
        "name": 1,
        "email": 1,
        "vehicles.$": 1
    }
);

print("\n=== Drivers with Electric or Hybrid Vehicles ===");
ecoDrivers.forEach(printjson);

// ----------------------------------------------------------
// R3: Find all completed sessions with payment info
// ----------------------------------------------------------
const completedSessions = db.parking_sessions.find(
    {
        "exit_time": { $ne: null },
        "payment.payment_status": "Completed"
    },
    {
        _id:             1,
        vehicle_id:      1,
        slot_id:         1,
        entry_time:      1,
        exit_time:       1,
        "payment.amount":         1,
        "payment.payment_method": 1
    }
).sort({ entry_time: -1 });

print("\n=== Completed Parking Sessions ===");
completedSessions.forEach(printjson);

// ----------------------------------------------------------
// R4: Find a driver by email
// ----------------------------------------------------------
const driver = db.drivers.findOne({ email: "alice.johnson@email.com" });
print("\n=== Driver Profile (alice.johnson@email.com) ===");
printjson(driver);


// ============================================================
// UPDATE EXAMPLES
// ============================================================

// ----------------------------------------------------------
// U1: Log a Check-out — set Exit_Time and update Slot_Status
//     to Available for Session session_1006
// ----------------------------------------------------------
// Step 1: Set Exit_Time on the session and embed the payment
db.parking_sessions.updateOne(
    { _id: "session_1006" },
    {
        $set: {
            exit_time: new Date("2024-03-11T11:30:00Z"),
            payment: {
                payment_id:     "pay_5006",
                amount:         10.00,
                payment_method: "Card",
                payment_status: "Completed",
                payment_time:   new Date("2024-03-11T11:32:00Z")
            }
        }
    }
);

// Step 2: Mark the slot Available again in the zone document
db.parking_zones.updateOne(
    { _id: "zone_4", "slots.slot_id": "slot_401" },
    { $set: { "slots.$.slot_status": "Available" } }
);

print("\n=== Session 1006 after check-out ===");
printjson(db.parking_sessions.findOne({ _id: "session_1006" }));

// ----------------------------------------------------------
// U2: Add a new contact number for an existing driver
// ----------------------------------------------------------
db.drivers.updateOne(
    { _id: "driver_1" },
    {
        $push: {
            contact_numbers: { number: "217-555-0199", type: "Emergency" }
        }
    }
);

// ----------------------------------------------------------
// U3: Update a driver's vehicle fuel type (model upgrade)
// ----------------------------------------------------------
db.drivers.updateOne(
    { _id: "driver_4", "vehicles.vehicle_id": "vehicle_6" },
    { $set: { "vehicles.$.fuel_type": "Electric" } }
);

// ----------------------------------------------------------
// U4: Mark a payment as Refunded
// ----------------------------------------------------------
db.parking_sessions.updateOne(
    { _id: "session_1002", "payment.payment_id": "pay_5002" },
    { $set: { "payment.payment_status": "Refunded" } }
);


// ============================================================
// DELETE EXAMPLES
// ============================================================

// ----------------------------------------------------------
// D1: Remove a cancelled/failed payment record by resetting
//     the embedded payment to null (the session is retained)
// ----------------------------------------------------------
db.parking_sessions.updateOne(
    {
        _id: "session_1002",
        "payment.payment_status": "Refunded"
    },
    { $set: { payment: null } }
);

print("\n=== Session 1002 after payment removal ===");
printjson(db.parking_sessions.findOne({ _id: "session_1002" }));

// ----------------------------------------------------------
// D2: Delete an entire parking session that was cancelled
//     before the vehicle ever entered (no payment exists)
// ----------------------------------------------------------
db.parking_sessions.deleteOne({ _id: "session_1006", payment: null });

// ----------------------------------------------------------
// D3: Remove a specific contact number from a driver
// ----------------------------------------------------------
db.drivers.updateOne(
    { _id: "driver_1" },
    {
        $pull: {
            contact_numbers: { number: "217-555-0199" }
        }
    }
);

// ----------------------------------------------------------
// D4: Remove a vehicle from a driver's profile (sold/transferred)
// ----------------------------------------------------------
db.drivers.updateOne(
    { _id: "driver_4" },
    {
        $pull: {
            vehicles: { vehicle_id: "vehicle_6" }
        }
    }
);

print("\nAll CRUD examples executed successfully.");
