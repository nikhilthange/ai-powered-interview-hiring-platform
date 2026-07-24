# Database Restore Guide

## Disaster Recovery Execution
To restore the latest database snapshot:
```bash
npm run restore
```
The script locates the most recent `.tar.gz` archive in `backend/backups/` and executes `mongorestore --gzip --drop`.
