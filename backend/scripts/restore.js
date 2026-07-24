/**
 * Production MongoDB Restore Script
 * Cross-platform tool locator for mongorestore across Windows, Linux, and macOS.
 * Enforces restoration from valid binary archives ONLY (.tar.gz, .archive, .gz).
 */
const { exec, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const backupDir = process.env.BACKUP_DIR || path.join(__dirname, '../backups');

if (!fs.existsSync(backupDir)) {
  console.error('[RESTORE ERROR] Backups directory does not exist.');
  process.exit(1);
}

function locateBinary(binName, envVar) {
  if (process.env[envVar] && fs.existsSync(process.env[envVar])) {
    return process.env[envVar];
  }

  try {
    const cmd = process.platform === 'win32' ? `where.exe ${binName}` : `which ${binName}`;
    const stdout = execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (stdout) {
      const firstLine = stdout.split(/\r?\n/)[0].trim();
      if (fs.existsSync(firstLine)) return firstLine;
    }
  } catch {
    // Continue
  }

  const candidatePaths = [];
  if (process.platform === 'win32') {
    const programFiles = process.env['ProgramFiles'] || 'C:\\Program Files';
    const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
    
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

const mongorestoreBin = locateBinary('mongorestore', 'MONGORESTORE_PATH');

if (!mongorestoreBin) {
  console.warn('\n[RESTORE ERROR] Missing mandatory database tool: \'mongorestore\' was not found in PATH or standard installation directories.');
  console.warn('📌 INSTALLATION GUIDANCE:');
  console.warn('  - Windows: Download MongoDB Database Tools from https://www.mongodb.com/try/download/database-tools and add the bin directory to PATH, or set MONGORESTORE_PATH.');
  console.warn('  - macOS: Run brew install mongodb-database-tools');
  console.warn('  - Linux: Install mongodb-database-tools package via apt/yum\n');
  process.exit(1);
}

// Enforce restoring ONLY from valid binary archives (.tar.gz, .archive, .gz), NEVER JSON fallbacks
const archives = fs.readdirSync(backupDir)
  .filter(f => f.startsWith('backup-') && (f.endsWith('.tar.gz') || f.endsWith('.archive') || f.endsWith('.gz')))
  .sort()
  .reverse();

if (archives.length === 0) {
  console.error('[RESTORE ERROR] No valid binary backup archives (.tar.gz / .archive / .gz) found in backups directory.');
  process.exit(1);
}

const targetArchive = archives[0];
const targetPath = path.join(backupDir, targetArchive);

console.log(`[RESTORE] Restoring database from archive: ${targetArchive}`);
console.log(`[RESTORE] Using mongorestore binary: ${mongorestoreBin}`);

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hiremate';
const command = `"${mongorestoreBin}" --uri="${mongoUri}" --archive="${targetPath}" --gzip --drop`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`[RESTORE ERROR] mongorestore process failed: ${error.message}`);
    process.exit(1);
  }
  console.log(`[RESTORE SUCCESS] Database successfully restored from ${targetArchive}`);
});
