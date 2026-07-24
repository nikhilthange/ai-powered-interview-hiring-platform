# Production Incident Runbook

## Incident Playbook
1. **High Memory / CPU Usage:** Scale Kubernetes pods (`kubectl scale deployment hiremate-backend --replicas=5`).
2. **Database Connectivity Outage:** Inspect MongoDB service pods (`kubectl logs -n hiremate-prod deployment/mongodb-deployment`).
3. **NVIDIA AI API Failures:** Circuit breaker will automatically trip to fallback state. Check `AiConfig` metrics in MongoDB.
