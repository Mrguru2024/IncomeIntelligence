/**
 * Firebase Dependency Tracer
 * 
 * This utility looks for Firebase dependencies in the project
 * and helps identify where they're being used.
 */

const fs = require('fs');
const path = require('path');

// Function to recursively find all .ts and .tsx files
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      fileList = findFiles(filePath, fileList);
    } else if (
      stat.isFile() && 
      (file.endsWith('.ts') || file.endsWith('.tsx')) && 
      !file.endsWith('.d.ts')
    ) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to search for Firebase imports in a file
function searchForFirebaseImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = [];
    
    // Regular expressions to match various import patterns
    const importPatterns = [
      /import\s+.*\s+from\s+['"]firebase.*['"]/g,
      /import\s+.*\s+from\s+['"]@firebase.*['"]/g,
      /import\s*\(\s*['"]firebase.*['"]\s*\)/g,
      /import\s*\(\s*['"]@firebase.*['"]\s*\)/g,
      /require\s*\(\s*['"]firebase.*['"]\s*\)/g,
      /require\s*\(\s*['"]@firebase.*['"]\s*\)/g,
    ];
    
    importPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        imports.push(...matches);
      }
    });
    
    if (imports.length > 0) {
      return {
        file: filePath,
        imports,
      };
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
  }
  
  return null;
}

// Main function
function traceFirebaseDependencies(rootDir) {
  console.log('Tracing Firebase dependencies...');
  const files = findFiles(rootDir);
  console.log(`Found ${files.length} files to scan`);
  
  const results = [];
  
  files.forEach(filePath => {
    const result = searchForFirebaseImports(filePath);
    if (result) {
      results.push(result);
    }
  });
  
  console.log('\nFirebase dependencies found:');
  if (results.length === 0) {
    console.log('No direct Firebase imports found!');
  } else {
    results.forEach(result => {
      console.log(`\nFile: ${result.file}`);
      result.imports.forEach(imp => {
        console.log(`  ${imp}`);
      });
    });
  }
  
  console.log('\nCheck for Firebase package.json dependencies:');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };
    
    const firebaseDeps = Object.keys(dependencies).filter(
      dep => dep.includes('firebase') || dep.includes('@firebase')
    );
    
    if (firebaseDeps.length > 0) {
      console.log('Firebase dependencies in package.json:');
      firebaseDeps.forEach(dep => {
        console.log(`  ${dep}: ${dependencies[dep]}`);
      });
    } else {
      console.log('No Firebase dependencies in package.json');
    }
  } catch (error) {
    console.error('Error reading package.json:', error);
  }
}

// Run the tracer on the src directory
traceFirebaseDependencies(path.resolve(__dirname));

console.log('\nDone tracing Firebase dependencies.');