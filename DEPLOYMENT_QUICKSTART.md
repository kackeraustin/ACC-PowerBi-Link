# Deploy to Azure in 5 Minutes (FREE)

The fastest way to get your ACC connector running in the cloud for free.

## Prerequisites

- Office 365 work account
- APS Client ID and Secret (from https://aps.autodesk.com)

## Step 1: Login to Azure Portal

Go to: https://portal.azure.com

Sign in with your Office 365 work account.

## Step 2: Create Web App

1. Click **Create a resource** (top left)
2. Search for **Web App**
3. Click **Create**

## Step 3: Configure Web App

Fill in the form:

### Basics Tab

- **Subscription**: Select your subscription
- **Resource Group**: Click "Create new" → Name it `acc-powerbi-rg`
- **Name**: `acc-powerbi-connector-[YOUR_INITIALS]` (e.g., `acc-powerbi-connector-jd`)
- **Publish**: Code
- **Runtime stack**: Node 18 LTS
- **Operating System**: Linux
- **Region**: East US (or closest to you)

### Pricing Tab

- **Pricing plan**: Click "Explore pricing plans"
- Select **F1 (Free)** - $0.00/month
- Click **Select**

Click **Review + Create** → **Create**

Wait 1-2 minutes for deployment to complete.

## Step 4: Configure Environment Variables

1. Click **Go to resource**
2. In left menu, click **Configuration**
3. Click **+ New application setting** for each:

| Name | Value |
|------|-------|
| `APS_CLIENT_ID` | Your Autodesk client ID |
| `APS_CLIENT_SECRET` | Your Autodesk client secret |
| `APS_CALLBACK_URL` | `https://acc-powerbi-connector-YOUR_INITIALS.azurewebsites.net/oauth/callback` |
| `NODE_ENV` | `production` |
| `CACHE_TTL` | `3600` |
| `LOG_LEVEL` | `info` |

4. Click **Save** at the top
5. Click **Continue** when prompted

## Step 5: Deploy Code

### Option A: Using Local Git (Recommended)

1. In Azure Portal, go to **Deployment Center** (left menu)
2. Select **Local Git**
3. Click **Save**
4. Copy the **Git Clone Uri**

On your computer:

```bash
cd "C:\Users\minio\source\ACC AEC PowerBI Connector"

# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit"

# Add Azure remote (replace URL with your Git Clone Uri)
git remote add azure https://acc-powerbi-connector-YOUR_INITIALS.scm.azurewebsites.net:443/acc-powerbi-connector-YOUR_INITIALS.git

# Push to Azure
git push azure main
```

You'll be prompted for credentials. Use:
- Username: From Azure Portal → Deployment Center → Local Git/FTPS credentials
- Password: From Azure Portal → Deployment Center → Local Git/FTPS credentials

### Option B: Using ZIP Upload

1. Build your project:
   ```bash
   cd "C:\Users\minio\source\ACC AEC PowerBI Connector"
   npm install
   npm run build
   ```

2. Create a zip file of everything except `node_modules`:
   - Right-click the folder
   - Send to → Compressed (zipped) folder

3. In Azure Portal:
   - Go to **Advanced Tools** (left menu)
   - Click **Go**
   - In top menu, click **Tools** → **Zip Push Deploy**
   - Drag your zip file to the browser

### Option C: Using FTP (Easiest)

1. In Azure Portal, go to **Deployment Center**
2. Click **FTPS credentials** tab
3. Copy:
   - FTPS endpoint
   - Username
   - Password

4. Use FileZilla or Windows File Explorer:
   - Open File Explorer
   - In address bar, paste the FTP endpoint
   - Enter username and password
   - Upload all files to `/site/wwwroot`

## Step 6: Restart App

1. In Azure Portal, go to **Overview**
2. Click **Restart** at the top
3. Wait 30 seconds

## Step 7: Test Your App

Visit:
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

## Step 8: Get Your Data

Test these URLs in your browser:

**Get Hubs:**
```
https://acc-powerbi-connector-YOUR_INITIALS.azurewebsites.net/api/acc/hubs
```

**Get Projects (replace {hubId}):**
```
https://acc-powerbi-connector-YOUR_INITIALS.azurewebsites.net/api/acc/hubs/{hubId}/projects
```

## Step 9: Connect Power BI

1. Open Power BI Desktop
2. **Get Data** → **Web**
3. Enter URL:
   ```
   https://acc-powerbi-connector-YOUR_INITIALS.azurewebsites.net/api/acc/projects/YOUR_PROJECT_ID/all?hubId=YOUR_HUB_ID&containerId=YOUR_CONTAINER_ID
   ```
4. Click **OK** → **Anonymous** → **Connect**
5. Expand columns and create visualizations

## Troubleshooting

### App won't start

1. Go to **Log stream** in left menu
2. Watch for errors
3. Check environment variables are set correctly

### "Application Error"

- Wait 2-3 minutes after deployment
- Click **Restart** in Overview
- Check logs

### Authentication errors

- Verify `APS_CLIENT_ID` and `APS_CLIENT_SECRET` are correct
- Check they don't have extra spaces

## Your Azure URLs

Replace `YOUR_INITIALS` with your actual initials:

- **App URL**: `https://acc-powerbi-connector-YOUR_INITIALS.azurewebsites.net`
- **Health Check**: `https://acc-powerbi-connector-YOUR_INITIALS.azurewebsites.net/health`
- **API Base**: `https://acc-powerbi-connector-YOUR_INITIALS.azurewebsites.net/api/acc`

## Cost: $0.00

The F1 Free tier is:
- **Always free** - No expiration
- **No credit card required**
- **1 GB RAM, 1 GB storage**
- **60 CPU minutes per day**

Perfect for this application!

## Next Steps

- See AZURE_DEPLOYMENT.md for advanced options
- See POWER_BI_SETUP_GUIDE.md for creating dashboards
- Monitor usage in Azure Portal → Metrics

Congratulations! Your connector is now running 24/7 in the cloud for FREE!
