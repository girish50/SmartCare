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
    
    // Core Layout Fixes
    content = content.replace(/bg-neutral-950/g, 'bg-ernovaBg');
    content = content.replace(/bg-gray-950/g, 'bg-ernovaBg');
    content = content.replace(/bg-slate-950/g, 'bg-ernovaBg');
    
    // Cards
    content = content.replace(/bg-neutral-900/g, 'bg-ernovaCard shadow-md');
    content = content.replace(/bg-gray-900/g, 'bg-ernovaCard shadow-md');
    content = content.replace(/bg-slate-900/g, 'bg-ernovaCard shadow-md');

    // Text & Borders
    content = content.replace(/text-neutral-100|text-white|text-gray-100/g, 'text-ernovaTextPrimary');
    content = content.replace(/text-neutral-400|text-gray-400|text-slate-400/g, 'text-ernovaTextSecondary');
    content = content.replace(/border-neutral-800|border-gray-800|border-slate-800/g, 'border-ernovaBorder');

    // Rounded Elements (Global upgrade to rounded-dashboard)
    content = content.replace(/rounded-2xl|rounded-3xl|rounded-xl/g, 'rounded-dashboard');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
});

// Update index.html
let htmlContent = fs.readFileSync('./index.html', 'utf8');
htmlContent = htmlContent.replace(/<body>/, '<body class="bg-ernovaBg text-ernovaTextPrimary">');
fs.writeFileSync('./index.html', htmlContent, 'utf8');

console.log('ERNova Design System applied!');
