const { exec } = require('child_process');
const fs = require('fs');

// Function to search for 'firebase' or 'Firebase' in files with specific extensions
function searchForFirebase() {
  const command = 'grep -r --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" "firebase\|Firebase" client/src';
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error();
      return;
    }
    
    // Write results to a file
    fs.writeFileSync('firebase-references.txt', stdout);
    console.log('Firebase references written to firebase-references.txt');
  });
}

// Scan for setPersistence calls specifically
function searchForSetPersistence() {
  const command = 'grep -r --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" "setPersistence" client/src';
  exec(command, (error, stdout, stderr) => {
    if (error && error.code !== 1) { // Ignore error code 1 (no matches)
      console.error();
      return;
    }
    
    // Write results to a file
    fs.writeFileSync('set-persistence-calls.txt', stdout || 'No setPersistence calls found');
    console.log('setPersistence calls written to set-persistence-calls.txt');
  });
}

// Run all searches
searchForFirebase();
searchForSetPersistence();
