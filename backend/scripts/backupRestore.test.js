/**
 * Integration Test for MongoDB Backup and Restore Engine
 * Performs real backup, drop, and restore workflow using binary Database Tools if installed,
 * or gracefully skips with descriptive environment guidance if missing.
 */
const mongoose = require('mongoose');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/hiremate_backup_test';
const backupDir = path.join(__dirname, '../backups');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
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
    });
  } else {
    candidatePaths.push(
      `/usr/bin/${binName}`,
      `/usr/local/bin/${binName}`,
      `/opt/homebrew/bin/${binName}`
    );
  }

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

async function runBackupRestoreTest() {
  console.log('====================================================');
  console.log('🧪 MongoDB Backup & Restore Integration Test');
  console.log('====================================================\n');

  const dumpBin = locateBinary('mongodump', 'MONGODUMP_PATH');
  const restoreBin = locateBinary('mongorestore', 'MONGORESTORE_PATH');

  console.log(`Tool Detection:`);
  console.log(`- mongodump:    ${dumpBin ? dumpBin : 'NOT FOUND'}`);
  console.log(`- mongorestore: ${restoreBin ? restoreBin : 'NOT FOUND'}`);

  if (!dumpBin || !restoreBin) {
    console.warn('\n⚠️ [SKIPPED] Native mongodump/mongorestore binary CLI tools are not installed on this host system.');
    console.warn('📌 INSTALLATION GUIDANCE:');
    console.warn('  - Install MongoDB Database Tools from https://www.mongodb.com/try/download/database-tools to execute binary archive backup/restore integration tests.');
    console.warn('  - Test state: SKIPPED (Environment Dependency Missing)\n');
    process.exit(0);
  }

  console.log('\n[STEP 1] Connecting to temporary database:', TEST_DB_URI);
  await mongoose.connect(TEST_DB_URI, { serverSelectionTimeoutMS: 5000 });

  const TestSchema = new mongoose.Schema({ name: String, val: Number, createdAt: { type: Date, default: Date.now } });
  const TestModel = mongoose.model('BackupTestDoc', TestSchema);

  await TestModel.deleteMany({});

  console.log('[STEP 2] Seeding initial test documents...');
  const sampleDocs = [
    { name: 'Integration Doc A', val: 100 },
    { name: 'Integration Doc B', val: 200 },
    { name: 'Integration Doc C', val: 300 }
  ];
  await TestModel.insertMany(sampleDocs);
  const initialCount = await TestModel.countDocuments();
  console.log(`Seeded ${initialCount} test documents.`);

  const timestamp = Date.now();
  const archivePath = path.join(backupDir, `test-archive-${timestamp}.tar.gz`);

  console.log(`[STEP 3] Executing binary dump via ${dumpBin}...`);
  execSync(`"${dumpBin}" --uri="${TEST_DB_URI}" --archive="${archivePath}" --gzip`);
  console.log(`Archive created at ${archivePath}`);

  console.log('[STEP 4] Dropping test database collection...');
  await TestModel.deleteMany({});
  const countAfterDrop = await TestModel.countDocuments();
  console.log(`Count after drop: ${countAfterDrop}`);

  console.log(`[STEP 5] Executing binary restore via ${restoreBin}...`);
  execSync(`"${restoreBin}" --uri="${TEST_DB_URI}" --archive="${archivePath}" --gzip --drop`);

  if (fs.existsSync(archivePath)) {
    fs.unlinkSync(archivePath);
  }

  const restoredCount = await TestModel.countDocuments();
  console.log(`Restored document count: ${restoredCount}`);

  if (restoredCount !== initialCount) {
    throw new Error(`Restored document count (${restoredCount}) does not match initial count (${initialCount})`);
  }

  console.log('\n✅ [PASS] Native Binary Backup & Restore Integration Test Completed Successfully!\n');
  await mongoose.disconnect();
  process.exit(0);
}

runBackupRestoreTest().catch(err => {
  console.error('❌ [FAIL] Backup & Restore Integration Test error:', err.message);
  mongoose.disconnect().finally(() => process.exit(1));
});
