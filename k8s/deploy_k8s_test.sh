#!/usr/bin/env bash
# Kind / Minikube Automated Kubernetes Deployment Test Script (Linux/macOS)

set -e

echo "===================================================="
echo "☸️ Kubernetes Test Deployment Workflow"
echo "===================================================="

if ! kubectl cluster-info >/dev/null 2>&1; then
  echo "⚠️ [NOTICE] No active Kubernetes cluster found (Minikube/Kind is offline)."
  echo "📌 GUIDANCE: To run a live cluster deployment test:"
  echo "  1. Start Minikube: minikube start"
  echo "  2. Or start Kind: kind create cluster --name hiremate-dev"
  echo "[K8S] Executing offline manifest verification..."
  node "$(dirname "$0")/validate_k8s.js"
  exit 0
fi

NAMESPACE="hiremate-test-ns"

echo "[K8S] Creating temporary test namespace: $NAMESPACE..."
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

echo "[K8S] Deploying manifests into namespace $NAMESPACE..."
kubectl apply -f "$(dirname "$0")" -n "$NAMESPACE"

echo "[K8S] Waiting for Deployments to become Ready..."
kubectl wait --for=condition=available --timeout=60s deployment --all -n "$NAMESPACE"

echo "[K8S] Verifying Services and Ingress resources..."
kubectl get svc -n "$NAMESPACE"
kubectl get ingress -n "$NAMESPACE"

echo "✅ [K8S SUCCESS] Kubernetes deployment verification complete!"
