/**
 * Firebase Dependency Cleanup Script
 * This script will:
 * 1. Create a backup of package.json
 * 2. Create a clean version of package.json without Firebase/Sanity dependencies
 * 3. Print instructions on how to finish the cleanup process
 */

import fs from 'fs';
import path from 'path';

const ROOT_DIR = path.resolve(import.meta.dirname, '..');

// Create backup of package.json
function backupPackageJson() {
  const packageJsonPath = path.join(ROOT_DIR, 'package.json');
  const backupPath = path.join(ROOT_DIR, 'package.json.firebase-backup');
  
  console.log('Creating backup of package.json...');
  
  try {
    if (!fs.existsSync(packageJsonPath)) {
      console.error('Error: package.json not found');
      return false;
    }
    
    fs.copyFileSync(packageJsonPath, backupPath);
    console.log(`Backup created at ${backupPath}`);
    return true;
  } catch (error) {
    console.error('Error creating backup:', error);
    return false;
  }
}

// Remove Firebase and Sanity dependencies
function cleanPackageJson() {
  const packageJsonPath = path.join(ROOT_DIR, 'package.json');
  
  console.log('Creating clean version of package.json...');
  
  try {
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);
    
    // List of Firebase and Sanity dependencies to remove
    const removeDependencies = [
      'firebase',
      '@firebase/app',
      '@firebase/auth',
      '@firebase/firestore',
      '@firebase/analytics',
      '@firebase/database',
      '@firebase/storage',
      '@firebase/functions',
      '@firebase/messaging',
      'sanity',
      '@sanity/client',
      '@sanity/image-url'
    ];
    
    // Filter out Firebase and Sanity dependencies
    if (packageJson.dependencies) {
      const originalDependencies = { ...packageJson.dependencies };
      
      for (const dep of removeDependencies) {
        if (packageJson.dependencies[dep]) {
          delete packageJson.dependencies[dep];
          console.log(`Removed dependency: ${dep}`);
        }
      }
    }
    
    if (packageJson.devDependencies) {
      const originalDevDependencies = { ...packageJson.devDependencies };
      
      for (const dep of removeDependencies) {
        if (packageJson.devDependencies[dep]) {
          delete packageJson.devDependencies[dep];
          console.log(`Removed dev dependency: ${dep}`);
        }
      }
    }
    
    // Write clean package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Clean package.json created successfully!');
    
    return true;
  } catch (error) {
    console.error('Error cleaning package.json:', error);
    return false;
  }
}

// Print next steps
function printNextSteps() {
  console.log('\n--- FIREBASE REMOVAL INSTRUCTIONS ---');
  console.log('1. Now you\'ll need to reinstall all dependencies:');
  console.log('   npm install');
  console.log('2. Restart the server:');
  console.log('   npm run dev');
  console.log('3. If there are issues, you can restore the backup:');
  console.log('   cp package.json.firebase-backup package.json');
  console.log('4. If everything works, you can delete the backup:');
  console.log('   rm package.json.firebase-backup');
  console.log('----------------------------------------\n');
}

// Main function
async function main() {
  console.log('Starting Firebase dependency cleanup...');
  
  const backupSuccess = backupPackageJson();
  if (!backupSuccess) {
    console.error('Failed to create backup. Aborting cleanup.');
    return;
  }
  
  const cleanSuccess = cleanPackageJson();
  if (!cleanSuccess) {
    console.error('Failed to clean package.json. Aborting cleanup.');
    return;
  }
  
  printNextSteps();
}

// Run the script
main().catch(console.error);