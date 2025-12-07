#!/bin/bash
# ==============================================================================
# DEPLOY STAGING - NEO_STACK Platform v3.0
# Deploys all 3 portals to staging environment
# ==============================================================================

set -e  # Exit on error

echo "🚀 NEO_STACK Platform v3.0 - Deploy para Staging"
echo "================================================"
echo ""

# Configuration
STAGING_ENV="staging"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="deploy-staging-${TIMESTAMP}.log"

# Portal URLs (Staging)
ADMIN_PORTAL_URL="https://admin-staging.neo-stack.com"
TENANT_PORTAL_URL="https://tenant-staging.neo-stack.com"
CERTIFICATION_PORTAL_URL="https://cert-staging.neo-stack.com"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# Function to deploy a portal
deploy_portal() {
    local portal_name=$1
    local portal_path=$2
    local portal_url=$3

    log "📦 Deploying $portal_name..."
    log "   Path: $portal_path"
    log "   URL: $portal_url"

    cd $portal_path

    # Build
    log "   → Running build..."
    npm run build > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        log "   ✅ Build successful"
    else
        log "   ❌ Build failed"
        return 1
    fi

    # Preview (for testing)
    log "   → Testing preview..."
    timeout 10 npm run preview > /dev/null 2>&1 &
    PREVIEW_PID=$!

    sleep 5

    if kill -0 $PREVIEW_PID 2>/dev/null; then
        log "   ✅ Preview working"
        kill $PREVIEW_PID 2>/dev/null
    else
        log "   ❌ Preview failed"
        return 1
    fi

    log "   ✅ $portal_name deployed successfully"
    log ""
}

# Main deployment process
main() {
    log "Starting deployment at $(date)"
    log "Environment: $STAGING_ENV"
    log "=========================================="
    log ""

    # Deploy Admin Portal
    if [ -d "admin-portal" ]; then
        deploy_portal "Admin Portal" "admin-portal" "$ADMIN_PORTAL_URL"
    else
        log "❌ admin-portal directory not found"
    fi

    # Deploy Tenant Portal
    if [ -d "tenant-portal" ]; then
        deploy_portal "Tenant Portal" "tenant-portal" "$TENANT_PORTAL_URL"
    else
        log "❌ tenant-portal directory not found"
    fi

    # Deploy Certification Portal
    if [ -d "certification/frontend" ]; then
        deploy_portal "Certification Frontend" "certification/frontend" "$CERTIFICATION_PORTAL_URL"
    else
        log "❌ certification/frontend directory not found"
    fi

    log "=========================================="
    log "✅ All portals deployed successfully!"
    log "📊 Deployment Summary:"
    log "   Admin Portal: $ADMIN_PORTAL_URL"
    log "   Tenant Portal: $TENANT_PORTAL_URL"
    log "   Certification Portal: $CERTIFICATION_PORTAL_URL"
    log ""
    log "📝 Log file: $LOG_FILE"
    log "Completed at $(date)"
}

# Execute
main
