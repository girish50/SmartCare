import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('./src', (filePath) => {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Theming mappings:
    // indigo -> rose (Emergency/Critical)
    // gray -> zinc (Deep sleek charcoal)
    // blue -> teal (Clinical)
    
    content = content.replace(/indigo-/g, 'rose-');
    content = content.replace(/gray-/g, 'zinc-');
    content = content.replace(/blue-/g, 'teal-');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
});

console.log('Colors replaced successfully!');
