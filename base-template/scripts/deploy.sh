#!/bin/bash

# NEO_STACK Base Template - Deploy Script
# This script deploys the application using Docker

set -e

echo "🚀 Deploying NEO_STACK..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker and try again."
    exit 1
fi

echo "✅ Docker detected"

# Build Docker image
echo ""
echo "🐳 Building Docker image..."
IMAGE_NAME="neo-stack-app"
IMAGE_TAG="latest"

docker build -t $IMAGE_NAME:$IMAGE_TAG .

echo ""
echo "✅ Docker image built successfully!"
echo ""
echo "Image name: $IMAGE_NAME:$IMAGE_TAG"
echo ""

# Ask if user wants to run the container
read -p "Do you want to run the container now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Running container..."
    CONTAINER_PORT=3000
    HOST_PORT=3000

    docker run -d \
        --name neo-stack-app \
        -p $HOST_PORT:$CONTAINER_PORT \
        --env-file .env \
        --restart unless-stopped \
        $IMAGE_NAME:$IMAGE_TAG

    echo ""
    echo "✅ Container started successfully!"
    echo ""
    echo "🌐 Application is running at:"
    echo "   http://localhost:$HOST_PORT"
    echo ""
    echo "To view logs:"
    echo "   docker logs -f neo-stack-app"
    echo ""
    echo "To stop the container:"
    echo "   docker stop neo-stack-app"
    echo "   docker rm neo-stack-app"
else
    echo "✅ Image built and ready for deployment"
    echo ""
    echo "To run the container later:"
    echo "   docker run -d --name neo-stack-app -p 3000:3000 --env-file .env $IMAGE_NAME:$IMAGE_TAG"
    echo ""
fi
