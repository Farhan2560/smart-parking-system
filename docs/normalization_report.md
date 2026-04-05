# Normalization Report — ParKing

## Overview

This report documents the normalization analysis for the **reference SQL schema** (`sql/schema.sql`). The application's primary database is MongoDB; the SQL schema is provided as a reference relational design. All relations are normalized up to **Third Normal Form (3NF)**.

---

## Table 1: `Parking_Zone`

**Schema:**
```
Parking_Zone(Zone_ID, Zone_Name, Street, City, Zip_Code, Slot_Rate, Zone_Capacity)
```

> Note: The composite attribute `Zone_Location` is decomposed into atomic columns `Street`, `City`, and `Zip_Code`.

**Functional Dependencies:**
```
Zone_ID → Zone_Name, Street, City, Zip_Code, Slot_Rate, Zone_Capacity
```

| Normal Form | Satisfied? | Reason |
|-------------|------------|--------|
| **1NF**     | ✅ Yes     | All attributes are atomic (composite `Zone_Location` decomposed). No repeating groups. |
| **2NF**     | ✅ Yes     | Primary key is a single attribute (`Zone_ID`), so partial dependency cannot exist. Every non-key attribute is fully dependent on `Zone_ID`. |
| **3NF**     | ✅ Yes     | No non-key attribute determines another non-key attribute. There are no transitive dependencies. |

**Highest Normal Form: 3NF (also BCNF, since the only determinant is the primary key)**

---

## Table 2: `Parking_Slot`

**Schema:**
```
Parking_Slot(Slot_ID, Zone_ID, Slot_Number, Slot_Type, Slot_Status)
```

**Functional Dependencies:**
```
Slot_ID → Zone_ID, Slot_Number, Slot_Type, Slot_Status
Zone_ID → (references Parking_Zone; not a FD within this table)
```

| Normal Form | Satisfied? | Reason |
|-------------|------------|--------|
| **1NF**     | ✅ Yes     | All attributes are atomic. No repeating groups or multi-valued cells. |
| **2NF**     | ✅ Yes     | Single-attribute primary key (`Slot_ID`); every non-key attribute depends on the whole key. |
| **3NF**     | ✅ Yes     | `Zone_ID` is a foreign key, not a determinant of other non-key attributes within this table. No transitive dependencies exist. |

**Highest Normal Form: 3NF**

---

## Table 3: `Driver`

**Schema:**
```
Driver(Driver_ID, First_Name, Last_Name, Email, License_Number)
```

> Note: The composite attribute `Driver_Name` is decomposed into `First_Name` and `Last_Name`. The multivalued attribute `Contact_Numbers` is placed in a separate `Driver_Contact` table.

**Functional Dependencies:**
```
Driver_ID → First_Name, Last_Name, Email, License_Number
Email     → Driver_ID, First_Name, Last_Name, License_Number  (alternate key)
License_Number → Driver_ID, First_Name, Last_Name, Email      (alternate key)
```

| Normal Form | Satisfied? | Reason |
|-------------|------------|--------|
| **1NF**     | ✅ Yes     | `Driver_Name` decomposed into atomic `First_Name` and `Last_Name`. `Contact_Numbers` moved out. All cells are single-valued. |
| **2NF**     | ✅ Yes     | Primary key `Driver_ID` is single-attribute; all non-key attributes are fully functionally dependent on it. |
| **3NF**     | ✅ Yes     | No non-key attribute transitively depends on another non-key attribute. (`Email` and `License_Number` are alternate keys, not transitive dependencies.) |

**Highest Normal Form: 3NF (also BCNF)**

---

## Table 4: `Driver_Contact`

**Schema:**
```
Driver_Contact(Contact_ID, Driver_ID, Contact_Number, Contact_Type)
```

> Separate table to handle the multivalued `Contact_Numbers` attribute of Driver.

**Functional Dependencies:**
```
Contact_ID → Driver_ID, Contact_Number, Contact_Type
(Driver_ID, Contact_Number) → Contact_ID, Contact_Type  (natural composite key)
```

| Normal Form | Satisfied? | Reason |
|-------------|------------|--------|
| **1NF**     | ✅ Yes     | Multivalued attribute resolved into individual rows. All attributes are atomic. |
| **2NF**     | ✅ Yes     | Using `Contact_ID` as surrogate PK ensures all non-key attributes depend on the whole key. |
| **3NF**     | ✅ Yes     | No transitive dependencies. `Contact_Type` describes the contact number, not the driver directly. |

**Highest Normal Form: 3NF**

---

