const fs = require('fs');

const indexCss = `
:root {
  --background: #000000;
  --surface: #111111;
  --border: #333333;
  --text-main: #ffffff;
  --text-muted: #999999;
  
  --primary: #ffb703;
  --primary-glow: rgba(255, 183, 3, 0.4);
  --primary-fg: #3e2700;
  
  --accent: #ffc300;
  --accent-glow: rgba(255, 195, 0, 0.4);
  --accent-fg: #4a3300;
  
  --success: #34d399;
  --success-glow: rgba(52, 211, 153, 0.3);
  --success-fg: #064e3b;
  
  --warning: #fbbf24;
  --warning-glow: rgba(251, 191, 36, 0.3);
  
  --danger: #f87171;
  --danger-glow: rgba(248, 113, 113, 0.3);
  --danger-fg: #450a0a;
  
  --radius: 0.75rem;
  
  --ambient-shadow: 0 0 20px -5px rgba(255, 255, 255, 0.05);
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--background);
  color: var(--text-main);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-size: 15px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4 {
  line-height: 1.3;
  font-weight: 600;
  color: var(--text-main);
}

a {
  color: var(--primary);
  text-decoration: none;
  transition: all 0.3s ease;
}

a:hover {
  text-shadow: 0 0 8px var(--primary-glow);
}

button {
  cursor: pointer;
  transition: all 0.3s ease;
}

button:not(.logout-btn):not(.slot-tile):not([style*="var(--danger)"]):not([style*="var(--success)"]):hover:not(:disabled) {
  background-color: var(--primary) !important;
  color: var(--primary-fg) !important;
  box-shadow: 0 0 15px var(--primary-glow) !important;
}

button[style*="var(--danger)"]:hover:not(:disabled) {
  background-color: var(--danger) !important;
  color: var(--background) !important;
  box-shadow: 0 0 15px var(--danger-glow) !important;
}

button[style*="var(--success)"]:hover:not(:disabled) {
  background-color: var(--success) !important;
  color: var(--background) !important;
  box-shadow: 0 0 15px var(--success-glow) !important;
}

@keyframes spin-wheel {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

const appCss = `
main {
  min-height: calc(100vh - 70px);
}
`;

const dashboardCss = `
.page {
  padding: 2.5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, #fff, #a1a1aa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-subtitle {
  color: var(--text-muted);
  margin-bottom: 3rem;
  font-size: 1.05rem;
}

/* Stat cards */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 4px; height: 100%;
  background: var(--accent);
  opacity: 0.5;
  transition: opacity 0.3s;
}

.stat-card:hover {
  transform: translateY(-3px);
  border-color: var(--accent);
  box-shadow: var(--ambient-shadow);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-icon {
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-main);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.2rem;
}

/* Panels */
.dashboard-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .dashboard-panels {
    grid-template-columns: 1fr;
  }
}

.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.75rem;
  
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.panel:hover {
  box-shadow: var(--ambient-shadow);
}

.panel-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-main);
}

/* Zone bars */
.zone-bar-row {
  margin-bottom: 1.5rem;
}

.zone-bar-row:last-child {
  margin-bottom: 0;
}

.zone-bar-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 0.6rem;
}

.zone-bar-pct {
  color: var(--text-muted);
  font-size: 0.85rem;
  font-family: monospace;
}

.zone-bar-track {
  background: var(--background);
  border-radius: 0.5rem;
  height: 10px;
  overflow: hidden;
  border: 1px solid var(--border);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
}

.zone-bar-fill {
  height: 100%;
  border-radius: 0.5rem;
  transition: width 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 10px currentColor; /* Glow effect */
}

/* Mini table */
.mini-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.mini-table th {
  text-align: left;
  color: var(--text-muted);
  font-weight: 500;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
}

.mini-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.mini-table tbody tr {
  transition: background 0.2s;
}
.mini-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

.mini-table tbody tr:last-child td {
  border-bottom: none;
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid transparent;
}

.badge-active {
  background: rgba(52, 211, 153, 0.1);
  color: var(--success);
  border-color: rgba(52, 211, 153, 0.2);
}

