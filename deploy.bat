@echo off
REM Windows deployment script for ToDo List App

echo 🚀 Starting deployment to AWS EC2...

set APP_NAME=todo-list-app
set DOCKER_IMAGE=%APP_NAME%:latest
set CONTAINER_NAME=%APP_NAME%-container
set PORT=80

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

echo ✓ Docker is installed

REM Stop and remove existing container if it exists
docker ps -a -q -f name=%CONTAINER_NAME% >nul 2>&1
if not errorlevel 1 (
    echo ✓ Stopping existing container...
    docker stop %CONTAINER_NAME%
    docker rm %CONTAINER_NAME%
)

REM Remove existing image if it exists
docker images -q %DOCKER_IMAGE% >nul 2>&1
if not errorlevel 1 (
    echo ✓ Removing existing image...
    docker rmi %DOCKER_IMAGE%
)

REM Build the Docker image
echo ✓ Building Docker image...
docker build -t %DOCKER_IMAGE% .

REM Run the container
echo ✓ Starting container...
docker run -d --name %CONTAINER_NAME% --restart unless-stopped -p %PORT%:80 %DOCKER_IMAGE%

REM Wait a moment for the container to start
timeout /t 5 /nobreak >nul

REM Check if container is running
docker ps -q -f name=%CONTAINER_NAME% >nul 2>&1
if not errorlevel 1 (
    echo ✓ Container is running successfully!
    echo.
    echo 🎉 Deployment completed successfully!
    echo 📱 Your ToDo List App is now available at:
    echo    http://localhost
    echo    http://YOUR_EC2_PUBLIC_IP
    echo.
    echo 📊 Container status:
    docker ps -f name=%CONTAINER_NAME%
    echo.
    echo 📝 To view logs: docker logs %CONTAINER_NAME%
    echo 🔄 To restart: docker restart %CONTAINER_NAME%
    echo 🛑 To stop: docker stop %CONTAINER_NAME%
) else (
    echo ✗ Failed to start container
    echo ✗ Check logs with: docker logs %CONTAINER_NAME%
    pause
    exit /b 1
)

pause
