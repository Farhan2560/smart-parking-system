# MongoDB Document Schema — ParKing

## 1. Design Philosophy: Embedding vs. Referencing

MongoDB document modeling requires a choice between **embedding** (nested sub-documents) and **referencing** (storing an `_id` of another document). The decision is guided by:

| Factor              | Prefer Embedding                        | Prefer Referencing                        |
|---------------------|-----------------------------------------|-------------------------------------------|
| **Access pattern**  | Data is almost always read together     | Data is read independently or rarely      |
| **Data size**       | Sub-document is small and bounded       | Sub-document is large or unbounded        |
| **Update frequency**| Sub-document changes with parent        | Sub-document changes independently        |
| **Duplication**     | Acceptable for read performance         | Must avoid duplication                    |

---

## 2. Collection Design

### 2.1 `parking_zones` Collection
Zones are relatively static and small. Slots are embedded for fast availability lookups within a zone.

> **Decision: Embed `slots` array inside each zone document.**

**Rationale:** A zone is almost always queried together with its slots (e.g., "show all available slots in zone X"). Embedding avoids a costly join and is acceptable since the number of slots per zone is bounded (e.g., < 200).

```json
{
  "_id": "zone_1",
  "zone_name": "Zone A – Downtown",
  "location": {
    "street": "100 Main St",
    "city": "Springfield",
    "zip_code": "62701"
  },
  "slot_rate": 3.50,
  "zone_capacity": 50,
  "slots": [
    {
      "slot_id": "slot_101",
      "slot_number": "A-01",
      "slot_type": "Standard",
      "slot_status": "Available"
    },
    {
      "slot_id": "slot_102",
      "slot_number": "A-02",
      "slot_type": "Compact",
      "slot_status": "Occupied"
    }
  ]
}
```

---

### 2.2 `drivers` Collection
Driver contact numbers are bounded and always read with the driver profile.  
Vehicles owned by the driver are relatively few and are always listed on the driver profile.

> **Decision: Embed `contact_numbers` and `vehicles` arrays inside Driver documents.**

**Rationale:** A driver profile page always shows all contacts and all vehicles. Embedding reduces round-trips and reflects the 1:N ownership relationship. The arrays are bounded (a driver rarely owns > 10 vehicles or > 5 contact numbers).

```json
{
  "_id": "driver_1",
  "name": {
    "first": "Alice",
    "last": "Johnson"
  },
  "email": "alice.johnson@email.com",
  "license_number": "DL-IL-100001",
  "contact_numbers": [
    { "number": "217-555-0101", "type": "Mobile" },
    { "number": "217-555-0102", "type": "Home" }
  ],
  "vehicles": [
    {
      "vehicle_id": "vehicle_1",
      "license_plate": "IL-ABC-1234",
      "vehicle_model": "Toyota Corolla 2022",
      "fuel_type": "Petrol"
    },
    {
      "vehicle_id": "vehicle_2",
      "license_plate": "IL-XYZ-5678",
      "vehicle_model": "Nissan Leaf 2023",
      "fuel_type": "Electric"
    }
  ]
}
```

---

### 2.3 `parking_sessions` Collection
A session links a vehicle, a slot, and a payment. These entities live in separate collections and are referenced by ID.

> **Decision: Use References for `vehicle_id`, `slot_id`, and `zone_id`.**

**Rationale:** Sessions are created frequently and queried independently (e.g., billing history, zone occupancy reports). Referencing avoids duplicating vehicle and slot data in every session. The `total_duration` and `total_bill` are derived and computed at query time rather than stored.

```json
{
  "_id": "session_1001",
  "vehicle_id": "vehicle_1",
  "slot_id": "slot_101",
  "zone_id": "zone_1",
  "entry_time": { "$date": "2024-03-10T08:00:00Z" },
  "exit_time":  { "$date": "2024-03-10T10:30:00Z" },
  "payment": {
    "payment_id": "pay_5001",
    "amount": 8.75,
    "payment_method": "Card",
    "payment_status": "Completed",
    "payment_time": { "$date": "2024-03-10T10:32:00Z" }
  }
}
```

> **Decision: Embed `payment` inside the session document.**

**Rationale:** A payment is 1:1 with a session and is always read/updated with the session. Embedding the payment avoids a separate collection lookup and simplifies the checkout workflow (update session → embed payment in one atomic write).

---

## 3. Index Recommendations

```javascript
// Fast slot availability lookup by zone and status
db.parking_zones.createIndex({ "slots.slot_status": 1, "location.zip_code": 1 });

// Driver lookup by email (unique)
db.drivers.createIndex({ "email": 1 }, { unique: true });

// Vehicle lookup by license plate (unique)
db.drivers.createIndex({ "vehicles.license_plate": 1 }, { unique: true });

// Active session lookup by slot
db.parking_sessions.createIndex({ "slot_id": 1, "exit_time": 1 });

// Session history by vehicle
db.parking_sessions.createIndex({ "vehicle_id": 1, "entry_time": -1 });
```

---

## 4. Collection Summary

| Collection         | Embedding                              | Referencing                     |
|--------------------|----------------------------------------|---------------------------------|
| `parking_zones`    | `slots[]` embedded in zone             | —                               |
| `drivers`          | `contact_numbers[]`, `vehicles[]`      | —                               |
| `parking_sessions` | `payment` embedded in session          | `vehicle_id`, `slot_id`, `zone_id` |
