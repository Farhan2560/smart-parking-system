# Conceptual ER Diagram — ParKing

## 1. Entities and Attributes

### 1.1 Parking_Zone
> Represents a geographic parking area in the city.

| Attribute       | Type        | Notes                                     |
|-----------------|-------------|-------------------------------------------|
| **Zone_ID** (PK)| Simple      | Unique identifier for each zone           |
| Zone_Name       | Simple      | e.g., "Zone A – Downtown"                 |
| Zone_Location   | **Composite** | Decomposed into: Street, City, Zip_Code  |
| Slot_Rate       | Simple      | Hourly rate charged in this zone ($/hr)   |
| Zone_Capacity   | Simple      | Total number of slots in the zone         |

**Composite attribute detail:**
```
Zone_Location
├── Street   (e.g., "123 Main St")
├── City     (e.g., "Springfield")
└── Zip_Code (e.g., "62701")
```

---

### 1.2 Parking_Slot
> Represents one physical parking bay inside a zone.

| Attribute          | Type   | Notes                                          |
|--------------------|--------|------------------------------------------------|
| **Slot_ID** (PK)   | Simple | Unique identifier for each slot                |
| Zone_ID (FK)       | Simple | References Parking_Zone                        |
| Slot_Number        | Simple | Human-readable bay number (e.g., "A-12")       |
| Slot_Type          | Simple | "Compact", "Standard", "EV", "Handicapped"     |
| Slot_Status        | Simple | "Available", "Occupied", "Reserved", "Inactive"|

---

### 1.3 Driver
> A registered user of the parking system.

| Attribute            | Type            | Notes                                   |
|----------------------|-----------------|-----------------------------------------|
| **Driver_ID** (PK)   | Simple          | Unique identifier for each driver       |
| Driver_Name          | **Composite**   | Decomposed into: First_Name, Last_Name  |
| Email                | Simple          | Unique email address                    |
| License_Number       | Simple          | Driving licence number                  |
| Contact_Numbers      | **Multivalued** | A driver may have multiple phone numbers|

**Composite attribute detail:**
```
Driver_Name
├── First_Name  (e.g., "Alice")
└── Last_Name   (e.g., "Johnson")
```

**Multivalued attribute:**
- `Contact_Numbers` is multivalued because a driver can register a mobile number, a home number, or an emergency contact number. In the relational model this is stored in a separate `Driver_Contact` table.

---

### 1.4 Vehicle
> A vehicle registered by a driver.

| Attribute           | Type   | Notes                                           |
|---------------------|--------|-------------------------------------------------|
| **Vehicle_ID** (PK) | Simple | Unique identifier for each vehicle              |
| Driver_ID (FK)      | Simple | References the owning Driver                    |
| License_Plate       | Simple | Unique plate number (e.g., "ABC-1234")          |
| Vehicle_Model       | Simple | Make and model (e.g., "Toyota Corolla 2022")    |
| Fuel_Type           | Simple | "Petrol", "Diesel", "Electric", "Hybrid"        |

---

### 1.5 Parking_Session
> Records a vehicle entering and leaving a parking slot. Resolves the M:N relationship between Vehicle and Parking_Slot.

| Attribute              | Type        | Notes                                        |
|------------------------|-------------|----------------------------------------------|
| **Session_ID** (PK)    | Simple      | Unique identifier for the parking session    |
| Vehicle_ID (FK)        | Simple      | References Vehicle                           |
| Slot_ID (FK)           | Simple      | References Parking_Slot                      |
| Entry_Time             | Simple      | Timestamp when vehicle entered               |
| Exit_Time              | Simple      | Timestamp when vehicle exited (nullable)     |
| Total_Duration         | **Derived** | Computed as: `Exit_Time − Entry_Time`        |
| Total_Bill             | **Derived** | Computed as: `Total_Duration × Slot_Rate`    |

**Derived attribute detail:**
- `Total_Duration` and `Total_Bill` are not stored in the database; they are calculated on the fly using SQL expressions or application logic.

---

### 1.6 Payment
> A payment record linked to a parking session.

| Attribute              | Type   | Notes                                              |
|------------------------|--------|----------------------------------------------------|
| **Payment_ID** (PK)    | Simple | Unique identifier for the payment                  |
| Session_ID (FK)        | Simple | References Parking_Session (one payment per session)|
| Amount                 | Simple | Amount charged (must equal Total_Bill)             |
| Payment_Method         | Simple | "Cash", "Card", "UPI", "Wallet"                   |
| Payment_Status         | Simple | "Pending", "Completed", "Failed", "Refunded"       |
| Payment_Time           | Simple | Timestamp of the transaction                       |

---

## 2. Relationships

| Relationship                 | Cardinality | Description                                             |
|------------------------------|-------------|---------------------------------------------------------|
| Parking_Zone → Parking_Slot  | **1 : N**   | One zone contains many slots; each slot belongs to one zone |
| Driver → Vehicle             | **1 : N**   | One driver can own many vehicles; each vehicle has one owner |
| Vehicle ↔ Parking_Slot       | **M : N**   | Resolved by the `Parking_Session` associative entity    |
| Parking_Session → Payment    | **1 : 1**   | Each session has at most one payment record             |
| Driver → Driver_Contact      | **1 : N**   | Separate table for multivalued Contact_Numbers          |

---

## 3. ER Diagram (Textual Representation)

```
[Parking_Zone] ──(1)──────────(N)── [Parking_Slot]
      |                                    |
   Zone_ID                             Slot_ID
   Zone_Name                           Slot_Number
   Zone_Location*                      Slot_Type
   Slot_Rate                           Slot_Status
   Zone_Capacity                       Zone_ID (FK)

[Driver] ──(1)──────────────(N)── [Vehicle]
    |                                  |
 Driver_ID                         Vehicle_ID
 Driver_Name**                     License_Plate
 Email                             Vehicle_Model (simple)
 License_Number                    Fuel_Type (simple)
 {Contact_Numbers}***              Driver_ID (FK)

[Vehicle] ──(M)──────────────(N)── [Parking_Slot]
                    |
           [Parking_Session]
                    |
              Session_ID
              Entry_Time
              Exit_Time
              Total_Duration (derived)
              Total_Bill     (derived)

[Parking_Session] ──(1)──── [Payment]
                                |
                           Payment_ID
                           Amount
                           Payment_Method
                           Payment_Status
                           Payment_Time
```

**Legend:**
- `*`  Composite attribute (Zone_Location → Street, City, Zip_Code)
- `**` Composite attribute (Driver_Name → First_Name, Last_Name)
- `***` Multivalued attribute (stored in separate Driver_Contact table)
- Derived attributes: Total_Duration, Total_Bill (not physically stored)
