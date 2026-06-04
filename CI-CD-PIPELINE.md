# CI/CD Pipeline Documentation

## Overview

This document describes the complete CI/CD pipeline for the navattic-demos application, including architecture, setup, and troubleshooting.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CI/CD Pipeline Flow                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Developer  │
│  Pushes Code │
│   to GitHub  │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        GitHub Actions (Self-Hosted Runner)                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                 │
│  │   Job 1:     │    │   Job 2:     │    │   Job 3:     │                 │
│  │   Test       │───▶│   Security   │───▶│   Build      │                 │
│  │              │    │              │    │              │                 │
│  │ • npm ci     │    │ • npm audit  │    │ • Clean      │                 │
│  │ • npm test   │    │ • Check      │    │   Podman     │                 │
│  │ • npm build  │    │   secrets    │    │   cache      │                 │
│  └──────────────┘    └──────────────┘    │ • podman     │                 │
│                                           │   build      │                 │
│                                           │ • podman     │                 │
│                                           │   push       │                 │
│                                           └──────┬───────┘                 │
│                                                  │                          │
└──────────────────────────────────────────────────┼──────────────────────────┘
                                                   │
                                                   ▼
                                    ┌──────────────────────────┐
                                    │  IBM Cloud Container     │
                                    │  Registry (ICR)          │
                                    │                          │
                                    │  us.icr.io/              │
                                    │  content-studio-nonprod/ │
                                    │  navattic-demos:SHA      │
                                    └──────────────────────────┘
                                                   │
                                                   │
┌──────────────────────────────────────────────────┼──────────────────────────┐
│                        GitHub Actions (Continued)                            │
├──────────────────────────────────────────────────┼──────────────────────────┤
│                                                   │                          │
│  ┌────────────────────────────────────────────────────────────┐            │
│  │   Job 4: Deploy to Production                              │            │
│  │                                                             │            │
│  │   POST https://webhook-receiver.../trigger                 │            │
│  │   {                                                         │            │
│  │     "secret": "WEBHOOK_SECRET"                             │            │
│  │   }                                                         │            │
│  └─────────────────────────────┬───────────────────────────────┘            │
│                                │                                            │
└────────────────────────────────┼────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    OpenShift Cluster (content-studio-platform)               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────┐            │
│  │  Webhook Receiver Service                                  │            │
│  │  • Python HTTP server                                      │            │
│  │  • Validates webhook secret                                │            │
│  │  • Uses Kubernetes Python client                           │            │
│  │  • Service Account: webhook-receiver                       │            │
│  │  • RBAC: Can create jobs from cronjobs                     │            │
│  └─────────────────────────────┬───────────────────────────────┘            │
│                                │                                            │
│                                ▼                                            │
│  ┌────────────────────────────────────────────────────────────┐            │
│  │  Creates Job from CronJob                                  │            │
│  │                                                             │            │
│  │  oc create job --from=cronjob/golden-path-org-sync         │            │
│  │                gp-sync-webhook-TIMESTAMP                   │            │
│  └─────────────────────────────┬───────────────────────────────┘            │
│                                │                                            │
│                                ▼                                            │
│  ┌────────────────────────────────────────────────────────────┐            │
│  │  Golden Path Job Executes                                  │            │
│  │                                                             │            │
│  │  1. Clone repo from GitHub                                 │            │
│  │  2. Mirror to github.ibm.com                               │            │
│  │  3. Create wrapper with OAuth2 proxy                       │            │
│  │  4. Build and deploy to OpenShift                          │            │
│  │  5. Create route with TLS                                  │            │
│  └─────────────────────────────┬───────────────────────────────┘            │
│                                │                                            │
│                                ▼                                            │
│  ┌────────────────────────────────────────────────────────────┐            │
│  │  Application Deployed                                      │            │
│  │                                                             │            │
│  │  • Deployment: navattic-demos                              │            │
│  │  • Service: navattic-demos                                 │            │
│  │  • Route: navattic-demos-content-studio-platform...        │            │
│  │  • OAuth2 Proxy sidecar for authentication                 │            │
│  └────────────────────────────────────────────────────────────┘            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Components

### 1. GitHub Actions Pipeline

**Location**: `.github/workflows/ci-cd-pipeline.yml`

**Jobs**:
- **test**: Runs linting, tests, and builds the application
- **security**: Runs npm audit and checks for exposed secrets
- **build**: Builds Docker image and pushes to IBM Cloud Container Registry
- **deploy-production**: Triggers deployment via webhook

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

### 2. IBM Cloud Container Registry (ICR)

**Registry**: `us.icr.io` (Dallas region)
**Namespace**: `content-studio-nonprod`
**Image**: `us.icr.io/content-studio-nonprod/navattic-demos:SHA`

**Authentication**: Uses API key with `podman push --creds` flag

### 3. Webhook Receiver Service

**Endpoint**: `https://webhook-receiver-content-studio-platform.dinero.techzone.ibm.com/trigger`

