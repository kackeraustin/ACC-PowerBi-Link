# ACC to Power BI Connector

A comprehensive Node.js/TypeScript application that connects Autodesk Construction Cloud (ACC) project data to Power BI dashboards, enabling advanced analytics and reporting for construction projects.

## Features

- **OAuth 2.0 Authentication** with Autodesk Platform Services (APS)
- **Multiple Data Sources** from ACC:
  - Projects and Hubs
  - Issues Management
  - Assets Tracking
  - Cost Management
  - Forms and Inspections
  - Location Trees
- **Data Transformation** optimized for Power BI consumption
- **Intelligent Caching** to reduce API calls and improve performance
- **RESTful API** endpoints for easy Power BI integration
- **Comprehensive Logging** with Winston
- **Error Handling** and validation

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Autodesk Platform Services (APS) account
- ACC project access
- Power BI Desktop or Power BI Service

## Installation

### 1. Clone or Download the Repository

```bash
cd "C:\Users\minio\source\ACC AEC PowerBI Connector"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
copy .env.example .env
```

Edit `.env` and add your APS credentials:

```env
APS_CLIENT_ID=your_client_id_here
APS_CLIENT_SECRET=your_client_secret_here
APS_CALLBACK_URL=http://localhost:3000/oauth/callback
PORT=3000
NODE_ENV=development
CACHE_TTL=3600
LOG_LEVEL=info
```

### 4. Get APS Credentials

