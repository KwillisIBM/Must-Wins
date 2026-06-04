#!/bin/bash
# Script to update OpenShift deployment to use ICR image
# Run this after CI/CD pipeline completes

set -e

IMAGE_NAME="fsm-must-wins-landing"
ICR_IMAGE="us.icr.io/content-studio-nonprod/${IMAGE_NAME}:latest"
NAMESPACE="content-studio-platform"

echo "🔄 Updating deployment to use ICR image..."
echo "Image: ${ICR_IMAGE}"

oc set image deployment/${IMAGE_NAME} \
  app=${ICR_IMAGE} \
  -n ${NAMESPACE}

echo "✅ Deployment updated!"
echo "🔄 Rolling out new pods..."

oc rollout status deployment/${IMAGE_NAME} -n ${NAMESPACE}

echo "✅ Deployment complete!"
echo "🌐 Check your app at: https://${IMAGE_NAME}-np.dinero.techzone.ibm.com"

# Made with Bob
