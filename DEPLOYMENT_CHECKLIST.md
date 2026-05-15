# 🚀 Deployment Checklist for FSM Must Wins Landing

## ✅ Pre-Deployment Verification

All required files have been created and configured:

- [x] **Dockerfile** - Multi-stage build for Vite React app
- [x] **public/healthz.html** - Health check endpoint
- [x] **.github/workflows/ci-cd-pipeline.yml** - CI/CD pipeline configuration
- [x] **.dockerignore** - Optimized Docker build context
- [x] **vite.config.js** - Updated with production settings
- [x] **DEPLOYMENT.md** - Deployment documentation

## 📝 Configuration Details

### Image Name
```yaml
IMAGE_NAME: 'fsm-must-wins-landing'
```

### Deployment URL
```
https://fsm-must-wins-landing-np.dinero.techzone.ibm.com
```

### Port Configuration
- Container Port: **3000**
- Health Check: **/healthz**

## 🎯 Next Steps

### 1. Commit All Changes
```bash
git add .
git commit -m "Add CI/CD pipeline and Docker configuration for deployment"
```

### 2. Push to Main Branch
```bash
git push origin main
```

### 3. Monitor Deployment
- **GitHub Actions**: https://github.com/content-studio-sandbox/fsm-must-wins-landing/actions
- Watch for 4 pipeline stages:
  1. ✅ Test (2-3 min)
  2. ✅ Security (1-2 min)
  3. ✅ Build & Push (3-5 min)
  4. ✅ Deploy (5-10 min)

### 4. Verify Deployment
Once pipeline completes:
```bash
# Test health endpoint
curl https://fsm-must-wins-landing-np.dinero.techzone.ibm.com/healthz

# Visit your app (requires IBM w3id login)
open https://fsm-must-wins-landing-np.dinero.techzone.ibm.com
```

## 🔍 What to Expect

### Pipeline Flow
```
Push to main
  ↓
GitHub Actions (self-hosted runner)
  ↓
Test & Security Scans
  ↓
Build Docker Image
  ↓
Push to IBM Cloud Registry (us.icr.io)
  ↓
Trigger Webhook
  ↓
Golden Path CronJob
  ↓
Deploy to OpenShift with OAuth2
  ↓
App Live! 🎉
```

### Total Time
**~15-20 minutes** from push to live deployment

## 🛡️ Security Features

Your deployed app automatically includes:
- ✅ OAuth2 authentication via IBM w3id
- ✅ TLS/HTTPS encryption
- ✅ Security scanning in CI/CD
- ✅ Container image vulnerability scanning

## 📊 Monitoring

After deployment, you can monitor:
- **OpenShift Console**: Check pod status and logs
- **GitHub Actions**: View deployment history
- **Instana APM**: Application performance monitoring (auto-configured)

## 🆘 Troubleshooting

If deployment fails, check:
1. GitHub Actions logs for error messages
2. Ensure secrets are configured (`ICR_API_KEY`, `WEBHOOK_SECRET`)
3. Verify Dockerfile builds locally: `docker build -t test .`
4. Check health endpoint returns 200 OK

## 📚 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guide
- [CI/CD Pipeline Guide](./instructions/README.md) - Full pipeline documentation
- [Architecture Overview](./instructions/ARCHITECTURE.md) - System architecture

---

**Ready to deploy?** Run the commands in "Next Steps" above! 🚀