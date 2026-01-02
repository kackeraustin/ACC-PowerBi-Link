# Azure Free Hosting Deployment Guide

This guide shows you how to deploy the ACC to Power BI Connector to Azure for **FREE** using your Office 365 work account.

## Table of Contents

1. [Free Hosting Options](#free-hosting-options)
2. [Option 1: Azure App Service (Recommended)](#option-1-azure-app-service-free-tier)
3. [Option 2: Azure Container Instances](#option-2-azure-container-instances)
4. [Option 3: Azure Virtual Machine](#option-3-azure-virtual-machine-free-tier)
5. [Configuring Power BI After Deployment](#configuring-power-bi-after-deployment)

## Free Hosting Options

With your Office 365 work account, you have access to Azure. Here are the FREE options:

### Azure Free Tier Includes:

- **Azure App Service** - Free F1 tier (1 GB RAM, 1 GB storage) - **RECOMMENDED**
- **Azure Container Instances** - Limited free tier
- **Virtual Machines** - B1S tier (750 hours/month free for 12 months)
- **Azure Functions** - 1 million requests/month free
- **$200 Azure Credit** - For first 30 days (new accounts)

## Prerequisites

1. Office 365 work account
2. Access to Azure Portal (https://portal.azure.com)
3. Git installed locally (optional, for deployment)
4. Azure CLI installed (optional, but recommended)

## Option 1: Azure App Service (Free Tier)

**RECOMMENDED** - Easiest option, always free, no credit card required for F1 tier.

### Step 1: Install Azure CLI (Optional but Recommended)

Download from: https://aka.ms/installazurecliwindows

Or use PowerShell:
```powershell
winget install -e --id Microsoft.AzureCLI
```

### Step 2: Login to Azure

```bash
az login
```

This will open your browser. Sign in with your Office 365 work account.

### Step 3: Create Resource Group

```bash
az group create --name acc-powerbi-rg --location eastus
```

### Step 4: Create App Service Plan (Free Tier)

```bash
az appservice plan create --name acc-powerbi-plan --resource-group acc-powerbi-rg --sku F1 --is-linux
```

**Note**: F1 is the FREE tier - no charges ever!

### Step 5: Create Web App

```bash
az webapp create --resource-group acc-powerbi-rg --plan acc-powerbi-plan --name acc-powerbi-connector-YOUR_INITIALS --runtime "NODE:18-lts"
```

Replace `YOUR_INITIALS` with your initials to make the name unique (e.g., `acc-powerbi-connector-jd`).

### Step 6: Configure Environment Variables

```bash
az webapp config appsettings set --resource-group acc-powerbi-rg --name acc-powerbi-connector-YOUR_INITIALS --settings APS_CLIENT_ID="your_client_id" APS_CLIENT_SECRET="your_client_secret" APS_CALLBACK_URL="https://acc-powerbi-connector-YOUR_INITIALS.azurewebsites.net/oauth/callback" NODE_ENV="production" CACHE_TTL="3600" LOG_LEVEL="info"
```

### Step 7: Deploy Your Code

#### Method A: Using Git Deployment (Recommended)

1. Initialize git in your project (if not already):
   ```bash
   cd "C:\Users\minio\source\ACC AEC PowerBI Connector"
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Get deployment credentials:
   ```bash
   az webapp deployment source config-local-git --name acc-powerbi-connector-YOUR_INITIALS --resource-group acc-powerbi-rg
   ```

3. Add Azure as remote:
   ```bash
   git remote add azure https://acc-powerbi-connector-YOUR_INITIALS.scm.azurewebsites.net:443/acc-powerbi-connector-YOUR_INITIALS.git
   ```

4. Deploy:
   ```bash
   git push azure main
   ```

#### Method B: Using ZIP Deployment

1. Build your project:
   ```bash
   npm run build
   ```

2. Create deployment package:
   ```bash
   powershell Compress-Archive -Path .\* -DestinationPath deploy.zip -Force
   ```

3. Deploy:
   ```bash
   az webapp deployment source config-zip --resource-group acc-powerbi-rg --name acc-powerbi-connector-YOUR_INITIALS --src deploy.zip
   ```

#### Method C: Using Azure Portal (No CLI Required)

1. Go to https://portal.azure.com
2. Click **Create a resource** → **Web App**
3. Fill in:
   - **Resource Group**: Create new "acc-powerbi-rg"
   - **Name**: acc-powerbi-connector-YOUR_INITIALS
   - **Runtime stack**: Node 18 LTS
   - **Operating System**: Linux
   - **Region**: East US
   - **Pricing plan**: Select **F1 (Free)**
4. Click **Review + Create** → **Create**
5. Once created, go to the resource
6. Go to **Configuration** → **Application settings**
7. Add each environment variable:
   - APS_CLIENT_ID
   - APS_CLIENT_SECRET
   - APS_CALLBACK_URL
   - NODE_ENV = production
   - CACHE_TTL = 3600
8. Click **Save**
9. Go to **Deployment Center**
10. Choose deployment source:
    - **GitHub** (if code is on GitHub)
    - **Local Git**
    - **FTP** (upload files manually)

### Step 8: Verify Deployment

Visit your app:
```
https://acc-powerbi-connector-YOUR_INITIALS.azurewebsites.net/health
```

You should see:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "version": "1.0.0"
}
```

### Step 9: Test API Endpoints

```
https://acc-powerbi-connector-YOUR_INITIALS.azurewebsites.net/api/acc/hubs
```

## Option 2: Azure Container Instances

Deploy using Docker containers.

### Step 1: Build Docker Image Locally

```bash
cd "C:\Users\minio\source\ACC AEC PowerBI Connector"
docker build -t acc-powerbi-connector .
```

### Step 2: Create Azure Container Registry (Optional - Free tier available)

```bash
az acr create --resource-group acc-powerbi-rg --name accpowerbiregistry --sku Basic
```

### Step 3: Push Image to Registry

```bash
az acr login --name accpowerbiregistry
docker tag acc-powerbi-connector accpowerbiregistry.azurecr.io/acc-powerbi-connector:v1
docker push accpowerbiregistry.azurecr.io/acc-powerbi-connector:v1
```

### Step 4: Deploy Container

```bash
az container create --resource-group acc-powerbi-rg --name acc-powerbi-container --image accpowerbiregistry.azurecr.io/acc-powerbi-connector:v1 --dns-name-label acc-powerbi-YOUR_INITIALS --ports 8080 --environment-variables APS_CLIENT_ID="your_client_id" APS_CLIENT_SECRET="your_client_secret" NODE_ENV="production"
```

### Step 5: Get Container URL

```bash
az container show --resource-group acc-powerbi-rg --name acc-powerbi-container --query ipAddress.fqdn
```

Visit: `http://[FQDN]:8080/health`

## Option 3: Azure Virtual Machine (Free Tier)

12 months free with B1S instance.

### Step 1: Create VM

```bash
az vm create --resource-group acc-powerbi-rg --name acc-powerbi-vm --image Ubuntu2204 --size Standard_B1s --admin-username azureuser --generate-ssh-keys
```

### Step 2: Open Port 3000

```bash
az vm open-port --port 3000 --resource-group acc-powerbi-rg --name acc-powerbi-vm
```

### Step 3: SSH into VM

```bash
ssh azureuser@[VM_IP_ADDRESS]
```

### Step 4: Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs git
```

### Step 5: Clone and Setup Application

```bash
git clone [YOUR_REPO_URL]
cd "ACC AEC PowerBI Connector"
npm install
npm run build
```

### Step 6: Setup Environment Variables

```bash
nano .env
```

Add your credentials, save (Ctrl+X, Y, Enter).

### Step 7: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
pm2 start dist/index.js --name acc-powerbi-connector
pm2 startup
pm2 save
```

### Step 8: Access Your App

Visit: `http://[VM_IP_ADDRESS]:3000/health`

## Configuring Power BI After Deployment

Once deployed, update your Power BI queries to use the Azure URL.

### Update Power Query URLs

Replace `http://localhost:3000` with your Azure URL:

**Before:**
```
http://localhost:3000/api/acc/hubs
```

**After:**
```
https://acc-powerbi-connector-YOUR_INITIALS.azurewebsites.net/api/acc/hubs
```

### Create Parameters in Power BI

1. In Power BI Desktop, go to **Transform Data**
2. Click **Manage Parameters** → **New Parameter**
3. Create parameter:
   - **Name**: BaseURL
   - **Type**: Text
   - **Current Value**: https://acc-powerbi-connector-YOUR_INITIALS.azurewebsites.net
4. Update your queries to use the parameter:

```m
let
    BaseURL = BaseURL,
    Source = Json.Document(Web.Contents(BaseURL & "/api/acc/hubs"))
in
    Source
```

## Cost Monitoring

### Free Tier Limits (App Service F1)

- **Always FREE** - No expiration
- **1 GB RAM**
- **1 GB Storage**
- **60 CPU minutes/day**
- **No custom domains** (uses .azurewebsites.net)
- **No SSL for custom domains** (SSL included for .azurewebsites.net)

### Monitor Usage

Check your usage:
```bash
az monitor metrics list --resource /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/acc-powerbi-rg/providers/Microsoft.Web/sites/acc-powerbi-connector-YOUR_INITIALS --metric-names CpuTime,MemoryWorkingSet
```

Or use Azure Portal:
1. Go to your App Service
2. Click **Metrics** in the left menu
3. Monitor CPU Time, Memory, Requests

## Scaling Options (When Needed)

If you outgrow the free tier:

### App Service Tiers

- **Free F1**: $0/month - Current tier
- **Shared D1**: ~$10/month - More CPU time
- **Basic B1**: ~$55/month - Custom domains, SSL, more resources
- **Standard S1**: ~$70/month - Auto-scaling, staging slots

To upgrade:
```bash
az appservice plan update --name acc-powerbi-plan --resource-group acc-powerbi-rg --sku B1
```

## Troubleshooting

### App Won't Start

1. Check logs:
   ```bash
   az webapp log tail --name acc-powerbi-connector-YOUR_INITIALS --resource-group acc-powerbi-rg
   ```

2. Verify environment variables are set:
   ```bash
   az webapp config appsettings list --name acc-powerbi-connector-YOUR_INITIALS --resource-group acc-powerbi-rg
   ```

### Connection Timeout

- Free tier has 60-second timeout limit
- Optimize slow queries
- Consider caching more aggressively

### Out of Memory

- Free tier has 1 GB RAM limit
- Reduce cache size
- Process data in smaller chunks
- Consider upgrading to Basic tier

### Deployment Fails

1. Check build logs in Azure Portal:
   - Go to App Service → Deployment Center → Logs

2. Verify package.json has correct scripts:
   ```json
   "scripts": {
     "build": "tsc",
     "start": "node dist/index.js"
   }
   ```

3. Ensure all dependencies are in `dependencies`, not `devDependencies`

## Security Best Practices

### Use Azure Key Vault for Secrets

Instead of environment variables, use Key Vault (free tier available):

```bash
az keyvault create --name acc-powerbi-kv-YOUR_INITIALS --resource-group acc-powerbi-rg --location eastus
az keyvault secret set --vault-name acc-powerbi-kv-YOUR_INITIALS --name APS-CLIENT-ID --value "your_client_id"
az keyvault secret set --vault-name acc-powerbi-kv-YOUR_INITIALS --name APS-CLIENT-SECRET --value "your_client_secret"
```

Update app to use Key Vault (requires code changes).

### Enable HTTPS Only

```bash
az webapp update --resource-group acc-powerbi-rg --name acc-powerbi-connector-YOUR_INITIALS --https-only true
```

### Enable Managed Identity

```bash
az webapp identity assign --resource-group acc-powerbi-rg --name acc-powerbi-connector-YOUR_INITIALS
```

## Backup and Recovery

### Backup Configuration

```bash
az webapp config backup create --resource-group acc-powerbi-rg --webapp-name acc-powerbi-connector-YOUR_INITIALS --backup-name backup1 --container-url "[STORAGE_CONTAINER_URL_WITH_SAS]"
```

### Export App Settings

```bash
az webapp config appsettings list --name acc-powerbi-connector-YOUR_INITIALS --resource-group acc-powerbi-rg > appsettings-backup.json
```

## Continuous Deployment (CI/CD)

### Using GitHub Actions

Create `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm ci

    - name: Build
      run: npm run build

    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'acc-powerbi-connector-YOUR_INITIALS'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: .
```

## Alternative Free Hosting Options

If you don't want to use Azure:

1. **Railway.app** - $5 free credit/month
2. **Render.com** - Free tier for web services (spins down after inactivity)
3. **Fly.io** - Free tier with limitations
4. **Oracle Cloud** - Always free tier (2 VMs)
5. **Google Cloud Run** - 2 million requests/month free

## Summary of Costs

| Service | Free Tier | Limitations |
|---------|-----------|-------------|
| **App Service F1** | Forever Free | 60 CPU min/day, 1GB RAM |
| **Container Instances** | Pay per second | ~$0.0000012/second |
| **VM B1S** | 12 months free | After 12 months: ~$10/month |
| **Azure Functions** | 1M requests/month | Cold starts |

**Recommendation**: Use **App Service F1** - it's free forever and easiest to set up.

## Next Steps

1. Deploy to Azure using Option 1 (App Service)
2. Test all endpoints
3. Update Power BI to use Azure URL
4. Set up monitoring and alerts
5. Configure auto-scaling if needed (paid tier)

## Support Resources

- [Azure Free Account](https://azure.microsoft.com/free)
- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [Azure CLI Reference](https://docs.microsoft.com/cli/azure/)
- [Power BI Gateway Setup](https://docs.microsoft.com/power-bi/connect-data/service-gateway-onprem)

Your application is now accessible 24/7 from anywhere, and Power BI can connect to it directly!

**Sources:**
- [Explore Free Azure Services](https://azure.microsoft.com/en-us/pricing/free-services)
- [Node.js App Hosting & Deployment | Microsoft Azure](https://azure.microsoft.com/en-us/resources/developers/nodejs)
- [Run Node.js code in the cloud with your Azure free account](https://azure.microsoft.com/en-us/free/nodejs)
- [Quickstart: Create a Node.js Web App - Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/quickstart-nodejs)
