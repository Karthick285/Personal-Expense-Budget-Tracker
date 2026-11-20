const { spawn } = require('child_process');
const path = require('path');

console.log('========================================================');
console.log(' Starting Personal Expense & Budget Tracker Full-Stack');
console.log(' Backend Port:  http://localhost:5000');
console.log(' Frontend Port: http://localhost:5173');
console.log(' Demo Account:  demo@tracker.com / Password123!');
console.log('========================================================\n');

const backendScript = path.resolve(__dirname, 'backend/server.js');
const frontendScript = path.resolve(__dirname, 'frontend/node_modules/vite/bin/vite.js');

const backend = spawn(process.execPath, [backendScript], {
  cwd: path.resolve(__dirname, 'backend'),
  stdio: 'inherit'
});

const frontend = spawn(process.execPath, [frontendScript], {
  cwd: path.resolve(__dirname, 'frontend'),
  stdio: 'inherit'
});

function cleanup() {
  console.log('\nShutting down servers...');
  if (backend) backend.kill();
  if (frontend) frontend.kill();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
