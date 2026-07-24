# Enterprise Deployment Guide

## Production Environment Prerequisites
- Node.js >= 18.0.0
- Docker & Docker Compose
- Nginx reverse proxy
- MongoDB cluster

## Docker Deployment Steps
1. Build frontend bundle: `cd frontend && npm run build`
2. Start services via Docker Compose: `docker-compose up -d --build`
3. Verify health probe: `curl http://localhost:5000/api/v1/health`
