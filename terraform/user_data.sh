#!/bin/bash
set -e

# Configurar 2GB de memoria Swap para soportar SQL Server Express en t2.micro (1GB RAM)
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Actualizar paquetes
apt-get update
apt-get upgrade -y

# Instalar Docker
apt-get install -y apt-transport-https ca-certificates curl software-properties-common git python3-pip python3-venv

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose

# Iniciar MS SQL Server Express 2022 en Docker
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=PasswordSeguro123!" -p 1433:1433 --name sqlserver --restart unless-stopped -d mcr.microsoft.com/mssql/server:2022-latest

# Instalar ODBC Driver 18 for SQL Server (requerido por pyodbc)
curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add -
curl https://packages.microsoft.com/config/ubuntu/22.04/prod.list > /etc/apt/sources.list.d/mssql-release.list
apt-get update
ACCEPT_EULA=Y apt-get install -y msodbcsql18 unixodbc-dev

# Esperar a que SQL Server inicie
sleep 30

# Crear la base de datos usando sqlcmd (via docker exec)
docker exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'PasswordSeguro123!' -C -Q "CREATE DATABASE NexusDB"

# Clonar el repositorio de Nexus
git clone https://github.com/MasterPieceDR/Nexus.git /opt/nexus
cd /opt/nexus/backend

# Preparar Python
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Crear archivo .env base para la app
cat << 'EOF' > .env
APP_NAME=Nexus API
APP_ENV=production
APP_HOST=0.0.0.0
APP_PORT=8000
DB_DRIVER=ODBC Driver 18 for SQL Server
DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=NexusDB
DB_USER=SA
DB_PASSWORD=PasswordSeguro123!
DB_TRUST_CERTIFICATE=yes
DB_ENCRYPT=yes
JWT_SECRET_KEY=nexus_super_secret_key_change_me_in_prod
AWS_REGION=us-east-1
EOF

# Crear un servicio systemd para FastAPI (asumiendo que el repo está clonado)
cat << 'EOF' > /etc/systemd/system/nexus-api.service
[Unit]
Description=Nexus FastAPI Service
After=network.target

[Service]
User=root
WorkingDirectory=/opt/nexus/backend
Environment="PATH=/opt/nexus/backend/.venv/bin"
ExecStart=/opt/nexus/backend/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable nexus-api
systemctl start nexus-api
