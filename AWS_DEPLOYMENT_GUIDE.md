# AWS EC2 Setup Guide for ToDo List App

This guide will walk you through setting up an AWS EC2 instance and deploying the ToDo List application.

## 1. Create AWS EC2 Instance

### Step 1: Launch EC2 Instance
1. Log in to AWS Console
2. Navigate to EC2 Dashboard
3. Click "Launch Instance"
4. Choose "Ubuntu Server 20.04 LTS (HVM), SSD Volume Type"
5. Select instance type: `t2.micro` (free tier eligible)
6. Configure instance details (use defaults for basic setup)
7. Add storage: 8 GB gp2 (default is fine)

### Step 2: Configure Security Group
Create a new security group with these rules:
- **SSH**: Port 22, Source: Your IP
- **HTTP**: Port 80, Source: 0.0.0.0/0
- **HTTPS**: Port 443, Source: 0.0.0.0/0 (optional, for SSL)

### Step 3: Create and Download Key Pair
1. Create a new key pair or use existing one
2. Download the `.pem` file
3. Store it securely

## 2. Connect to EC2 Instance

### Windows (using PuTTY):
1. Convert `.pem` to `.ppk` using PuTTYgen
2. Use PuTTY to connect with the `.ppk` file

### Windows (using PowerShell/CMD):
```powershell
ssh -i "path\to\your-key.pem" ubuntu@your-ec2-public-ip
```

### Linux/Mac:
```bash
chmod 400 your-key.pem
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

## 3. Install Docker on EC2

```bash
# Update the system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install docker.io -y

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Logout and login again to apply group changes
exit
```

## 4. Deploy the Application

### Method 1: Using Git (Recommended)
```bash
# Clone the repository
git clone <your-repository-url> todo-app
cd todo-app

# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### Method 2: Upload Files Manually
```bash
# From your local machine, upload files to EC2
scp -i "your-key.pem" -r ./UAWS ubuntu@your-ec2-public-ip:~/todo-app/

# Then on EC2
cd todo-app
chmod +x deploy.sh
./deploy.sh
```

### Method 3: Manual Docker Commands
```bash
# Build the image
docker build -t todo-list-app .

# Run the container
docker run -d \
    --name todo-app \
    --restart unless-stopped \
    -p 80:80 \
    todo-list-app

# Check if it's running
docker ps
```

## 5. Access Your Application

1. Get your EC2 public IP from AWS Console
2. Open browser and navigate to: `http://your-ec2-public-ip`
3. Your ToDo List App should be running!

## 6. Domain Setup (Optional)

### Step 1: Get a Domain
- Purchase a domain from Route 53, GoDaddy, Namecheap, etc.

### Step 2: Configure DNS
1. In your domain registrar, set nameservers to AWS Route 53 (if using Route 53)
2. Create an A record pointing to your EC2 public IP

### Step 3: Setup SSL Certificate
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Stop the container temporarily
docker stop todo-app

# Install Nginx
sudo apt install nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Update nginx configuration to proxy to Docker container
sudo nano /etc/nginx/sites-available/default
```

Example Nginx configuration for SSL:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then restart services:
```bash
# Run container on port 8080 instead of 80
docker stop todo-app
docker rm todo-app
docker run -d --name todo-app --restart unless-stopped -p 8080:80 todo-list-app

# Restart nginx
sudo systemctl restart nginx
```

## 7. Monitoring and Maintenance

### Check Application Status
```bash
# Check container status
docker ps

# View container logs
docker logs todo-app

# Check resource usage
docker stats todo-app

# Check nginx status (if using SSL)
sudo systemctl status nginx
```

### Backup and Updates
```bash
# Create backup of container
docker commit todo-app todo-app-backup

# Update application
git pull origin main
docker build -t todo-list-app .
docker stop todo-app
docker rm todo-app
docker run -d --name todo-app --restart unless-stopped -p 80:80 todo-list-app
```

### Security Best Practices
1. Regularly update the EC2 instance: `sudo apt update && sudo apt upgrade`
2. Configure firewall: `sudo ufw enable`
3. Set up CloudWatch monitoring
4. Use IAM roles instead of access keys
5. Enable EC2 instance backup (snapshots)

## 8. Troubleshooting

### Common Issues

**Container won't start:**
```bash
docker logs todo-app
```

**Port 80 is busy:**
```bash
sudo lsof -i :80
# Kill the process or use different port
docker run -d --name todo-app -p 8080:80 todo-list-app
```

**Permission denied:**
```bash
sudo usermod -aG docker ubuntu
# Logout and login again
```

**Can't access from browser:**
- Check security group allows HTTP (port 80)
- Verify EC2 public IP
- Check if container is running: `docker ps`

### Useful Commands
```bash
# Restart container
docker restart todo-app

# Update and redeploy
git pull && docker build -t todo-list-app . && docker stop todo-app && docker rm todo-app && docker run -d --name todo-app --restart unless-stopped -p 80:80 todo-list-app

# View system resources
htop
df -h
free -h

# Check nginx logs (if using SSL)
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## 9. Cost Optimization

- Use `t2.micro` instance (free tier)
- Stop instance when not needed
- Use Elastic IP if you need static IP
- Monitor usage with CloudWatch
- Set up billing alerts

Your ToDo List App should now be successfully deployed on AWS EC2! 🚀