**Components**:
- **Deployment**: `webhook-receiver`
- **Service Account**: `webhook-receiver`
- **Role**: `cronjob-trigger` (can create jobs from cronjobs)
- **ConfigMap**: `webhook-app` (contains Python webhook script)
- **Secret**: `webhook-secret` (webhook authentication)

**How it works**:
1. Receives POST request with webhook secret
2. Validates secret
3. Uses Kubernetes Python client to create job from cronjob
4. Returns job name in response

### 4. Golden Path CronJob

**CronJob**: `golden-path-org-sync`
**Namespace**: `content-studio-platform`
**Schedule**: Every 6 hours (but triggered on-demand via webhook)

**What it does**:
1. Clones repository from GitHub
2. Mirrors to github.ibm.com
3. Creates wrapper repository with OAuth2 proxy
4. Builds and deploys to OpenShift
5. Creates route with TLS termination

## Setup Instructions

### Prerequisites

1. GitHub repository with application code
2. IBM Cloud account with Container Registry access
3. OpenShift cluster access
4. Self-hosted GitHub Actions runner

### Step 1: Configure IBM Cloud Container Registry

```bash
# Login to IBM Cloud
ibmcloud login --apikey YOUR_API_KEY -r us-south

# Set Container Registry region
ibmcloud cr region-set us-south

# Verify namespace exists
ibmcloud cr namespace-list
# Should show: content-studio-nonprod
```

### Step 2: Deploy Webhook Receiver

```bash
# Apply webhook receiver configuration
oc apply -f - <<EOF
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: webhook-receiver
  namespace: content-studio-platform
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: cronjob-trigger
  namespace: content-studio-platform
rules:
- apiGroups: ["batch"]
  resources: ["jobs"]
  verbs: ["create"]
- apiGroups: ["batch"]
  resources: ["cronjobs"]
  verbs: ["get"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: webhook-receiver-cronjob-trigger
  namespace: content-studio-platform
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: cronjob-trigger
subjects:
- kind: ServiceAccount
  name: webhook-receiver
  namespace: content-studio-platform
---
apiVersion: v1
kind: Secret
metadata:
  name: webhook-secret
  namespace: content-studio-platform
type: Opaque
stringData:
  secret: "GENERATE_RANDOM_SECRET_HERE"
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: webhook-app
  namespace: content-studio-platform
data:
  webhook.py: |
    from http.server import HTTPServer, BaseHTTPRequestHandler
    from kubernetes import client, config
    import json
    import os
    import time
    
    config.load_incluster_config()
    batch_v1 = client.BatchV1Api()
    
    WEBHOOK_SECRET = os.environ['WEBHOOK_SECRET']
    NAMESPACE = os.environ['NAMESPACE']
    CRONJOB_NAME = os.environ['CRONJOB_NAME']
    
    class WebhookHandler(BaseHTTPRequestHandler):
        def do_POST(self):
            if self.path != '/trigger':
                self.send_response(404)
                self.end_headers()
                return
            
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            try:
                data = json.loads(body)
                if data.get('secret') != WEBHOOK_SECRET:
                    self.send_response(401)
                    self.end_headers()
                    self.wfile.write(b'Unauthorized')
                    return
            except Exception as e:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(str(e).encode())
                return
            
            try:
                timestamp = int(time.time())
                job_name = f"gp-sync-webhook-{timestamp}"
                
                cronjob = batch_v1.read_namespaced_cron_job(CRONJOB_NAME, NAMESPACE)
                
                job = client.V1Job(
                    api_version="batch/v1",
                    kind="Job",
                    metadata=client.V1ObjectMeta(
                        name=job_name,
                        namespace=NAMESPACE,
                        annotations={"cronjob.kubernetes.io/instantiate": "manual"}
                    ),
                    spec=cronjob.spec.job_template.spec
                )
                
                batch_v1.create_namespaced_job(NAMESPACE, job)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                response = {'status': 'success', 'job': job_name}
                self.wfile.write(json.dumps(response).encode())
                
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(str(e).encode())
        
        def do_GET(self):
            if self.path == '/health':
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b'OK')
            else:
                self.send_response(404)
                self.end_headers()
    
    if __name__ == '__main__':
        server = HTTPServer(('0.0.0.0', 8080), WebhookHandler)
        print(f'Webhook receiver listening on port 8080')
        server.serve_forever()
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webhook-receiver
  namespace: content-studio-platform
spec:
  replicas: 1
  selector:
    matchLabels:
      app: webhook-receiver
  template:
    metadata:
      labels:
        app: webhook-receiver
    spec:
      serviceAccountName: webhook-receiver
      containers:
      - name: webhook
        image: python:3.11-slim
        ports:
        - containerPort: 8080
        env:
        - name: HOME
          value: /tmp
        - name: WEBHOOK_SECRET
          valueFrom:
            secretKeyRef:
              name: webhook-secret
              key: secret
        - name: NAMESPACE
          value: content-studio-platform
        - name: CRONJOB_NAME
          value: golden-path-org-sync
        command:
        - /bin/bash
        - -c
        - |
          pip install --user kubernetes requests
          python3 /app/webhook.py
        volumeMounts:
        - name: app
          mountPath: /app
      volumes:
      - name: app
        configMap:
          name: webhook-app
---
apiVersion: v1
kind: Service
metadata:
  name: webhook-receiver
  namespace: content-studio-platform
spec:
  selector:
    app: webhook-receiver
  ports:
  - port: 80
    targetPort: 8080
---
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: webhook-receiver
  namespace: content-studio-platform
spec:
  to:
    kind: Service
    name: webhook-receiver
  port:
    targetPort: 8080
  tls:
    termination: edge
    insecureEdgeTerminationPolicy: Redirect
EOF
```

