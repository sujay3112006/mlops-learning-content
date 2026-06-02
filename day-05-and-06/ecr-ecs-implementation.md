# Deploy 3-Tier MERN App to AWS ECS via ECR

## Your Project Overview

Your project is a classic **MERN stack** (3-tier architecture):

| Tier | Service | Technology | Port |
|------|---------|-----------|------|
| 🖥️ Frontend | `frontend` | Vite + React (Node 22) | 5173 |
| ⚙️ Backend | `backend` | Node.js Express | 5000 |
| 🗄️ Database | `mongo` | MongoDB | 27017 |

You have Dockerfiles for both `frontend` and `backend`. The plan covers:
1. Pushing images to **ECR** (Elastic Container Registry)
2. Deploying them on **ECS** (Elastic Container Service) using **Fargate** (serverless containers — no servers to manage)

---

## Open Questions

> [!IMPORTANT]
> Please confirm the following before we proceed to execution:
> 1. **AWS Region** — Which AWS region do you want to deploy in? (e.g., `us-east-1`, `ap-south-1` for India)
> 2. **MongoDB** — AWS ECS is not ideal for running stateful databases like MongoDB as containers. Do you want to use **MongoDB Atlas (free tier)** instead? This is the recommended approach for beginners.
> 3. **Frontend Dockerfile** — Your current frontend Dockerfile runs `npm run dev` (dev server). For production on ECS, it should build static files and serve via Nginx. Do you want me to **update the Dockerfile** for production?
> 4. **AWS CLI** — Do you already have the AWS CLI installed and configured with your credentials (`aws configure`)?

---

## Prerequisites (Do These First)

### Tools You Need on Your Machine
- ✅ **Docker Desktop** — must be running
- ✅ **AWS CLI** — to run AWS commands from terminal
- ✅ **AWS Account** — with IAM user having ECR + ECS permissions

### Install AWS CLI (if not installed)
```powershell
# Windows - download and run the MSI installer
# https://awscli.amazonaws.com/AWSCLIV2.msi

# Verify installation
aws --version
```

### Configure AWS CLI
```powershell
aws configure
# You'll be prompted for:
# AWS Access Key ID: <your-key>
# AWS Secret Access Key: <your-secret>
# Default region name: ap-south-1   (or your region)
# Default output format: json
```

---

## Phase 1 — Create ECR Repositories

ECR is like Docker Hub, but private and inside AWS. We'll create one repository per image.

### Step 1.1 — Create ECR repo for Backend
```powershell
aws ecr create-repository `
  --repository-name day05-backend `
  --region ap-south-1
```
> Save the `repositoryUri` from the output. It looks like:
> `123456789.dkr.ecr.ap-south-1.amazonaws.com/day05-backend`

### Step 1.2 — Create ECR repo for Frontend
```powershell
aws ecr create-repository `
  --repository-name day05-frontend `
  --region ap-south-1
```
> Save this URI too: `123456789.dkr.ecr.ap-south-1.amazonaws.com/day05-frontend`

---

## Phase 2 — Build & Push Docker Images to ECR

### Step 2.1 — Authenticate Docker with ECR
```powershell
# Replace ap-south-1 and 123456789 with your region and account ID
aws ecr get-login-password --region ap-south-1 | `
  docker login --username AWS --password-stdin `
  123456789.dkr.ecr.ap-south-1.amazonaws.com
```
> You should see: `Login Succeeded`

### Step 2.2 — Build & Push Backend Image
```powershell
# Navigate to project root
cd "c:\Users\thanv\OneDrive\Documents\mlops\day-05"

# Build the backend image
docker build -t day05-backend ./backend

# Tag it with the ECR URI
docker tag day05-backend:latest `
  123456789.dkr.ecr.ap-south-1.amazonaws.com/day05-backend:latest

# Push to ECR
docker push 123456789.dkr.ecr.ap-south-1.amazonaws.com/day05-backend:latest
```

### Step 2.3 — Update Frontend Dockerfile (Production Build)

> [!WARNING]
> Your current frontend Dockerfile runs `npm run dev`. This is **not suitable for production**.
> We need to build static files and serve them via **Nginx**.

Replace `frontend/Dockerfile` with this production version:
```dockerfile
# Stage 1: Build the Vite app
FROM node:22-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Step 2.4 — Build & Push Frontend Image
```powershell
# Build the frontend image
docker build -t day05-frontend ./frontend

# Tag it
docker tag day05-frontend:latest `
  123456789.dkr.ecr.ap-south-1.amazonaws.com/day05-frontend:latest

