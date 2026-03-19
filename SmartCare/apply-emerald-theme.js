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
    
    // Changing Cyan to Emerald (Primary Hospital green)
    content = content.replace(/cyan-/g, 'emerald-');
    // Changing Slate to Neutral (Deeper, darker obsidian gray)
    content = content.replace(/slate-/g, 'neutral-');
    // Changing Fuchsia to Amber (Secondary warning/alert)
    content = content.replace(/fuchsia-/g, 'amber-');
    // Changing Violet to Lime (Accent)
    content = content.replace(/violet-/g, 'lime-');

    // Update hex/rgb in Layout for the cursor grid
    content = content.replace(/#06b6d4/g, '#10b981'); // cyan-500 to emerald-500
    content = content.replace(/rgba\(6, \s*182, \s*212/g, 'rgba(16, 185, 129'); // emerald
    content = content.replace(/rgba\(217, \s*70, \s*239/g, 'rgba(245, 158, 11'); // fuchsia to amber

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
});

console.log('Biometric Emerald palette applied!');