.badge-done {
  background: rgba(161, 161, 170, 0.1);
  color: var(--text-muted);
  border-color: var(--border);
}

.badge-pending {
  background: rgba(251, 191, 36, 0.1);
  color: var(--warning);
  border-color: rgba(251, 191, 36, 0.2);
}

.badge-paid {
  background: rgba(52, 211, 153, 0.1);
  color: var(--success);
  border-color: rgba(52, 211, 153, 0.2);
  
}

.badge-available {
  background: rgba(52, 211, 153, 0.1);
  color: var(--success);
  border-color: rgba(52, 211, 153, 0.2);
  
}

.badge-occupied {
  background: rgba(248, 113, 113, 0.1);
  color: var(--danger);
  border-color: rgba(248, 113, 113, 0.2);
  
}

@media (max-width: 768px) {
  .page {
    padding: 1.5rem 1rem;
  }
  .stat-grid {
    grid-template-columns: 1fr;
  }
}
`;

const navbarCss = `
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(24, 24, 27, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  padding: 0 2.5rem;
  height: 70px;
  position: sticky;
  top: 0;
  z-index: 100;
  gap: 1.5rem;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  color: var(--primary);
  text-shadow: 0 0 20px var(--primary-glow);
  transition: transform 0.3s ease;
}

.navbar-brand:hover {
  animation: spin-wheel 0.5s linear infinite;
}

.brand-icon {
  display: flex;
  align-items: center;
}

.brand-title {
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--text-main);
}

.navbar-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 0;
  flex: 1;
  margin-left: 2rem;
}

.navbar-links a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  margin: 0;
  color: var(--text-muted);
  font-size: 0.95rem;
  font-weight: 600;
  border-bottom: 4px solid transparent;
  transform: translateY(0);
  transition: border-bottom-color 0.2s ease, transform 0.1s ease, border-bottom-width 0.1s ease, color 0.2s ease;
}

.navbar-links a:hover {
  color: var(--text-main);
  border-bottom: 4px solid rgba(255, 255, 255, 0.1);
  transform: translateY(2px);
}

.navbar-links a.active {
  color: var(--primary);
  border-bottom: 4px solid var(--primary);
  transform: translateY(3px);
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-shrink: 0;
}

.navbar-username {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: var(--text-main);
  font-weight: 500;
}

.role-badge {
  display: inline-block;
  padding: 0.25rem 0.7rem;
  border-radius: 0.5rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border: 1px solid transparent;
}

.role-admin {
  background: rgba(139, 92, 246, 0.15);
  color: #c4b5fd;
  border-color: rgba(139, 92, 246, 0.3);
  
}

.role-customer {
  background: rgba(52, 211, 153, 0.15);
  color: #6ee7b7;
  border-color: rgba(52, 211, 153, 0.3);
  
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.2rem;
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover {
  color: var(--danger);
  border-color: rgba(248, 113, 113, 0.5);
  background: rgba(248, 113, 113, 0.1);
  box-shadow: 0 0 15px var(--danger-glow);
}

@media (max-width: 768px) {
  .navbar {
    padding: 1rem;
    height: auto;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 1rem;
  }
  .navbar-links {
    margin-left: 0;
    width: 100%;
    order: 3;
    overflow-x: auto;
    justify-content: flex-start;
    padding-bottom: 0.5rem;
  }
  .navbar-user {
    order: 2;
  }
}
`;

const loginCss = `
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background);
  background-image: 
    radial-gradient(circle at 15% 50%, rgba(56, 189, 248, 0.08), transparent 25%),
    radial-gradient(circle at 85% 30%, rgba(139, 92, 246, 0.08), transparent 25%);
  padding: 1rem;
}

.login-card {
  background: rgba(24, 24, 27, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 1.25rem;
  padding: 3.5rem 3rem;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05);
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, var(--primary), transparent);
  opacity: 0.5;
}

.login-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
  color: var(--primary);
  text-shadow: 0 0 20px var(--primary-glow);
  transition: transform 0.3s ease;
}

.login-brand:hover {
  animation: spin-wheel 0.5s linear infinite;
}

