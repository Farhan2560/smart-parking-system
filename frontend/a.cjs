const fs = require('fs');
const path = require('path');

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
const styleCounts = {};

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const matches = content.match(/style=\{\{([^\{\}]+)\}\}/g);
  if (matches) {
    matches.forEach(m => {
      styleCounts[m] = (styleCounts[m] || 0) + 1;
    });
  }
});

const sorted = Object.entries(styleCounts).sort((a,b) => b[1] - a[1]);
console.log('Top inline styles:');
sorted.slice(0, 30).forEach(([style, count]) => {
  console.log(count + ': ' + style);
});
