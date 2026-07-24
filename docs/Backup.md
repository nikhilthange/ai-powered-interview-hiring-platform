# Database Backup Strategy Guide

## Automated Backup Execution
Run backup via npm script:
```bash
npm run backup
```
The script uses `mongodump` to create compressed `.tar.gz` archive snapshots in `backend/backups/`.

## Retention Policy
- Archives older than 14 days are automatically pruned.