# Push to ECR
docker push 123456789.dkr.ecr.ap-south-1.amazonaws.com/day05-frontend:latest
```

### ✅ Verify in AWS Console
Go to **ECR → Repositories** and confirm both repos have an image tagged `latest`.

---

## Phase 3 — Set Up MongoDB Atlas (Database Tier)

> [!NOTE]
> We move MongoDB out of ECS because containers are ephemeral — if a container restarts, all data is lost. MongoDB Atlas gives you a persistent, managed database for free.

1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas) → **Sign Up Free**
2. Create a **Free M0 cluster** (no credit card needed)
3. Under **Database Access** → Add a user (e.g., `mern-user`) with a strong password
4. Under **Network Access** → Add IP `0.0.0.0/0` (allow all — for now)
5. Click **Connect → Drivers** → copy the connection string:
   ```
   mongodb+srv://mern-user:<password>@cluster0.xxxxx.mongodb.net/mern-dashboard
   ```

---

## Phase 4 — Create ECS Cluster

ECS Cluster = the environment where your containers run.

### Step 4.1 — Create the Cluster (via AWS Console)
1. Go to **ECS → Clusters → Create Cluster**
2. Cluster name: `day05-cluster`
3. Infrastructure: Select **AWS Fargate** ✅ (serverless, no EC2 to manage)
4. Click **Create**

---

## Phase 5 — Create ECS Task Definitions

A Task Definition is like a blueprint that tells ECS what containers to run, what images to use, and what environment variables to set.

### Step 5.1 — Backend Task Definition
1. Go to **ECS → Task Definitions → Create new**
2. Fill in:
   - Task definition family: `day05-backend-task`
   - Launch type: **AWS Fargate**
   - OS: **Linux/X86_64**
   - CPU: `0.5 vCPU`, Memory: `1 GB`
3. Add container:
   - Name: `backend`
   - Image URI: `123456789.dkr.ecr.ap-south-1.amazonaws.com/day05-backend:latest`
   - Port: `5000`
4. Environment variables:
   | Key | Value |
   |-----|-------|
   | `PORT` | `5000` |
   | `MONGODB_URI` | `mongodb+srv://mern-user:...` (your Atlas URI) |
   | `JWT_SECRET` | `your-strong-secret-key` |
5. Click **Create**

### Step 5.2 — Frontend Task Definition
1. Create another task definition: `day05-frontend-task`
2. Same Fargate settings
3. Add container:
   - Name: `frontend`
   - Image URI: `123456789.dkr.ecr.ap-south-1.amazonaws.com/day05-frontend:latest`
   - Port: `80`
4. Click **Create**

---

## Phase 6 — Create ECS Services & Load Balancer

An ECS Service keeps your task running and restarts it if it crashes. An ALB (Application Load Balancer) gives you a public URL.

### Step 6.1 — Create Backend Service
1. Go to your cluster `day05-cluster` → **Services → Create**
2. Launch type: **Fargate**
3. Task Definition: `day05-backend-task`
4. Service name: `day05-backend-service`
5. Desired tasks: `1`
6. Networking: Select your **VPC** and **subnets** (use defaults)
7. Security Group: Allow inbound on port `5000`
8. Load Balancer: Create a new **ALB**
   - Listener port: `80`
   - Target group: port `5000`
9. Click **Create**

### Step 6.2 — Create Frontend Service
1. Same steps, use `day05-frontend-task`
2. Service name: `day05-frontend-service`
3. Security Group: Allow inbound on port `80`
4. Load Balancer: Create another **ALB** (or add a listener to the same one)
5. Update the frontend's `VITE_API_URL` (if any) to point to the backend ALB DNS

---

## Bonus

### For the ALB security group:

**Inbound:**
- 80 from 0.0.0.0/0
- optionally 443 from 0.0.0.0/0
**Outbound:**
- allow all, or at least to the task SG on 5000

### For the ECS task security group:

**Inbound:**
- 5000 from the ALB security group ID, not from 0.0.0.0/0
**Outbound:**
- allow all, so it can reach MongoDB Atlas and other services

---

## Phase 7 — Verify Deployment

### Check ECS Console
1. Go to **ECS → Clusters → day05-cluster → Services**
2. Both services should show **Status: ACTIVE** and **Running tasks: 1**

### Test the App
1. Go to **EC2 → Load Balancers** → find your frontend ALB
2. Copy the **DNS name** (e.g., `day05-frontend-alb-123.ap-south-1.elb.amazonaws.com`)
3. Paste it in your browser → your app should load! 🎉

### Useful Debugging Commands
```powershell
# Check running ECS tasks
aws ecs list-tasks --cluster day05-cluster

# View task logs (CloudWatch)
# Go to CloudWatch → Log Groups → /ecs/day05-backend-task
```

---

## Architecture Diagram

```
Internet
    │
    ▼
[ALB - Frontend] ──→ [ECS Fargate: Frontend (Nginx:80)]
                              │
                              ▼ API calls
                    [ALB - Backend] ──→ [ECS Fargate: Backend (Node:5000)]
                                                │
                                                ▼
                                    [MongoDB Atlas (Cloud)]
```

---

## Cost Estimate (Approximate)

| Resource | Cost |
|----------|------|
| ECS Fargate (0.5 vCPU, 1GB) × 2 | ~$15–20/month |
| ALB × 2 | ~$16/month |
| ECR Storage | ~$0.10/GB/month |
| MongoDB Atlas M0 | **Free** |
| **Total** | **~$30–40/month** |

> [!TIP]
> To minimize costs during learning, **stop/delete** the ECS services when not testing. You only pay for what runs.

---

## Verification Plan

1. **ECR**: Both repository images visible in AWS Console with `latest` tag
2. **ECS**: Both services show `RUNNING` state with 0 stopped tasks
3. **App**: Frontend loads via ALB DNS, can log in/interact with backend
4. **Logs**: CloudWatch log groups for each task show no errors
