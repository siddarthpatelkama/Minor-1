const { spawn } = require('child_process');
const path = require('path');

console.log('------------------------------------------------------------');
console.log(' Starting Vel Tech Hostel Complaint Management System');
console.log(' Backend:  http://localhost:5000');
console.log(' Frontend: http://localhost:3000');
console.log('------------------------------------------------------------');

const isWin = /^win/.test(process.platform);

const backend = spawn(isWin ? 'npm.cmd' : 'npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: isWin
});

const frontend = spawn(isWin ? 'npm.cmd' : 'npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: isWin
});

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
