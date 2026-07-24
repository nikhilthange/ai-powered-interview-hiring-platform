# Production Rollback Guide

## Executing Automated Rollback
- **Linux/macOS:** `./scripts/rollback.sh`
- **Windows:** `powershell ./scripts/rollback.ps1`

The script halts current containers, reloads Nginx configurations, pulls the previous production release image, and runs health probe verification.
