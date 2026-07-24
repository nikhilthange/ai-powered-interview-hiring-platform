/**
 * Production MongoDB Backup Script
 * Cross-platform tool locator for mongodump across Windows, Linux, and macOS.
 */
const { exec, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const backupDir = process.env.BACKUP_DIR || path.join(__dirname, '../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

function locateBinary(binName, envVar) {
  if (process.env[envVar] && fs.existsSync(process.env[envVar])) {
    return process.env[envVar];
  }

  // 1. Try system PATH via where.exe / which
  try {
    const cmd = process.platform === 'win32' ? `where.exe ${binName}` : `which ${binName}`;
    const stdout = execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (stdout) {
      const firstLine = stdout.split(/\r?\n/)[0].trim();
      if (fs.existsSync(firstLine)) return firstLine;
    }
  } catch {
    // Continue to standard directory search
  }

  // 2. Search common platform installation directories
  const candidatePaths = [];
  if (process.platform === 'win32') {
    const programFiles = process.env['ProgramFiles'] || 'C:\\Program Files';
    const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
    
    // Check MongoDB Tools and Server directories
    [programFiles, programFilesX86].forEach(base => {
      const toolsDir = path.join(base, 'MongoDB', 'Tools');
      if (fs.existsSync(toolsDir)) {
        fs.readdirSync(toolsDir).forEach(v => {
          candidatePaths.push(path.join(toolsDir, v, 'bin', `${binName}.exe`));
        });
      }
      const serverDir = path.join(base, 'MongoDB', 'Server');
      if (fs.existsSync(serverDir)) {
        fs.readdirSync(serverDir).forEach(v => {
          candidatePaths.push(path.join(serverDir, v, 'bin', `${binName}.exe`));
        });
      }
    });
  } else {
    // Linux and macOS common installation paths
    candidatePaths.push(
      `/usr/bin/${binName}`,
      `/usr/local/bin/${binName}`,
      `/opt/homebrew/bin/${binName}`,
      `/usr/local/opt/mongodb-database-tools/bin/${binName}`
    );
  }

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

const mongodumpBin = locateBinary('mongodump', 'MONGODUMP_PATH');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const archiveName = `backup-${timestamp}.tar.gz`;
const archivePath = path.join(backupDir, archiveName);

console.log(`[BACKUP] Starting MongoDB backup task: ${archiveName}`);

if (!mongodumpBin) {
  console.warn('\n[BACKUP ERROR] Missing mandatory database tool: \'mongodump\' was not found in PATH or standard installation directories.');
  console.warn('📌 INSTALLATION GUIDANCE:');
  console.warn('  - Windows: Download MongoDB Database Tools from https://www.mongodb.com/try/download/database-tools and add the bin directory to PATH, or set MONGODUMP_PATH.');
  console.warn('  - macOS: Run brew install mongodb-database-tools');
  console.warn('  - Linux: Install mongodb-database-tools package via apt/yum\n');
  process.exit(1);
}

console.log(`[BACKUP] Using mongodump binary: ${mongodumpBin}`);

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hiremate';
const command = `"${mongodumpBin}" --uri="${mongoUri}" --archive="${archivePath}" --gzip`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`[BACKUP ERROR] mongodump process execution failed: ${error.message}`);
    process.exit(1);
  }
  console.log(`[BACKUP SUCCESS] Backup archive successfully generated at ${archivePath}`);
  pruneOldBackups(backupDir);
});

function pruneOldBackups(dir) {
  const RETENTION_DAYS = 14;
  fs.readdirSync(dir).forEach(file => {
    if (!file.startsWith('backup-')) return;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    const ageInDays = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60 * 24);
    if (ageInDays > RETENTION_DAYS) {
      fs.unlinkSync(filePath);
      console.log(`[BACKUP RETENTION] Pruned expired backup: ${file}`);
    }
  });
}
