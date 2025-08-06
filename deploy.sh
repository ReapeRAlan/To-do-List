#!/bin/bash

# AWS EC2 Deployment Script for ToDo List App
# This script will deploy the ToDo List App to an AWS EC2 instance

set -e

echo "🚀 Starting deployment to AWS EC2..."

# Configuration
APP_NAME="todo-list-app"
DOCKER_IMAGE="$APP_NAME:latest"
CONTAINER_NAME="$APP_NAME-container"
PORT=80

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

print_status "Docker is installed"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_warning "Docker Compose not found. Installing..."
    sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed"
fi

# Stop and remove existing container if it exists
if [ $(docker ps -a -q -f name=$CONTAINER_NAME) ]; then
    print_status "Stopping existing container..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

# Remove existing image if it exists
if [ $(docker images -q $DOCKER_IMAGE) ]; then
    print_status "Removing existing image..."
    docker rmi $DOCKER_IMAGE
fi

# Build the Docker image
print_status "Building Docker image..."
docker build -t $DOCKER_IMAGE .

# Run the container
print_status "Starting container..."
docker run -d \
    --name $CONTAINER_NAME \
    --restart unless-stopped \
    -p $PORT:80 \
    $DOCKER_IMAGE

# Wait a moment for the container to start
sleep 5

# Check if container is running
if [ $(docker ps -q -f name=$CONTAINER_NAME) ]; then
    print_status "Container is running successfully!"
    
    # Get the public IP (works on EC2)
    PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "localhost")
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "📱 Your ToDo List App is now available at:"
    echo "   http://$PUBLIC_IP"
    
    if [ "$PUBLIC_IP" != "localhost" ]; then
        echo "   http://$PUBLIC_IP:$PORT (if port 80 is blocked)"
    fi
    
    echo ""
    echo "📊 Container status:"
    docker ps -f name=$CONTAINER_NAME
    
    echo ""
    echo "📝 To view logs: docker logs $CONTAINER_NAME"
    echo "🔄 To restart: docker restart $CONTAINER_NAME"
    echo "🛑 To stop: docker stop $CONTAINER_NAME"
    
else
    print_error "Failed to start container"
    print_error "Check logs with: docker logs $CONTAINER_NAME"
    exit 1
fi