### Step 3: Configure GitHub Secrets

Add these secrets to your GitHub repository:

1. **ICR_API_KEY**: IBM Cloud API key for Container Registry
2. **WEBHOOK_SECRET**: Same secret used in webhook-secret above

**To add secrets**:
1. Go to: `https://github.com/YOUR_ORG/YOUR_REPO/settings/secrets/actions`
2. Click "New repository secret"
3. Add each secret

### Step 4: Copy Pipeline Configuration

Copy `.github/workflows/ci-cd-pipeline.yml` to your repository.

## Testing

### Test Webhook Manually

```bash
# Get the webhook secret
WEBHOOK_SECRET=$(oc get secret webhook-secret -n content-studio-platform -o jsonpath='{.data.secret}' | base64 -d)

# Test the webhook
curl -X POST https://webhook-receiver-content-studio-platform.dinero.techzone.ibm.com/trigger \
  -H "Content-Type: application/json" \
  -d "{\"secret\": \"$WEBHOOK_SECRET\"}"

# Should return: {"status": "success", "job": "gp-sync-webhook-TIMESTAMP"}
```

### Test Full Pipeline

```bash
# Make a small change and push
echo "# Test" >> README.md
git add README.md
git commit -m "test: Trigger CI/CD pipeline"
git push origin main
```

Monitor at: `https://github.com/YOUR_ORG/YOUR_REPO/actions`

## Troubleshooting

### Build Job Fails with "oc: command not found"

**Solution**: The webhook approach doesn't need oc CLI. Ensure you're using the webhook deployment step, not oc commands.

### Webhook Returns "Unauthorized"

**Solution**: Verify the WEBHOOK_SECRET in GitHub matches the secret in OpenShift:

```bash
oc get secret webhook-secret -n content-studio-platform -o jsonpath='{.data.secret}' | base64 -d
```

### Podman Push Fails with "unauthorized"

**Solution**: Verify:
1. Registry URL is `us.icr.io` (not `icr.io`)
2. Namespace is `content-studio-nonprod`
3. ICR_API_KEY secret is correct

### Webhook Pod Crashes

**Solution**: Check logs and ensure HOME=/tmp is set:

```bash
oc logs -n content-studio-platform -l app=webhook-receiver
oc set env deployment/webhook-receiver HOME=/tmp -n content-studio-platform
```

## Security Considerations

1. **Webhook Secret**: Use a strong random secret (32+ characters)
2. **Service Account**: Limited RBAC permissions (only create jobs)
3. **TLS**: All communication over HTTPS
4. **API Keys**: Stored as GitHub secrets, never in code
5. **Image Registry**: Private registry with authentication

## Maintenance

### Rotating Webhook Secret

```bash
# Generate new secret
NEW_SECRET=$(openssl rand -hex 32)

# Update in OpenShift
oc patch secret webhook-secret -n content-studio-platform \
  -p "{\"stringData\":{\"secret\":\"$NEW_SECRET\"}}"

# Restart webhook receiver
oc rollout restart deployment webhook-receiver -n content-studio-platform

# Update in GitHub secrets
# Go to: https://github.com/YOUR_ORG/YOUR_REPO/settings/secrets/actions
# Update WEBHOOK_SECRET with new value
```

### Updating Webhook Code

```bash
# Edit the ConfigMap
oc edit configmap webhook-app -n content-studio-platform

# Restart deployment to pick up changes
oc rollout restart deployment webhook-receiver -n content-studio-platform
```

## Benefits of This Approach

1. **No Token Rotation**: Service account credentials managed by OpenShift
2. **Secure**: RBAC, secrets, TLS encryption
3. **Scalable**: Can handle multiple apps with same webhook
4. **Maintainable**: Clear separation of concerns
5. **Standard**: Industry-standard webhook pattern
6. **Automated**: Complete CI/CD with zero manual steps

## References

- [IBM Cloud Container Registry](https://cloud.ibm.com/docs/Registry)
- [OpenShift Service Accounts](https://docs.openshift.com/container-platform/latest/authentication/using-service-accounts-in-applications.html)
- [Kubernetes Python Client](https://github.com/kubernetes-client/python)
- [GitHub Actions](https://docs.github.com/en/actions)