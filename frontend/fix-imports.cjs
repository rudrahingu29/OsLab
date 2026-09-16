const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Fix Topic import
    content = content.replace(/import\s+\{\s*Topic[\s\w,]*\}\s+from\s+['"].*?\/data\/topics['"]/g, match => match.replace('import {', 'import type {'));
    
    // Fix simulation types
    content = content.replace(/import\s+\{([\s\w,]+)\}\s+from\s+['"].*?\/types\/simulation['"]/g, match => match.replace('import {', 'import type {'));
    
    // Fix IScheduler import
    content = content.replace(/import\s+\{\s*IScheduler[\s\w,]*\}\s+from\s+['"].*?\/simulation\/cpu['"]/g, match => match.replace('import {', 'import type {'));

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed', filePath);
    }
  }
});
