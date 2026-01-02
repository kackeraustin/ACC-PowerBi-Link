# Quick Start Guide

Get up and running with ACC to Power BI Connector in 5 minutes.

## Step 1: Install Dependencies

```bash
cd "C:\Users\minio\source\ACC AEC PowerBI Connector"
npm install
```

## Step 2: Configure Credentials

1. Copy the environment template:
   ```bash
   copy .env.example .env
   ```

2. Edit `.env` and add your Autodesk Platform Services credentials:
   ```env
   APS_CLIENT_ID=your_client_id_here
   APS_CLIENT_SECRET=your_client_secret_here
   ```

**Don't have credentials?**
- Go to https://aps.autodesk.com/
- Create an account or sign in
- Create a new app
- Select ACC APIs
- Copy Client ID and Client Secret

## Step 3: Start the Connector

```bash
npm run dev
```

You should see:
```
ACC to Power BI Connector running on port 3000
Environment: development
```

## Step 4: Test the Connection

Open your browser and visit:
```
http://localhost:3000/health
```

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-02T...",
  "version": "1.0.0"
}
```

## Step 5: Find Your IDs

### Get your Hub ID:
```
http://localhost:3000/api/acc/hubs
```

Copy the `hubId` from the response.

### Get your Project ID:
Replace `{hubId}` with your hub ID:
```
http://localhost:3000/api/acc/hubs/{hubId}/projects
```

Copy the `projectId` from the response.

## Step 6: Connect Power BI

1. Open **Power BI Desktop**
2. Click **Get Data** → **Web**
3. Enter this URL (replace with your IDs):
   ```
   http://localhost:3000/api/acc/projects/YOUR_PROJECT_ID/all?hubId=YOUR_HUB_ID&containerId=YOUR_PROJECT_ID
   ```
4. Click **OK**
5. Select **Anonymous** authentication
6. Click **Connect**
7. Expand the data columns you want
8. Click **Close & Apply**

## Step 7: Create Your First Visual

1. Drag fields to create visualizations:
   - **issues → issueId** (Count) → Card visual
   - **issues → status** → Pie chart
   - **costData → budgeted, actual** → Bar chart

2. Start building your dashboard!

## Next Steps

- Read the full [README.md](README.md) for detailed features
- Check out [POWER_BI_SETUP_GUIDE.md](POWER_BI_SETUP_GUIDE.md) for advanced examples
- Explore all available endpoints in the API documentation

## Troubleshooting

**Problem**: "Authentication failed"
- **Solution**: Check your Client ID and Secret in `.env`

**Problem**: "Empty data"
- **Solution**: Verify your project contains data (issues, assets, etc.)

**Problem**: "Connection refused"
- **Solution**: Make sure the connector is running (`npm run dev`)

## Support

For issues or questions:
- Check the logs in `logs/combined.log`
- Review the full documentation
- Visit https://aps.autodesk.com/en/docs/acc/v1/overview/

## Summary of Endpoints

- `/health` - Check server status
- `/api/acc/hubs` - Get all hubs
- `/api/acc/hubs/:hubId/projects` - Get projects
- `/api/acc/projects/:projectId/issues` - Get issues
- `/api/acc/projects/:projectId/assets` - Get assets
- `/api/acc/projects/:projectId/cost` - Get cost data
- `/api/acc/projects/:projectId/forms` - Get forms
- `/api/acc/projects/:projectId/locations` - Get locations
- `/api/acc/projects/:projectId/all` - Get everything

Happy analyzing!
