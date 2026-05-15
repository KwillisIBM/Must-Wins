# FSM Must Wins Landing - Deployment Guide

This application is configured for automated deployment using the Content Studio CI/CD pipeline.

## 🚀 Quick Deploy

1. **Push to main branch**:
   ```bash
   git add .
   git commit -m "Add CI/CD pipeline configuration"
   git push origin main
   ```

2. **Monitor deployment**:
   - GitHub Actions: `https://github.com/content-studio-sandbox/fsm-must-wins-landing/actions`
   - Your app will be live at: `https://fsm-must-wins-landing-np.dinero.techzone.ibm.com`

## 📋 What's Included

- ✅ **Dockerfile**: Multi-stage build optimized for Vite React apps
- ✅ **Health Check**: `/healthz` endpoint for OpenShift monitoring
- ✅ **CI/CD Pipeline**: Automated testing, building, and deployment
- ✅ **OAuth2 Protection**: Automatic IBM w3id authentication

## 🏗️ Architecture

```
Vite React App → Docker Build → IBM Cloud Registry → OpenShift → Live App
```

## 📦 Build Details

- **Base Image**: Node 20 Alpine
- **Build Tool**: Vite
- **Server**: serve (static file server)
- **Port**: 3000
- **Health Check**: `/healthz` (returns "OK")

## 🔧 Local Testing

Test the Docker build locally:

```bash
# Build the image
docker build -t fsm-must-wins-landing:local .

# Run the container
docker run -p 3000:3000 fsm-must-wins-landing:local

# Test health check
curl http://localhost:3000/healthz
```

## 🌐 Deployment URL

After successful deployment, your app will be available at:
```
https://fsm-must-wins-landing-np.dinero.techzone.ibm.com
```

## 📊 Pipeline Stages

1. **Test** (2-3 min): Lint, test, and build
2. **Security** (1-2 min): npm audit and secret scanning
3. **Build** (3-5 min): Docker build and push to IBM Cloud Registry
4. **Deploy** (5-10 min): Golden Path deployment to OpenShift

Total time: ~15-20 minutes

## 🔐 Required Secrets

The following secrets must be configured in your GitHub repository:
- `ICR_API_KEY`: IBM Cloud Container Registry API key
- `WEBHOOK_SECRET`: Webhook secret for triggering deployments

These are already configured in the `content-studio-sandbox` organization.

## 🆘 Troubleshooting

### Build fails at "npm run build"
- Check that all dependencies are in `package.json`
- Ensure `vite.config.js` is properly configured

### Health check fails
- Verify `/healthz` endpoint returns 200 OK
- Check that the app is listening on port 3000

### Deployment webhook fails
- Verify `WEBHOOK_SECRET` is configured
- Check GitHub Actions logs for error details

## 📚 Additional Resources

- [CI/CD Pipeline Guide](./instructions/README.md)
- [Architecture Overview](./instructions/ARCHITECTURE.md)
- [Intern Quick Start](./instructions/INTERN_QUICK_START.md)