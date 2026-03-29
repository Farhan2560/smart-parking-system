# Urban Smart Parking System — Frontend

A React + Vite single-page application providing a UI for the **Urban Smart Parking System (USPS)**.

## Features

- **Dashboard** — live summary stats and zone availability bars
- **Zones** — card view of all parking zones with slot counts and hourly rates
- **Slots** — filterable table of individual parking slots with status badges
- **Sessions** — full session log with start/end actions
- **Payments** — payment records with totals summary
- Client-side routing via **React Router**
- Live data via `src/data/useData.js` with refresh support

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
│   │   └── useData.js       # API data hook (fetch + refresh)
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

The app uses a built-in hook (`useData`) that calls `/api/*` endpoints. In development, Vite proxies `/api` to `http://localhost:5000` (see `vite.config.js`).