## Table 5: `Vehicle`

**Schema:**
```
Vehicle(Vehicle_ID, Driver_ID, License_Plate, Vehicle_Model, Fuel_Type)
```

**Functional Dependencies:**
```
Vehicle_ID    → Driver_ID, License_Plate, Vehicle_Model, Fuel_Type
License_Plate → Vehicle_ID, Driver_ID, Vehicle_Model, Fuel_Type  (alternate key)
```

| Normal Form | Satisfied? | Reason |
|-------------|------------|--------|
| **1NF**     | ✅ Yes     | All attributes are atomic. `Vehicle_Model` and `Fuel_Type` are simple single-valued attributes. |
| **2NF**     | ✅ Yes     | Single-attribute PK (`Vehicle_ID`); every non-key attribute fully depends on it. |
| **3NF**     | ✅ Yes     | No non-key attribute determines another non-key attribute. `Vehicle_Model` does not determine `Fuel_Type` (same model can have multiple fuel variants). |

**Highest Normal Form: 3NF (also BCNF)**

---

## Table 6: `Parking_Session`

**Schema:**
```
Parking_Session(Session_ID, Vehicle_ID, Slot_ID, Entry_Time, Exit_Time)
```

> Note: `Total_Duration` and `Total_Bill` are **derived attributes** and are not stored as columns. They are computed via SQL expressions:
> - `Total_Duration = Exit_Time − Entry_Time`
> - `Total_Bill = Total_Duration (in hours) × Slot_Rate` (joined from Parking_Zone via Parking_Slot)

**Functional Dependencies:**
```
Session_ID → Vehicle_ID, Slot_ID, Entry_Time, Exit_Time
```

| Normal Form | Satisfied? | Reason |
|-------------|------------|--------|
| **1NF**     | ✅ Yes     | All attributes are atomic. Derived attributes excluded from storage. |
| **2NF**     | ✅ Yes     | Single-attribute PK (`Session_ID`); all non-key attributes fully depend on it. |
| **3NF**     | ✅ Yes     | `Vehicle_ID` and `Slot_ID` are foreign keys and do not transitively determine `Entry_Time` or `Exit_Time` within this relation. |

**Highest Normal Form: 3NF**

---

## Table 7: `Payment`

**Schema:**
```
Payment(Payment_ID, Session_ID, Amount, Payment_Method, Payment_Status, Payment_Time)
```

**Functional Dependencies:**
```
Payment_ID → Session_ID, Amount, Payment_Method, Payment_Status, Payment_Time
Session_ID → Payment_ID, Amount, Payment_Method, Payment_Status, Payment_Time  (alternate key — 1:1 relationship)
```

| Normal Form | Satisfied? | Reason |
|-------------|------------|--------|
| **1NF**     | ✅ Yes     | All attributes are atomic. `Payment_Method` and `Payment_Status` are single-valued enumerations. |
| **2NF**     | ✅ Yes     | Single-attribute PK (`Payment_ID`); all non-key attributes fully depend on it. |
| **3NF**     | ✅ Yes     | No transitive dependencies. `Payment_Status` does not determine `Amount`; `Payment_Method` does not determine any other attribute. |

**Highest Normal Form: 3NF (also BCNF)**

---

## Summary Table

| Relation          | 1NF | 2NF | 3NF | Highest Normal Form |
|-------------------|-----|-----|-----|---------------------|
| `Parking_Zone`    | ✅  | ✅  | ✅  | 3NF / BCNF          |
| `Parking_Slot`    | ✅  | ✅  | ✅  | 3NF                 |
| `Driver`          | ✅  | ✅  | ✅  | 3NF / BCNF          |
| `Driver_Contact`  | ✅  | ✅  | ✅  | 3NF                 |
| `Vehicle`         | ✅  | ✅  | ✅  | 3NF / BCNF          |
| `Parking_Session` | ✅  | ✅  | ✅  | 3NF                 |
| `Payment`         | ✅  | ✅  | ✅  | 3NF / BCNF          |

---

## Key Normalization Decisions

1. **Composite attribute decomposition**: `Zone_Location` → `Street`, `City`, `Zip_Code` and `Driver_Name` → `First_Name`, `Last_Name` ensure 1NF compliance.
2. **Multivalued attribute extraction**: `Contact_Numbers` extracted into a separate `Driver_Contact` table to achieve 1NF.
3. **Derived attributes excluded**: `Total_Duration` and `Total_Bill` are computed on query, not stored, eliminating update anomalies.
4. **Surrogate keys**: Each table uses a surrogate integer primary key, ensuring single-column PKs and preventing partial dependencies (2NF guaranteed by design).
5. **Foreign keys preserve referential integrity** without introducing transitive dependencies within any single table.

