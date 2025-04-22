// This script will help us debug where the standalone HTML is being served from
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to search for text in a file
function searchInFile(filePath, searchText) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchText)) {
        console.log(`Found in ${filePath} at line ${i + 1}: ${lines[i].trim()}`);
        
        // Print 5 lines before and after for context
        const start = Math.max(0, i - 5);
        const end = Math.min(lines.length - 1, i + 5);
        
        console.log('---- Context ----');
        for (let j = start; j <= end; j++) {
          console.log(`${j + 1}: ${lines[j].trim()}`);
        }
        console.log('----------------');
      }
    }
  } catch (err) {
    console.error(`Error reading file ${filePath}: ${err.message}`);
  }
}

// Function to recursively search directories
function searchDirectory(dir, searchText) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules' && file !== '.git') {
      searchDirectory(filePath, searchText);
    } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx'))) {
      searchInFile(filePath, searchText);
    }
  }
}

// Search for the standalone HTML reference
searchDirectory('./server', 'standalone-clean.html');
searchDirectory('./server', 'Serving standalone HTML');