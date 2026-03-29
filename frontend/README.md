# Urban Smart Parking System — Frontend

A React + Vite single-page application providing a UI for the **Urban Smart Parking System (USPS)**.

## Features

- **Dashboard** — live summary stats and zone availability bars
- **Zones** — card view of all parking zones with slot counts and hourly rates
- **Slots** — filterable table of individual parking slots with status badges
- **Sessions** — full session log (entry/exit times, duration, amount due)
- **Payments** — payment records with totals summary
- Client-side routing via **React Router**
- Static mock data layer (`src/data/mockData.js`) ready to swap for a real API

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later (LTS recommended)

## Quick Start

```bash
# from the repository root
cd frontend

npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the Vite development server (HMR enabled) |
| `npm run build` | Produce a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Project Structure

```
frontend/
├── public/          # Static assets served as-is
├── src/
│   ├── components/
│   │   ├── Navbar.jsx       # Sticky top navigation bar
│   │   └── Navbar.css
│   ├── data/
│   │   └── mockData.js      # Static mock data (zones, slots, sessions, payments)
│   ├── pages/
│   │   ├── Dashboard.jsx    # Overview stats + zone bars
│   │   ├── Zones.jsx        # Zone cards
│   │   ├── Slots.jsx        # Filterable slot table
│   │   ├── Sessions.jsx     # Session log table
│   │   └── Payments.jsx     # Payment records table
│   ├── App.jsx              # Root component + React Router setup
│   ├── App.css
│   └── index.css            # Global dark theme
├── index.html
├── vite.config.js
└── package.json
```

## Connecting to a Real Backend

Replace the static exports in `src/data/mockData.js` with `fetch` / `axios` calls to your REST or GraphQL API. No other changes are needed — components already reference the same data shapes.
