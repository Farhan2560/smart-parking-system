# MongoDB Document Schema — ParKing

## Collections

The application uses five MongoDB collections managed via Mongoose. All collections use MongoDB `_id` (ObjectId) as the primary key. Integer `*_id` fields (e.g., `zone_id`, `slot_id`) are stored as additional indexed fields for human-readable references and foreign-key lookups.

---

### `users` Collection

Stores registered users with hashed passwords and roles.

```json
{
  "_id": "<ObjectId>",
  "user_id": 1,
  "username": "alice",
  "password": "<bcrypt hash>",
  "role": "customer",
  "full_name": "Alice Johnson"
}
```

| Field     | Type     | Constraints                          |
|-----------|----------|--------------------------------------|
| _id       | ObjectId | Primary key (auto-generated)         |
| user_id   | Number   | Unique, sequential integer           |
| username  | String   | Required, unique                     |
| password  | String   | Required, bcrypt-hashed              |
| role      | String   | `"admin"` or `"customer"` (default) |
| full_name | String   | Display name (default: `""`)         |

---

### `zones` Collection

Stores parking zones with real-time slot availability.

```json
{
  "_id": "<ObjectId>",
  "zone_id": 1,
  "zone_name": "Downtown Central",
  "location": "123 Main St",
  "total_slots": 50,
  "available_slots": 48,
  "hourly_rate": 3.5
}
```

| Field           | Type     | Constraints                   |
|-----------------|----------|-------------------------------|
| _id             | ObjectId | Primary key (auto-generated)  |
| zone_id         | Number   | Required, unique               |
| zone_name       | String   | Required                       |
| location        | String   | Required                       |
| total_slots     | Number   | Required, min: 1               |
| available_slots | Number   | Required, min: 0               |
| hourly_rate     | Number   | Required, min: 0               |

---

### `slots` Collection

Stores individual parking spaces. Each slot references its zone by integer `zone_id`.

```json
{
  "_id": "<ObjectId>",
  "slot_id": 1,
  "zone_id": 1,
  "slot_number": "DO-001",
  "slot_type": "Standard",
  "status": "Available"
}
```

| Field       | Type     | Constraints                                              |
|-------------|----------|----------------------------------------------------------|
| _id         | ObjectId | Primary key (auto-generated)                             |
| slot_id     | Number   | Required, unique                                         |
| zone_id     | Number   | Required, references `zones.zone_id`                    |
| slot_number | String   | Required, unique                                         |
| slot_type   | String   | `"Standard"`, `"Handicapped"`, `"EV Charging"` (default: `"Standard"`) |
| status      | String   | `"Available"`, `"Occupied"`, `"Maintenance"` (default: `"Available"`) |

**Slot auto-generation:** When a new zone is created via `POST /api/zones`, slots are automatically generated for all `total_slots` positions. Slot numbers follow the pattern `<ZO>-001` where `<ZO>` is the first two characters of the zone name. Every 8th slot is `"EV Charging"` and every 10th is `"Handicapped"`.

---

### `sessions` Collection

Records a vehicle occupying a parking slot. Denormalized `slot_number` and `zone_name` fields are stored at creation time for efficient display without lookups.

```json
{
  "_id": "<ObjectId>",
  "slot_id": 1,
  "zone_id": 1,
  "slot_number": "DO-001",
  "zone_name": "Downtown Central",
  "vehicle_plate": "ABC-1234",
  "driver_name": "Alice Johnson",
  "entry_time": "2026-03-29T08:00:00.000Z",
  "exit_time": "2026-03-29T10:30:00.000Z",
  "duration_hours": 2.5,
  "amount_due": 8.75,
  "status": "Completed",
  "user_id": "<ObjectId>"
}
```

| Field         | Type     | Constraints                                             |
|---------------|----------|---------------------------------------------------------|
| _id           | ObjectId | Primary key (auto-generated)                            |
| slot_id       | Number   | Required, references `slots.slot_id`                   |
| zone_id       | Number   | Required, references `zones.zone_id`                   |
| slot_number   | String   | Denormalized from Slot at session start                 |
| zone_name     | String   | Denormalized from Zone at session start                 |
| vehicle_plate | String   | Required                                                |
| driver_name   | String   | Required                                                |
| entry_time    | Date     | Required                                                |
| exit_time     | Date     | Null while session is active; set on checkout           |
| duration_hours| Number   | Computed at checkout (`exit_time − entry_time` in hours)|
| amount_due    | Number   | Computed at checkout (`duration_hours × hourly_rate`)   |
| status        | String   | `"Active"` or `"Completed"` (default: `"Active"`)      |
| user_id       | ObjectId | References `users._id` (set for authenticated sessions) |

**Side effects on session start:** The linked slot's `status` is set to `"Occupied"` and the zone's `available_slots` is decremented by 1. A `Pending` payment document is created automatically.

**Side effects on checkout:** The slot's `status` reverts to `"Available"`, the zone's `available_slots` is incremented by 1, and the linked payment is updated to `"Paid"` with the computed amount.

---

### `payments` Collection

Stores one payment record per session. The payment is created automatically as `"Pending"` when a session starts and updated to `"Paid"` on checkout.

```json
{
  "_id": "<ObjectId>",
  "session_ref": "<ObjectId>",
  "amount": 8.75,
  "method": "Credit Card",
  "payment_time": "2026-03-29T10:32:00.000Z",
  "status": "Paid"
}
```

| Field        | Type     | Constraints                                           |
|--------------|----------|-------------------------------------------------------|
| _id          | ObjectId | Primary key (auto-generated)                          |
| session_ref  | ObjectId | Required, references `sessions._id`                  |
| amount       | Number   | Populated on checkout                                 |
| method       | String   | Payment method (e.g., `"Credit Card"`)               |
| payment_time | Date     | Timestamp of the transaction; set on checkout         |
| status       | String   | `"Pending"` (default) or `"Paid"`                    |

---

## Index Recommendations

```javascript
// Fast slot lookup by zone
db.slots.createIndex({ "zone_id": 1 });

// Active session lookup by slot (prevents double-booking)
db.sessions.createIndex({ "slot_id": 1, "status": 1 });

// Session history by user
db.sessions.createIndex({ "user_id": 1, "entry_time": -1 });

// Payment lookup by session
db.payments.createIndex({ "session_ref": 1 }, { unique: true });

// User lookup by username (unique)
db.users.createIndex({ "username": 1 }, { unique: true });
```

---

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Slots stored in a **separate collection** (not embedded in zones) | Slots are updated independently (status changes) and can be queried individually. Embedding would require array element updates on every status change. |
| `slot_number` / `zone_name` **denormalized** in sessions | Avoids joins when displaying session history; values are fixed at the time of session creation and do not change. |
| `driver_name` / `vehicle_plate` stored **directly on sessions** (not in a separate User sub-document) | Customers enter these fields per session; not all sessions are linked to a registered user. |
| Payment stored in a **separate collection** | Payments have an independent lifecycle (Pending → Paid) and are queried independently for billing history. |
| Integer `zone_id` / `slot_id` used as FKs in sessions | Provides stable references that are immune to name renames and easier to use in range queries than ObjectIds. |
