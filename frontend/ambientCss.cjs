const fs = require('fs');

const css = `
/* Replaces inline styles across standard JSX pages */
.form-input {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-main);
}
.form-input.w-100 { width: 100%; }
.form-input.flex-1 { flex: 1; }
.form-input.min-w-150 { min-width: 150px; }

.form-input-alt {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.form-input-alt.flex-1 { flex: 1; }

.form-row { display: flex; gap: 10px; align-items: center; }
.form-row.flex-wrap { flex-wrap: wrap; }

.btn-primary.px-4, .btn-success.px-4 {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  color: var(--surface);
}
.btn-primary.px-4 { background: var(--primary); }
.btn-success.px-4 { background: var(--success); }

.mb-20 { margin-bottom: 20px; }
.mb-1-flex-gap-1 { margin-bottom: 1rem; display: flex; gap: 1rem; }

.text-success { color: var(--success) !important; }
.text-danger { color: var(--danger) !important; }
.text-warning { color: var(--warning) !important; }
.text-muted { color: var(--text-muted) !important; }
.text-gray-light { color: #78909c !important; }

.mr-4 { margin-right: 4px; }
.rel-inline-block { position: relative; display: inline-block; }

.text-center-p-1-5 { text-align: center; color: #546e7a; padding: 1.5rem; }
.text-right { text-align: right; }
`;

fs.appendFileSync('./src/index.css', css, 'utf-8');
console.log("Appended successfully");