---

## Table 1: `Parking_Zone`

**Schema:**
```
Parking_Zone(Zone_ID, Zone_Name, Street, City, Zip_Code, Slot_Rate, Zone_Capacity)
```

> Note: The composite attribute `Zone_Location` is decomposed into atomic columns `Street`, `City`, and `Zip_Code`.

**Functional Dependencies:**
```
Zone_ID → Zone_Name, Street, City, Zip_Code, Slot_Rate, Zone_Capacity
```

| Normal Form | Satisfied? | Reason |
|-------------|------------|--------|
| **1NF**     | ✅ Yes     | All attributes are atomic (composite `Zone_Location` decomposed). No repeating groups. |
| **2NF**     | ✅ Yes     | Primary key is a single attribute (`Zone_ID`), so partial dependency cannot exist. Every non-key attribute is fully dependent on `Zone_ID`. |
| **3NF**     | ✅ Yes     | No non-key attribute determines another non-key attribute. There are no transitive dependencies. |

**Highest Normal Form: 3NF (also BCNF, since the only determinant is the primary key)**

---

## Table 2: `Parking_Slot`

**Schema:**
```
Parking_Slot(Slot_ID, Zone_ID, Slot_Number, Slot_Type, Slot_Status)
```

**Functional Dependencies:**
```
Slot_ID → Zone_ID, Slot_Number, Slot_Type, Slot_Status
Zone_ID → (references Parking_Zone; not a FD within this table)
```

| Normal Form | Satisfied? | Reason |
|-------------|------------|--------|
| **1NF**     | ✅ Yes     | All attributes are atomic. No repeating groups or multi-valued cells. |
| **2NF**     | ✅ Yes     | Single-attribute primary key (`Slot_ID`); every non-key attribute depends on the whole key. |
| **3NF**     | ✅ Yes     | `Zone_ID` is a foreign key, not a determinant of other non-key attributes within this table. No transitive dependencies exist. |

**Highest Normal Form: 3NF**

---

## Table 3: `Driver`

**Schema:**
```
Driver(Driver_ID, First_Name, Last_Name, Email, License_Number)
```

> Note: The composite attribute `Driver_Name` is decomposed into `First_Name` and `Last_Name`. The multivalued attribute `Contact_Numbers` is placed in a separate `Driver_Contact` table.

**Functional Dependencies:**
```
Driver_ID → First_Name, Last_Name, Email, License_Number
Email     → Driver_ID, First_Name, Last_Name, License_Number  (alternate key)
License_Number → Driver_ID, First_Name, Last_Name, Email      (alternate key)
```

| Normal Form | Satisfied? | Reason |
|-------------|------------|--------|
| **1NF**     | ✅ Yes     | `Driver_Name` decomposed into atomic `First_Name` and `Last_Name`. `Contact_Numbers` moved out. All cells are single-valued. |
| **2NF**     | ✅ Yes     | Primary key `Driver_ID` is single-attribute; all non-key attributes are fully functionally dependent on it. |
| **3NF**     | ✅ Yes     | No non-key attribute transitively depends on another non-key attribute. (`Email` and `License_Number` are alternate keys, not transitive dependencies.) |

**Highest Normal Form: 3NF (also BCNF)**

---

## Table 4: `Driver_Contact`

**Schema:**
```
Driver_Contact(Contact_ID, Driver_ID, Contact_Number, Contact_Type)
```

> Separate table to handle the multivalued `Contact_Numbers` attribute of Driver.

**Functional Dependencies:**
```
Contact_ID → Driver_ID, Contact_Number, Contact_Type
(Driver_ID, Contact_Number) → Contact_ID, Contact_Type  (natural composite key)
```

| Normal Form | Satisfied? | Reason |
|-------------|------------|--------|
| **1NF**     | ✅ Yes     | Multivalued attribute resolved into individual rows. All attributes are atomic. |
| **2NF**     | ✅ Yes     | Using `Contact_ID` as surrogate PK ensures all non-key attributes depend on the whole key. |
| **3NF**     | ✅ Yes     | No transitive dependencies. `Contact_Type` describes the contact number, not the driver directly. |

**Highest Normal Form: 3NF**

---

## Table 5: `Vehicle`

**Schema:**
```
Vehicle(Vehicle_ID, Driver_ID, License_Plate, Vehicle_Model, Fuel_Type)
```

