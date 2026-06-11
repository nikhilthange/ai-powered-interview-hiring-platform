# DevOps, CI/CD, and Production Scaling Strategy
> **Senior Engineer Note:** Running a production platform means planning for infrastructure degradation, sudden traffic spikes, and slow integrations. We use Docker to ensure environment parity across dev and prod, Nginx for efficient SSL/TLS termination and reverse proxying, and asynchronous queues to guarantee API responsiveness.

---

## 1. Production Docker Strategy

Our application stack is divided into discrete containerized components:
1. **Frontend**: Vite SPA built and served via a lightweight Alpine Nginx container.
2. **Backend**: Node/Express server running in a Node-slim image with non-root user execution (`node` user) to prevent root access attacks.
3. **Database**: MongoDB Replica Set (for production, leverage managed MongoDB Atlas; for local/staging, use containerized Mongo).
4. **Cache & Rate Limiting**: Redis Server instance.

---

## 2. Nginx Reverse Proxy & Load Balancing Architecture
Nginx handles incoming HTTPS requests, terminates SSL certificates (Let's Encrypt), compresses assets using Gzip, and proxies API/WebSocket connections to the Express application cluster.

```
                   HTTPS (Port 443)
[Client Browser] ───────────────────> [Nginx Reverse Proxy]
                                                │
                ┌───────────────────────────────┴───────────────────────────────┐
                │ Proxy Pass (API)                                              │ Proxy Pass (WebSockets)
                ▼                                                               ▼
   [Express API Server 1] (Port 5000)                             [Express socket Server 1] (WSS)
   [Express API Server 2] (Port 5000)
```

---

## 3. Continuous Integration & Deployment (GitHub Actions)
Our CI/CD workflow automatically builds, tests, lints, and deploys code whenever changes are merged into the `main` branch.

```yaml
name: Production Deployment Pipeline

on:
  push:
    branches: [ main ]

jobs:
  test-and-lint:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run Test Suite
        run: npm test

  build-and-push:
    needs: test-and-lint
    runs-on: ubuntu-latest
    steps:
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to DockerHub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and Push Backend Image
        uses: docker/build-push-action@v4
        with:
          file: ./Dockerfile.backend
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/interview-backend:latest

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: SSH Deploy to VPS Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_IP }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            docker compose -f docker-compose.prod.yml pull
            docker compose -f docker-compose.prod.yml up -d --remove-orphans
```

---

## 4. Platform Scaling Strategy (100k+ Active Users)

When scaled past 100k+ active accounts, monolithic Node/Express architectures experience I/O and CPU bottlenecks. We implement the following strategies:

### 4.1 Horizontal Scaling & Load Balancing
* **Express Clusters**: Run multiple instances of the Express service using PM2 inside the containers or spin up multiple Docker instances.
* **WebSocket Scalability**: Because client WSS connections are stateful, use Nginx **ip_hash** (sticky sessions) or leverage **Socket.io Redis Adapter** so instances can broadcast updates to sockets connected to different servers.

### 4.2 Background Task Offloading (BullMQ)
Tasks like PDF extraction, AI resume parsing (which takes 3–5 seconds), and email sending should never block the main Express event loop.
* **Architecture**: The Express API server places a job payload in a Redis-backed queue (**BullMQ**) and returns `202 Accepted` to the client.
* **Workers**: Dedicated lightweight background Node processes consume tasks from the queue and update MongoDB upon completion, notifying the client via WebSockets.

```
[Express Server] ──(Push Job)──> [Redis Queue (BullMQ)] ──> [Background Worker Node]
                                                                     │
                                                               (Process AI Task)
                                                                     │
[React Client] <──(WebSocket Notification)── [Socket.io] <──(Save to DB)
```

### 4.3 Database Optimization & Sharding
* **Query Caching**: Keep hot records (like Job details) cached in Redis with a 5-minute Time-To-Live (TTL) to reduce database read operations.
* **Compound Indices**: Add indexes specifically targeting filter combinations (e.g. `location`, `status`, `salary`).
* **Database Sharding**: When collections exceed storage and RAM capacities, shard the `ChatMessage` and `Application` collections based on `chatRoomId` and `jobId` partition keys respectively.
