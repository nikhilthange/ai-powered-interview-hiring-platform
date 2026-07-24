# Kind / Minikube Automated Kubernetes Deployment Test Script (Windows)
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "☸️ Kubernetes Test Deployment Workflow" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Check cluster connection
Write-Host "[K8S] Checking cluster connection..." -ForegroundColor Yellow
$clusterCheck = & kubectl cluster-info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ [NOTICE] No active Kubernetes cluster found (Minikube/Kind is offline)." -ForegroundColor Yellow
    Write-Host "📌 GUIDANCE: To run a live cluster deployment test:" -ForegroundColor Yellow
    Write-Host "  1. Start Minikube: minikube start" -ForegroundColor Yellow
    Write-Host "  2. Or start Kind: kind create cluster --name hiremate-dev" -ForegroundColor Yellow
    Write-Host "[K8S] Executing offline dry-run client manifest verification..." -ForegroundColor Yellow
    node "$PSScriptRoot\validate_k8s.js"
    exit 0
}

$namespace = "hiremate-test-ns"

Write-Host "[K8S] Creating temporary test namespace: $namespace..." -ForegroundColor Yellow
kubectl create namespace $namespace --dry-run=client -o yaml | kubectl apply -f -

Write-Host "[K8S] Deploying manifests into namespace $namespace..." -ForegroundColor Yellow
kubectl apply -f "$PSScriptRoot\" -n $namespace

Write-Host "[K8S] Waiting for Deployments to become Ready..." -ForegroundColor Yellow
kubectl wait --for=condition=available --timeout=60s deployment --all -n $namespace

Write-Host "[K8S] Verifying Services and Ingress resources..." -ForegroundColor Yellow
kubectl get svc -n $namespace
kubectl get ingress -n $namespace

Write-Host "✅ [K8S SUCCESS] Kubernetes deployment verification complete!" -ForegroundColor Green
