// Run a clean version of the application with no Firebase dependencies
console.log("Starting Stackr Finance in clean mode (no Firebase)");

// Start the Vite dev server with the clean config
const { spawn } = require('child_process');
const serverProcess = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });

// Start the frontend with the clean config
const frontendProcess = spawn(
  'npx', 
  ['vite', '--config', 'client/vite.clean.config.ts', '--host'], 
  { stdio: 'inherit' }
);

// Handle clean exit
process.on('SIGINT', () => {
  console.log('Shutting down clean server...');
  serverProcess.kill();
  frontendProcess.kill();
  process.exit(0);
});

// Log when processes exit
serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  frontendProcess.kill();
  process.exit(code);
});

frontendProcess.on('close', (code) => {
  console.log(`Frontend process exited with code ${code}`);
  serverProcess.kill();
  process.exit(code);
});