1. Go to [Autodesk Platform Services](https://aps.autodesk.com/)
2. Sign in or create an account
3. Create a new application
4. Select the following APIs:
   - Data Management API
   - ACC Admin API
   - ACC Issues API
   - ACC Assets API
   - ACC Cost Management API
5. Copy your **Client ID** and **Client Secret**

## Building and Running

### Development Mode

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## API Endpoints

### Health Check

```
GET /health
```

Returns server status and version information.

### Hubs

```
GET /api/acc/hubs
```

Retrieves all available ACC hubs.

### Projects

```
GET /api/acc/hubs/:hubId/projects
```

Retrieves all projects for a specific hub.

**Parameters:**
- `hubId` - The hub ID

### Issues

```
GET /api/acc/projects/:projectId/issues?containerId={containerId}
```

Retrieves all issues for a project.

**Parameters:**
- `projectId` - The project ID
- `containerId` - The container/project ID (query parameter)

### Assets

```
GET /api/acc/projects/:projectId/assets
```

Retrieves all assets for a project.

### Cost Data

```
GET /api/acc/projects/:projectId/cost
```

Retrieves cost/budget information for a project.

### Forms

```
GET /api/acc/projects/:projectId/forms
```

Retrieves all forms/inspections for a project.

### Locations

```
GET /api/acc/projects/:projectId/locations
```

Retrieves the location tree for a project.

### All Project Data

```
GET /api/acc/projects/:projectId/all?hubId={hubId}&containerId={containerId}
```

Retrieves all available data for a project in one request.

**Parameters:**
- `projectId` - The project ID
- `hubId` - The hub ID (query parameter)
- `containerId` - The container ID (query parameter)

### Cache Management

```
POST /api/acc/cache/clear
```

Clears all cached data.

```
GET /api/acc/cache/stats
```

Returns cache statistics.

## Power BI Integration

### Method 1: Web Data Source (Recommended)

1. Open Power BI Desktop
2. Click **Get Data** > **Web**
3. Enter the API endpoint URL, for example:
   ```
   http://localhost:3000/api/acc/hubs
   ```
4. Click **OK**
5. If prompted, select **Anonymous** authentication
6. Click **Connect**
7. Power BI will load the JSON data
8. Click **To Table** to convert to table format
9. Expand columns as needed
10. Click **Close & Apply**

### Method 2: Advanced Query (M Language)

1. In Power BI Desktop, go to **Get Data** > **Blank Query**
2. Open **Advanced Editor**
3. Use this template:

```m
let
    Source = Json.Document(Web.Contents("http://localhost:3000/api/acc/projects/YOUR_PROJECT_ID/all?hubId=YOUR_HUB_ID&containerId=YOUR_CONTAINER_ID")),
    Issues = Source[issues],
    IssuesToTable = Table.FromList(Issues, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    ExpandedIssues = Table.ExpandRecordColumn(IssuesToTable, "Column1", {"issueId", "title", "status", "priority", "assignedTo", "dueDate", "createdAt"})
in
    ExpandedIssues
```

### Method 3: Power Query Functions

Create reusable functions for each data type:

```m
(projectId as text, hubId as text, containerId as text) =>
let
    BaseUrl = "http://localhost:3000/api/acc",
    Url = BaseUrl & "/projects/" & projectId & "/issues?containerId=" & containerId,
    Source = Json.Document(Web.Contents(Url)),
    ToTable = Table.FromList(Source, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    Expanded = Table.ExpandRecordColumn(ToTable, "Column1",
        {"issueId", "title", "status", "priority", "assignedTo", "dueDate", "createdAt", "createdBy"})
in
    Expanded
```

## Data Refresh

### Automatic Refresh

Set up automatic refresh in Power BI:

1. Publish your report to Power BI Service
2. Go to **Settings** for your dataset
3. Configure **Scheduled refresh**
4. Set refresh frequency (e.g., daily, hourly)

### Manual Refresh

In Power BI Desktop, click **Refresh** on the Home ribbon.

## Caching Strategy

The connector uses intelligent caching to optimize performance:

- **Default TTL**: 3600 seconds (1 hour)
- **Configurable**: Set `CACHE_TTL` in `.env`
- **Selective Caching**: Different cache durations for different data types
- **Cache Clearing**: Use the `/api/acc/cache/clear` endpoint to force refresh

## Logging

Logs are stored in the `logs/` directory:

- `combined.log` - All log messages
- `error.log` - Error messages only

Configure log level in `.env`:
- `error` - Only errors
- `warn` - Warnings and errors
- `info` - Informational, warnings, and errors (default)
- `debug` - All messages including debug info

## Troubleshooting

### Authentication Errors

**Error**: "Authentication failed"

**Solution**:
- Verify your `APS_CLIENT_ID` and `APS_CLIENT_SECRET` in `.env`
- Ensure your APS app has the correct API access enabled
- Check that your credentials are not expired

### 404 Not Found

**Error**: "Resource not found"

**Solution**:
- Verify the endpoint URL is correct
- Ensure the server is running on the correct port
- Check that your project/hub IDs are valid

### Empty Data

**Error**: Endpoints return empty arrays

**Solution**:
- Verify you have access to the ACC project
- Check that the project contains the requested data type
- Review logs for API errors
- Try clearing the cache: `POST /api/acc/cache/clear`

### Rate Limiting

**Error**: "Too many requests"

**Solution**:
- Increase `CACHE_TTL` to reduce API calls
- Implement request throttling
- Contact Autodesk to increase your rate limits

## Architecture

```
┌─────────────┐
│  Power BI   │
└──────┬──────┘
       │ HTTP/REST
       │
┌──────▼────────────────────┐
│  Express REST API Server  │
├───────────────────────────┤
│  - Route Handlers         │
│  - Data Transformation    │
│  - Caching Layer          │
└──────┬────────────────────┘
       │
┌──────▼────────────────────┐
│  ACC API Client           │
├───────────────────────────┤
│  - OAuth 2.0 Auth         │
│  - API Requests           │
│  - Error Handling         │
└──────┬────────────────────┘
       │
┌──────▼────────────────────┐
│  Autodesk Platform        │
│  Services (APS)           │
│  - ACC APIs               │
└───────────────────────────┘
```

## Project Structure

```
ACC AEC PowerBI Connector/
├── src/
│   ├── auth/
│   │   └── apsAuth.ts          # OAuth 2.0 authentication
│   ├── config/
│   │   └── config.ts           # Configuration management
│   ├── middleware/
│   │   └── errorHandler.ts    # Error handling middleware
│   ├── routes/
│   │   └── accRoutes.ts        # API route definitions
│   ├── services/
│   │   ├── accClient.ts        # ACC API client
│   │   ├── cacheService.ts     # Caching service
│   │   └── dataTransformer.ts  # Data transformation
│   ├── utils/
│   │   └── logger.ts           # Logging utility
│   └── index.ts                # Application entry point
├── dist/                       # Compiled JavaScript (generated)
├── logs/                       # Application logs (generated)
├── .env                        # Environment variables (create from .env.example)
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── package.json               # Project dependencies
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## Available ACC Data Types

The connector supports the following ACC data types:

1. **Hubs** - ACC account/hub information
2. **Projects** - Project metadata and details
3. **Issues** - Issue tracking and management
4. **Assets** - Asset/equipment tracking
5. **Cost** - Budget and cost data
6. **Forms** - Forms and inspections
7. **Locations** - Location/zone hierarchies

## Power BI Dashboard Ideas

Create powerful dashboards with this data:

- **Issue Tracking**: Status distribution, priority analysis, assignment workload
- **Cost Management**: Budget vs. actual, variance analysis, cost trends
- **Asset Management**: Asset status, location distribution, warranty tracking
- **Project Overview**: Multi-project comparison, timeline tracking
- **Quality Control**: Forms completion rates, inspection trends
- **Location Analytics**: Geographic distribution, zone-based metrics

## Security Considerations

- Store credentials securely in `.env` file
- Never commit `.env` to version control
- Use HTTPS in production
- Implement authentication on the REST API for production use
- Consider using Azure Key Vault or similar for credential management
- Implement IP whitelisting if needed
- Use appropriate CORS settings

## Performance Optimization

1. **Caching**: Adjust `CACHE_TTL` based on data freshness requirements
2. **Selective Loading**: Only load data types you need
3. **Incremental Refresh**: Use Power BI incremental refresh for large datasets
4. **Parallel Requests**: The `/all` endpoint fetches data in parallel
5. **Pagination**: Implement pagination for very large datasets (future enhancement)

## Future Enhancements

Potential improvements for future versions:

- [ ] Pagination support for large datasets
- [ ] Webhook support for real-time updates
- [ ] Additional ACC API endpoints (RFIs, Submittals, etc.)
- [ ] Built-in authentication middleware
- [ ] Power BI Custom Connector (.mez file)
- [ ] Delta sync for incremental updates
- [ ] Data export to multiple formats (CSV, Excel)
- [ ] Admin dashboard for monitoring
- [ ] Multi-project batch processing

## Support and Resources

- [Autodesk Platform Services Documentation](https://aps.autodesk.com/)
- [ACC API Reference](https://aps.autodesk.com/en/docs/acc/v1/reference)
- [Power BI Documentation](https://docs.microsoft.com/power-bi/)
- [Power Query M Reference](https://docs.microsoft.com/powerquery-m/)

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Version History

- **1.0.0** (2026-01-02)
  - Initial release
  - Support for core ACC data types
  - OAuth 2.0 authentication
  - Caching implementation
  - Power BI integration ready
