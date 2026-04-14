const fs = require('fs');

const css = `
/* Layout Utilities */
.flex-between-center { display: flex; justify-content: space-between; align-items: center; }
.flex-center-gap-4 { display: flex; align-items: center; gap: 4px; }
.flex-gap-8 { display: flex; gap: 8px; }
.flex-gap-10 { display: flex; gap: 10px; }

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: var(--surface);
  width: 400px;
  padding: 20px;
}
.modal-form-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
`;

fs.appendFileSync('./src/index.css', css, 'utf-8');
console.log("Appended successfully pt2");