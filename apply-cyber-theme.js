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
    
    // Changing Rose to Cyan (Cyber-Medical Primary)
    content = content.replace(/rose-/g, 'cyan-');
    // Changing Zinc to Slate (Deep, cool dark background)
    content = content.replace(/zinc-/g, 'slate-');
    // Changing Teal to Fuchsia (High-contrast tech secondary)
    content = content.replace(/teal-/g, 'fuchsia-');
    // Changing Amber to Violet (Accent orb)
    content = content.replace(/amber-/g, 'violet-');

    // Update hex/rgb in Layout for the cursor grid
    content = content.replace(/#f43f5e/g, '#06b6d4'); // rose-500 to cyan-500
    content = content.replace(/rgba\(244, \s*63, \s*94/g, 'rgba(6, 182, 212'); // rose-500 to cyan-500
    content = content.replace(/rgba\(20, \s*184, \s*166/g, 'rgba(217, 70, 239'); // teal-500 to fuchsia-500

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
});

console.log('Cyber-Medical palette applied!');