.login-brand-icon {
  display: flex;
  align-items: center;
}

.login-brand-title {
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--text-main);
  text-shadow: none;
}

.login-heading {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-align: center;
  color: var(--text-main);
}

.login-sub {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin-bottom: 2.5rem;
  text-align: center;
}

.login-alert {
  padding: 0.85rem 1rem;
  border-radius: var(--radius);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.login-alert-error {
  background: rgba(248, 113, 113, 0.1);
  color: var(--danger);
  border: 1px solid rgba(248, 113, 113, 0.2);
  box-shadow: 0 0 15px var(--danger-glow);
}

.login-alert-success {
  background: rgba(52, 211, 153, 0.1);
  color: var(--success);
  border: 1px solid rgba(52, 211, 153, 0.2);
  box-shadow: 0 0 15px var(--success-glow);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.login-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.login-field label {
  font-size: 0.9rem;
  color: var(--text-main);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.login-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.login-input-icon {
  position: absolute;
  left: 1rem;
  color: var(--text-muted);
}

.login-field input {
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 2.8rem;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.2);
  color: var(--text-main);
  font-size: 1rem;
  outline: none;
  transition: all 0.3s;
}

.login-field input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 1px var(--primary), 0 0 15px var(--primary-glow);
  background: rgba(0, 0, 0, 0.4);
}

.login-field input:focus + .login-input-icon {
  color: var(--primary);
}

.login-btn {
  margin-top: 0.5rem;
  padding: 0.9rem;
  background: var(--primary);
  color: var(--primary-fg);
  border: none;
  border-radius: var(--radius);
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 20px var(--primary-glow);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.login-btn:hover:not(:disabled) {
  background: #7dd3fc;
  box-shadow: 0 0 30px rgba(56, 189, 248, 0.5);
}

.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.login-toggle {
  text-align: center;
  margin-top: 1.5rem;
}

.login-link-btn {
  background: none;
  border: none;
  color: var(--primary);
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  padding: 0;
  transition: all 0.3s;
}

.login-link-btn:hover {
  text-shadow: 0 0 10px var(--primary-glow);
  color: #7dd3fc;
}

.login-demo {
  margin-top: 2.5rem;
  padding: 1.25rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.login-demo-label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.75rem;
  font-weight: 700;
}

.login-demo-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--text-main);
  margin-bottom: 0.6rem;
  font-family: monospace;
}

.login-demo-role {
  padding: 0.2rem 0.6rem;
  border-radius: 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;
  border: 1px solid transparent;
}

@media (max-width: 768px) {
  .login-card {
    padding: 2.5rem 1.5rem;
  }
}
`;

const slotsCss = `
.slots-filters {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: center;
  background: var(--surface);
  padding: 1.25rem 1.5rem;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  
}

.slots-filters label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-main);
  font-weight: 500;
  font-size: 0.95rem;
}

.slots-filters select {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border);
  color: var(--text-main);
  border-radius: 0.5rem;
  padding: 0.6rem 2.5rem 0.6rem 1rem;
  font-size: 0.95rem;
  cursor: pointer;
  outline: none;
  transition: all 0.3s;
  appearance: none;
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23a1a1aa%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: right 1rem top 50%;
  background-size: 0.6rem auto;
}

.slots-filters select option {
  background: var(--surface);
  color: var(--text-main);
}

.slots-filters select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 1px var(--primary), 0 0 15px var(--primary-glow);
}

.slots-table-wrap {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.data-table th {
  text-align: left;
  color: var(--text-muted);
  font-weight: 600;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.2);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.data-table td {
  padding: 1.25rem 1.5rem;
  color: var(--text-main);
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.data-table tbody tr {
  transition: background 0.2s;
}

.data-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.no-data {
  text-align: center;
  color: var(--text-muted);
  padding: 4rem 2rem !important;
  font-size: 1.1rem;
}

.slot-map-wrap {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 2.5rem;
  margin-bottom: 2rem;
  
}

.slot-map-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-bottom: 2rem;
  font-size: 0.95rem;
  color: var(--text-main);
  font-weight: 500;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.slot-legend-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.slot-legend-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.slot-legend-available  { background: var(--success);  }
.slot-legend-occupied   { background: var(--danger);  }
.slot-legend-selected   { background: var(--primary);  }

.slot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(85px, 1fr));
  gap: 16px;
}

