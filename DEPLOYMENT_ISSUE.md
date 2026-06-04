# Deployment Issue & Resolution

## Problem
Changes pushed to main branch are not appearing on the deployed site at `https://fsm-must-wins-landing-np.dinero.techzone.ibm.com`

## Root Cause
1. CI/CD pipeline successfully builds and pushes Docker images to ICR: `us.icr.io/content-studio-nonprod/fsm-must-wins-landing:latest`
2. Golden Path webhook builds from source code and pushes to OpenShift's internal registry
3. The deployment is configured to use OpenShift's internal registry, not ICR
4. Current pod is running an old image from commit `77919405e322854bf86b86dcf1c3a55701a7d215`

## Current Deployment Configuration
The deployment is in the wrong namespace (`content-studio-platform` instead of `content-studio-mirrors`)

Current image:
```yaml
image: image-registry.openshift-image-registry.svc:5000/content-studio-platform/fsm-must-wins-landing:latest
```

## Required Fix (Needs Admin Permissions)
Someone with `edit` or `admin` role in the `content-studio-mirrors` namespace needs to run:

```bash
oc set image deployment/fsm-must-wins-landing \
  app=us.icr.io/content-studio-nonprod/fsm-must-wins-landing:latest \
  -n content-studio-mirrors
```

Or use the provided script:
```bash
./scripts/update-deployment.sh
```

## What This Does
- Updates the deployment to pull from ICR instead of OpenShift's internal registry
- Triggers a pod restart with the new image containing your changes
- Future pipeline runs will automatically update the `:latest` tag in ICR
- OpenShift will pull the updated image on subsequent deployments

## Who Can Help
Contact your OpenShift admin or someone with deployment edit permissions in the `content-studio-mirrors` namespace.

## Verification After Fix
1. Check the deployment image:
   ```bash
   oc get deployment fsm-must-wins-landing -n content-studio-mirrors -o jsonpath='{.spec.template.spec.containers[0].image}'
   ```
   Should show: `us.icr.io/content-studio-nonprod/fsm-must-wins-landing:latest`

2. Check pod logs:
   ```bash
   oc logs -f deployment/fsm-must-wins-landing -n content-studio-mirrors -c app
   ```
   Should show: `Server running on http://0.0.0.0:3000` (using `serve`, not `sirv`)

3. Visit the site and verify your changes are visible

## Alternative: Request Permissions
Ask your admin to grant you `edit` role in the namespace:
```bash
oc policy add-role-to-user edit karnett.huynh@ibm.com -n content-studio-platform