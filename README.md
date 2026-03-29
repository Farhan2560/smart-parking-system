# Urban Smart Parking System (USPS)

## Problem Statement

Urban areas face a growing challenge of inefficient parking management, leading to traffic congestion, fuel wastage, and driver frustration. The **Urban Smart Parking System (USPS)** is a smart-city application designed to manage parking zones, slots, drivers, vehicles, parking sessions, and payments in a unified database-driven platform.

### Goals

- Provide **real-time slot availability** across multiple parking zones.
- Enable **driver and vehicle registration** with contact details.
- Track **parking sessions** (entry/exit) and compute duration and billing automatically.
- Process **payments** tied to each session.
- Support both **relational (SQL)** and **NoSQL (MongoDB)** storage strategies.

---

## Project Structure

```
smart-parking-system/
├── README.md                      # This file — project overview & problem statement
├── frontend/                      # React + Vite frontend application
│   ├── src/
│   │   ├── components/            # Shared UI components (Navbar)
│   │   ├── data/mockData.js       # Static mock data layer
│   │   └── pages/                 # Dashboard, Zones, Slots, Sessions, Payments
│   ├── package.json
│   └── README.md                  # Frontend setup & usage instructions
├── docs/
│   ├── er_diagram.md              # Conceptual ER design (entities, attributes, relationships)
│   └── normalization_report.md    # 3NF normalization analysis for each relation
├── sql/
│   ├── schema.sql                 # Relational schema — DDL with PKs, FKs, constraints
│   ├── sample_data.sql            # Sample INSERT statements for all tables
│   └── queries.sql                # Useful SQL queries (derived attributes, reports)
└── mongodb/
    ├── schema.md                  # MongoDB document schema design (embedding vs referencing)
    └── crud_examples.js           # CRUD operation examples in MongoDB shell syntax
```

---

## Entities Overview

| Entity            | Description                                               |
|-------------------|-----------------------------------------------------------|
| `Parking_Zone`    | A geographic zone containing many parking slots           |
| `Parking_Slot`    | An individual parking space within a zone                 |
| `Driver`          | A registered user who parks vehicles                      |
| `Vehicle`         | A vehicle owned by a driver                               |
| `Parking_Session` | Records a vehicle occupying a slot (M:N resolution table) |
| `Payment`         | Payment record tied to a parking session                  |

---

## Quick Start

### Frontend (React + Vite)

> Requires [Node.js](https://nodejs.org/) v18+

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser. See [`frontend/README.md`](frontend/README.md) for full details.

### SQL (PostgreSQL / MySQL)

```bash
# Create schema
psql -U postgres -d usps_db -f sql/schema.sql

# Load sample data
psql -U postgres -d usps_db -f sql/sample_data.sql

# Run example queries
psql -U postgres -d usps_db -f sql/queries.sql
```

### MongoDB

```bash
# Open MongoDB shell and run CRUD examples
mongosh usps_db --file mongodb/crud_examples.js
```

---

## Documentation

- **[ER Diagram & Conceptual Design](docs/er_diagram.md)** — Entity attributes, composite/multivalued/derived attributes, and relationships.
- **[Normalization Report](docs/normalization_report.md)** — Functional dependencies and 1NF → 3NF analysis per table.
- **[MongoDB Schema Design](mongodb/schema.md)** — Document model with embedding vs. referencing rationale.