**Functional Dependencies:**
```
Vehicle_ID    → Driver_ID, License_Plate, Vehicle_Model, Fuel_Type
License_Plate → Vehicle_ID, Driver_ID, Vehicle_Model, Fuel_Type  (alternate key)
```

| Normal Form | Satisfied? | Reason |
|-------------|------------|--------|
| **1NF**     | ✅ Yes     | All attributes are atomic. `Vehicle_Model` and `Fuel_Type` are simple single-valued attributes. |
| **2NF**     | ✅ Yes     | Single-attribute PK (`Vehicle_ID`); every non-key attribute fully depends on it. |
| **3NF**     | ✅ Yes     | No non-key attribute determines another non-key attribute. `Vehicle_Model` does not determine `Fuel_Type` (same model can have multiple fuel variants). |

**Highest Normal Form: 3NF (also BCNF)**

---

## Table 6: `Parking_Session`

**Schema:**
```
Parking_Session(Session_ID, Vehicle_ID, Slot_ID, Entry_Time, Exit_Time)
```

> Note: `Total_Duration` and `Total_Bill` are **derived attributes** and are not stored as columns. They are computed via SQL expressions:
> - `Total_Duration = Exit_Time − Entry_Time`
> - `Total_Bill = Total_Duration (in hours) × Slot_Rate` (joined from Parking_Zone via Parking_Slot)

**Functional Dependencies:**
```
Session_ID → Vehicle_ID, Slot_ID, Entry_Time, Exit_Time
```

| Normal Form | Satisfied? | Reason |
|-------------|------------|--------|
| **1NF**     | ✅ Yes     | All attributes are atomic. Derived attributes excluded from storage. |
| **2NF**     | ✅ Yes     | Single-attribute PK (`Session_ID`); all non-key attributes fully depend on it. |
| **3NF**     | ✅ Yes     | `Vehicle_ID` and `Slot_ID` are foreign keys and do not transitively determine `Entry_Time` or `Exit_Time` within this relation. |

**Highest Normal Form: 3NF**

---

## Table 7: `Payment`

**Schema:**
```
Payment(Payment_ID, Session_ID, Amount, Payment_Method, Payment_Status, Payment_Time)
```

**Functional Dependencies:**
```
Payment_ID → Session_ID, Amount, Payment_Method, Payment_Status, Payment_Time
Session_ID → Payment_ID, Amount, Payment_Method, Payment_Status, Payment_Time  (alternate key — 1:1 relationship)
```

| Normal Form | Satisfied? | Reason |
|-------------|------------|--------|
| **1NF**     | ✅ Yes     | All attributes are atomic. `Payment_Method` and `Payment_Status` are single-valued enumerations. |
| **2NF**     | ✅ Yes     | Single-attribute PK (`Payment_ID`); all non-key attributes fully depend on it. |
| **3NF**     | ✅ Yes     | No transitive dependencies. `Payment_Status` does not determine `Amount`; `Payment_Method` does not determine any other attribute. |

**Highest Normal Form: 3NF (also BCNF)**

---

## Summary Table

| Relation          | 1NF | 2NF | 3NF | Highest Normal Form |
|-------------------|-----|-----|-----|---------------------|
| `Parking_Zone`    | ✅  | ✅  | ✅  | 3NF / BCNF          |
| `Parking_Slot`    | ✅  | ✅  | ✅  | 3NF                 |
| `Driver`          | ✅  | ✅  | ✅  | 3NF / BCNF          |
| `Driver_Contact`  | ✅  | ✅  | ✅  | 3NF                 |
| `Vehicle`         | ✅  | ✅  | ✅  | 3NF / BCNF          |
| `Parking_Session` | ✅  | ✅  | ✅  | 3NF                 |
| `Payment`         | ✅  | ✅  | ✅  | 3NF / BCNF          |

---

## Key Normalization Decisions

1. **Composite attribute decomposition**: `Zone_Location` → `Street`, `City`, `Zip_Code` and `Driver_Name` → `First_Name`, `Last_Name` ensure 1NF compliance.
2. **Multivalued attribute extraction**: `Contact_Numbers` extracted into a separate `Driver_Contact` table to achieve 1NF.
3. **Derived attributes excluded**: `Total_Duration` and `Total_Bill` are computed on query, not stored, eliminating update anomalies.
4. **Surrogate keys**: Each table uses a surrogate integer primary key, ensuring single-column PKs and preventing partial dependencies (2NF guaranteed by design).
5. **Foreign keys preserve referential integrity** without introducing transitive dependencies within any single table.