.slot-tile {
  aspect-ratio: 1;
  border-radius: 0.75rem;
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.slot-tile::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.slot-tile:hover::after {
  opacity: 1;
}

.slot-tile:focus { outline: none; }

.slot-tile--available {
  border-color: rgba(52, 211, 153, 0.3);
  color: var(--success);
}

.slot-tile--available:hover:not(:disabled) {
  border-color: var(--success);
  box-shadow: 0 8px 20px -5px var(--success-glow);
  background: rgba(52, 211, 153, 0.1);
}

.slot-tile--occupied {
  border-color: rgba(248, 113, 113, 0.2);
  background: rgba(248, 113, 113, 0.05);
  color: var(--danger);
  cursor: not-allowed;
  opacity: 0.7;
}

.slot-tile--selected {
  border-color: var(--primary);
  background: rgba(56, 189, 248, 0.15);
  color: var(--primary);
  box-shadow: inset 0 0 0 1px var(--primary), 0 0 20px var(--primary-glow);
  transform: translateY(-4px);
}

.slot-tile-icon {
  font-size: 1.6rem;
  line-height: 1;
  display: flex;
  align-items: center;
}

.slot-tile-number {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.slot-selection-info {
  margin-top: 2rem;
  font-size: 1rem;
  color: var(--primary);
  padding: 1.25rem 1.5rem;
  background: rgba(56, 189, 248, 0.1);
  border-radius: var(--radius);
  border: 1px solid rgba(56, 189, 248, 0.2);
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  box-shadow: 0 0 20px var(--primary-glow);
}

@media (max-width: 768px) {
  .slots-filters {
    flex-direction: column;
    align-items: stretch;
  }
  .slots-filters label {
    flex-direction: column;
    align-items: flex-start;
  }
  .slots-filters select {
    width: 100%;
  }
  .slots-table-wrap {
    overflow-x: auto;
  }
  .slot-grid {
    grid-template-columns: repeat(auto-fill, minmax(65px, 1fr));
    gap: 12px;
  }
}
`;

const zonesCss = `
.zones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 2rem;
}

.zone-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 1rem;
  padding: 2rem;
  
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  position: relative;
  overflow: hidden;
}

.zone-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 35px -10px rgba(0,0,0,0.5);
}

.zone-card-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.zone-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.zone-location {
  font-size: 0.95rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.zone-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.zone-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.zone-stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.25rem;
  line-height: 1;
}

.zone-stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@media (max-width: 768px) {
  .zones-grid {
    grid-template-columns: 1fr;
  }
}
`;

const paymentsCss = `
.payments-summary {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
}

.pay-stat {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.75rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 220px;
  
  position: relative;
  overflow: hidden;
}

.pay-stat::before {
  content: '';
  position: absolute;
  top: 0; right: 0; width: 100px; height: 100px;
  background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(30%, -30%);
}

.pay-stat-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 600;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pay-stat-value {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.02em;
}

@media (max-width: 768px) {
  .pay-stats {
    flex-direction: column;
    align-items: stretch;
  }
  .data-table-wrap {
    overflow-x: auto;
  }
}
`;

function writeIfDifferent(filePath, content) {
  fs.writeFileSync(filePath, content);
}

writeIfDifferent('frontend/src/index.css', indexCss);
writeIfDifferent('frontend/src/App.css', appCss);
writeIfDifferent('frontend/src/pages/Dashboard.css', dashboardCss);
writeIfDifferent('frontend/src/components/Navbar.css', navbarCss);
writeIfDifferent('frontend/src/pages/Login.css', loginCss);
writeIfDifferent('frontend/src/pages/Slots.css', slotsCss);
writeIfDifferent('frontend/src/pages/Zones.css', zonesCss);
writeIfDifferent('frontend/src/pages/Payments.css', paymentsCss);

console.log('Dark Ambient CSS updated successfully');
