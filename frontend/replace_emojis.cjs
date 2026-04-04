const fs = require('fs');
const path = require('path');

const replacer = (filePath, updates) => {
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;
  for (const update of updates) {
    if (typeof update.find === 'string') {
      content = content.split(update.find).join(update.replace);
    } else {
      content = content.replace(update.find, update.replace);
    }
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${path.basename(filePath)}`);
  }
};

const src = path.join(__dirname, 'src');
const pages = path.join(src, 'pages');

// CustomerDashboard.jsx
replacer(path.join(pages, 'CustomerDashboard.jsx'), [
  { find: /import \{ useData \} from "\.\.\/data\/useData";/g, replace: 'import { useData } from "../data/useData";\nimport { Map, CheckCircle2, Clock, Flag, Car } from "lucide-react";' },
  { find: /"🗺️"/g, replace: '<Map size={24} />' },
  { find: /"✅"/g, replace: '<CheckCircle2 size={24} />' },
  { find: /"⏱️"/g, replace: '<Clock size={24} />' },
  { find: /"🏁"/g, replace: '<Flag size={24} />' },
  { find: / 👋/g, replace: '' },
  { find: /🚗 You Have an Active Session/g, replace: '<Car size={24} style={{ marginRight: "8px", verticalAlign: "middle" }}/> You Have an Active Session' },
  { find: /—/g, replace: '-' } // replace em dash 
]);

// CustomerSessions.jsx
replacer(path.join(pages, 'CustomerSessions.jsx'), [
  { find: /import \{ useAuth \} from "\.\.\/context\/AuthContext";/g, replace: 'import { useAuth } from "../context/AuthContext";\nimport { Car, Accessibility, Zap, Info } from "lucide-react";' },
  { find: /"🚗"/g, replace: '<Car size={16} />' },
  { find: /"♿"/g, replace: '<Accessibility size={16} />' },
  { find: /"⚡"/g, replace: '<Zap size={16} />' },
  { find: />🚗 Standard/g, replace: '><Car size={16} style={{marginRight: "4px"}}/> Standard' },
  { find: />♿ Handicapped/g, replace: '><Accessibility size={16} style={{marginRight: "4px"}}/> Handicapped' },
  { find: />⚡ EV Charging/g, replace: '><Zap size={16} style={{marginRight: "4px"}}/> EV Charging' },
  { find: /ℹ️ You/g, replace: '<Info size={16} style={{marginRight: "4px", verticalAlign: "middle"}}/> You' },
  { find: /—/g, replace: '-' } // replace em dash
]);

// Login.jsx
replacer(path.join(pages, 'Login.jsx'), [
  { find: /import \{ useAuth \} from "\.\.\/context\/AuthContext";/g, replace: 'import { useAuth } from "../context/AuthContext";\nimport { CarFront } from "lucide-react";' },
  { find: /<span className="login-brand-icon">🅿️<\/span>/g, replace: '<span className="login-brand-icon"><CarFront size={48} color="var(--primary-glow)"/></span>' },
  { find: /<span className="login-brand-icon">🅿<\/span>/g, replace: '<span className="login-brand-icon"><CarFront size={48} color="var(--primary-glow)"/></span>' },
  { find: /—/g, replace: '-' },
  { find: /…/g, replace: '...' }
]);

// Payments.jsx, Sessions.jsx, Slots.jsx, Users.jsx, CustomerPayments.jsx
const otherPages = ['Payments.jsx', 'Sessions.jsx', 'Slots.jsx', 'Users.jsx', 'CustomerPayments.jsx'];
otherPages.forEach(p => {
  replacer(path.join(pages, p), [
    { find: /—/g, replace: '-' }
  ]);
});

// App.jsx
replacer(path.join(src, 'App.jsx'), [
    { find: /—/g, replace: '-' }
]);

console.log('Emoji replacement complete');