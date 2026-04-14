const fs = require('fs');
const path = require('path');

const replacements = [
  { match: /style=\{\{\s*\/\*\s*borderLeftColor[\s\S]*?\*\/\s*display:\s*"flex",\s*justifyContent:\s*"space-between",\s*alignItems:\s*"center"\s*\}\}/g, class: "flex-between-center" },
  { match: /style=\{\{\s*display:\s*'flex',\s*alignItems:\s*'center',\s*gap:\s*'4px'\s*\}\}/g, class: "flex-center-gap-4" },
  { match: /style=\{\{\s*display:\s*"flex",\s*gap:\s*"8px"\s*\}\}/g, class: "flex-gap-8" },
  { match: /style=\{\{\s*display:\s*"flex",\s*gap:\s*"10px"\s*\}\}/g, class: "flex-gap-10" },
  { match: /style=\{\{\s*position:\s*"fixed",\s*top:\s*0,\s*left:\s*0,\s*right:\s*0,\s*bottom:\s*0,\s*background:\s*"rgba\(0,0,0,0\.5\)",\s*display:\s*"flex",\s*justifyContent:\s*"center",\s*alignItems:\s*"center",\s*zIndex:\s*1000\s*\}\}/g, class: "modal-overlay" },
  { match: /style=\{\{\s*background:\s*"var\(--surface\)",\s*width:\s*"400px",\s*padding:\s*"20px"\s*\}\}/g, class: "modal-content" },
  { match: /style=\{\{\s*display:\s*"flex",\s*flexDirection:\s*"column",\s*gap:\s*"10px"\s*\}\}/g, class: "modal-form-col" },
  { match: /style=\{\{\s*display:\s*"flex",\s*justifyContent:\s*"space-between",\s*marginTop:\s*"10px"\s*\}\}/g, class: "modal-actions" },
  { match: /style=\{\{\s*padding:\s*"8px\s*16px",\s*background:\s*"var\(--text-muted\)",\s*color:\s*"var\(--surface\)",\s*border:\s*"none",\s*borderRadius:\s*"4px",\s*cursor:\s*"pointer"\s*\}\}/g, class: "btn-cancel" }
];

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      file = path.join(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(file));
      } else if (file.endsWith('.jsx')) {
        results.push(file);
      }
    });
  } catch(e) {}
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let changed = false;
  replacements.forEach(rep => {
    if (rep.match.test(content)) {
      content = content.replace(rep.match, `className="${rep.class}"`);
      changed = true;
    }
  });

  if (changed) {
    let oldContent;
    do {
      oldContent = content;
      content = content.replace(/className="([^"]+)"\s+className="([^"]+)"/g, 'className="$1 $2"');
    } while (oldContent !== content);
    
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
});

