# Test your app locally:
python -m http.server 8000

# Or if you have Node.js:
npx http-server -p 8000

# Then open: http://localhost:8000

# Docker commands:
docker build -t todo-list-app .
docker run -d -p 80:80 --name todo-app todo-list-app
docker logs todo-app
docker stop todo-app

# Docker Compose:
docker-compose up -d
docker-compose down

# AWS EC2 commands:
chmod +x deploy.sh
./deploy.sh

# Or on Windows:
deploy.bat
