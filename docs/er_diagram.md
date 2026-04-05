# Conceptual ER Diagram — ParKing

## 1. Entities and Attributes

### 1.1 User
> A registered user of the parking system (admin or customer).

| Attribute        | Type     | Notes                                             |
|------------------|----------|---------------------------------------------------|
| **_id** (PK)     | ObjectId | MongoDB-generated primary key                     |
| user_id          | Number   | Sequential integer identifier                     |
| username         | String   | Unique login name                                 |
| password         | String   | Bcrypt-hashed password (never returned by API)    |
| role             | String   | `"admin"` or `"customer"`                         |
| full_name        | String   | Display name for the user                         |

---

### 1.2 Zone
> A geographic parking area containing multiple slots.

| Attribute       | Type     | Notes                                              |
|-----------------|----------|----------------------------------------------------|
| **_id** (PK)    | ObjectId | MongoDB-generated primary key                      |
| zone_id         | Number   | Unique integer identifier                          |
| zone_name       | String   | e.g., "Downtown Central"                           |
| location        | String   | Street address of the zone                         |
| total_slots     | Number   | Total number of slots in this zone                 |
| available_slots | Number   | Real-time count of currently available slots       |
| hourly_rate     | Number   | Cost per hour in dollars ($/hr)                    |

---

### 1.3 Slot
> A single physical parking space within a zone.

| Attribute      | Type     | Notes                                                       |
|----------------|----------|-------------------------------------------------------------|
| **_id** (PK)   | ObjectId | MongoDB-generated primary key                               |
| slot_id        | Number   | Unique integer identifier                                   |
| zone_id (FK)   | Number   | References Zone by integer `zone_id`                        |
| slot_number    | String   | Human-readable bay code (e.g., "DO-001")                   |
| slot_type      | String   | `"Standard"`, `"Handicapped"`, or `"EV Charging"`          |
| status         | String   | `"Available"`, `"Occupied"`, or `"Maintenance"`            |

---

### 1.4 Session
> Records a vehicle occupying a parking slot. Resolves the relationship between users/vehicles and slots.

| Attribute       | Type     | Notes                                                        |
|-----------------|----------|--------------------------------------------------------------|
| **_id** (PK)    | ObjectId | MongoDB-generated primary key                                |
| slot_id (FK)    | Number   | References Slot by integer `slot_id`                         |
| zone_id (FK)    | Number   | References Zone by integer `zone_id`                         |
| slot_number     | String   | Denormalized from Slot at session start (for display)        |
| zone_name       | String   | Denormalized from Zone at session start (for display)        |
| vehicle_plate   | String   | License plate of the parked vehicle                          |
| driver_name     | String   | Name of the driver for this session                          |
| entry_time      | Date     | Timestamp when vehicle entered                               |
| exit_time       | Date     | Timestamp when vehicle exited (null while active)            |
| duration_hours  | Number   | **Derived** — computed as `exit_time − entry_time` in hours  |
| amount_due      | Number   | **Derived** — computed as `duration_hours × hourly_rate`     |
| status          | String   | `"Active"` or `"Completed"`                                  |
| user_id (FK)    | ObjectId | References User `_id` (set when a logged-in user starts the session) |

**Derived field detail:**
- `duration_hours` and `amount_due` are calculated at checkout and persisted on the session document for reporting. They are null while the session is active.

---

### 1.5 Payment
> A payment record linked 1:1 to a parking session.

| Attribute        | Type     | Notes                                                     |
|------------------|----------|-----------------------------------------------------------|
| **_id** (PK)     | ObjectId | MongoDB-generated primary key                             |
| session_ref (FK) | ObjectId | References Session `_id`                                  |
| amount           | Number   | Amount charged (populated on checkout)                    |
| method           | String   | Payment method (e.g., `"Credit Card"`)                   |
| payment_time     | Date     | Timestamp of the transaction                              |
| status           | String   | `"Pending"` (on session start) or `"Paid"` (on checkout) |

---

## 2. Relationships

| Relationship       | Cardinality | Description                                                      |
|--------------------|-------------|------------------------------------------------------------------|
| Zone → Slot        | **1 : N**   | One zone contains many slots; each slot belongs to one zone      |
| User → Session     | **1 : N**   | One user can have many sessions; each session belongs to one user|
| Session → Payment  | **1 : 1**   | Each session has exactly one payment record                      |

---

## 3. ER Diagram (Textual Representation)

```
[Zone] ──(1)──────────────────(N)── [Slot]
   |                                   |
zone_id                            slot_id
zone_name                          slot_number
location                           slot_type
total_slots                        status
available_slots                    zone_id (FK)
hourly_rate

[User] ──(1)──────────────────(N)── [Session] ──(1)── [Payment]
   |                                    |                  |
user_id                            slot_id (FK)       session_ref (FK)
username                           zone_id (FK)       amount
role                               vehicle_plate      method
full_name                          driver_name        payment_time
                                   entry_time         status
                                   exit_time
                                   duration_hours (derived)
                                   amount_due (derived)
                                   status
                                   user_id (FK)
```

**Legend:**
- Derived fields: `duration_hours`, `amount_due` (computed at checkout, stored for reporting)
- `slot_number`, `zone_name` in Session are denormalized copies stored at session creation for efficient display
