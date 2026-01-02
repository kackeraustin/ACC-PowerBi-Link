# Power BI Setup Guide for ACC Connector

This guide provides detailed step-by-step instructions for connecting your ACC data to Power BI.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Starting the Connector](#starting-the-connector)
3. [Connecting Power BI Desktop](#connecting-power-bi-desktop)
4. [Creating Your First Dashboard](#creating-your-first-dashboard)
5. [Advanced Power Query Examples](#advanced-power-query-examples)
6. [Setting Up Scheduled Refresh](#setting-up-scheduled-refresh)
7. [Best Practices](#best-practices)

## Prerequisites

- ACC Connector application running (see main README.md)
- Power BI Desktop installed
- Access to ACC projects
- Your Hub ID, Project ID, and Container ID

## Finding Your IDs

Before connecting to Power BI, you need to find your ACC identifiers.

### 1. Find Your Hub ID

Open your browser and navigate to:
```
http://localhost:3000/api/acc/hubs
```

You'll see a JSON response like:
```json
[
  {
    "hubId": "b.a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "hubName": "Your Company Name",
    "region": "US",
    "type": "hubs"
  }
]
```

Copy the `hubId` value.

### 2. Find Your Project ID

Replace `{hubId}` with your hub ID:
```
http://localhost:3000/api/acc/hubs/{hubId}/projects
```

Response:
```json
[
  {
    "projectId": "b.x9y8z7w6-v5u4-3210-tuvw-xyz1234567890",
    "projectName": "Your Project Name",
    "status": "active",
    ...
  }
]
```

Copy the `projectId` value.

### 3. Container ID

The container ID is typically the same as the project ID, but sometimes it's formatted differently. You can use the project ID as the container ID in most cases.

## Starting the Connector

1. Open Command Prompt or PowerShell
2. Navigate to the project directory:
   ```bash
   cd "C:\Users\minio\source\ACC AEC PowerBI Connector"
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
4. Verify it's running by visiting:
   ```
   http://localhost:3000/health
   ```

## Connecting Power BI Desktop

### Method 1: Simple Web Connection (Recommended for Beginners)

#### Step 1: Get Data from Web

1. Open Power BI Desktop
2. Click **Home** tab → **Get Data** → **Web**
3. In the URL field, enter one of these endpoints:

   **For Issues:**
   ```
   http://localhost:3000/api/acc/projects/YOUR_PROJECT_ID/issues?containerId=YOUR_CONTAINER_ID
   ```

   **For Assets:**
   ```
   http://localhost:3000/api/acc/projects/YOUR_PROJECT_ID/assets
   ```

   **For Cost Data:**
   ```
   http://localhost:3000/api/acc/projects/YOUR_PROJECT_ID/cost
   ```

   **For All Data:**
   ```
   http://localhost:3000/api/acc/projects/YOUR_PROJECT_ID/all?hubId=YOUR_HUB_ID&containerId=YOUR_CONTAINER_ID
   ```

4. Click **OK**

#### Step 2: Authentication

1. Select **Anonymous** (since we're connecting locally)
2. Click **Connect**

#### Step 3: Transform Data

1. Power Query Editor will open with JSON data
2. Click **To Table** in the ribbon
3. Click **OK** on the dialog
4. Click the expand button (⇄) next to the column header
5. Select the fields you want to include
6. Click **OK**
7. Click **Close & Apply**

### Method 2: Advanced Power Query

This method gives you more control and reusability.

#### Creating a Base Query

1. **Home** → **Get Data** → **Blank Query**
2. Click **Advanced Editor**
3. Paste this code:

```m
let
    // Configuration
    BaseURL = "http://localhost:3000/api/acc",
    ProjectID = "YOUR_PROJECT_ID",
    HubID = "YOUR_HUB_ID",
    ContainerID = "YOUR_CONTAINER_ID",

    // Fetch Issues
    IssuesURL = BaseURL & "/projects/" & ProjectID & "/issues?containerId=" & ContainerID,
    IssuesSource = Json.Document(Web.Contents(IssuesURL)),
    IssuesToTable = Table.FromList(IssuesSource, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    ExpandIssues = Table.ExpandRecordColumn(IssuesToTable, "Column1",
        {"issueId", "title", "status", "priority", "assignedTo", "assignedToName",
         "dueDate", "createdAt", "createdBy", "issueType", "location"},
        {"Issue ID", "Title", "Status", "Priority", "Assigned To", "Assigned To Name",
         "Due Date", "Created At", "Created By", "Issue Type", "Location"}),

    // Data Type Conversions
    TypedIssues = Table.TransformColumnTypes(ExpandIssues, {
        {"Created At", type datetime},
        {"Due Date", type datetime}
    })
in
    TypedIssues
```

4. Replace `YOUR_PROJECT_ID`, `YOUR_HUB_ID`, and `YOUR_CONTAINER_ID`
5. Click **Done**
6. Name the query "ACC_Issues"
7. Click **Close & Apply**

#### Creating Multiple Data Sources

Repeat the above for each data type:

**Assets Query:**
```m
let
    BaseURL = "http://localhost:3000/api/acc",
    ProjectID = "YOUR_PROJECT_ID",

    AssetsURL = BaseURL & "/projects/" & ProjectID & "/assets",
    Source = Json.Document(Web.Contents(AssetsURL)),
    ToTable = Table.FromList(Source, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    Expanded = Table.ExpandRecordColumn(ToTable, "Column1",
        {"assetId", "name", "category", "status", "location", "manufacturer",
         "model", "serialNumber", "installDate", "warrantyExpiration"},
        {"Asset ID", "Name", "Category", "Status", "Location", "Manufacturer",
         "Model", "Serial Number", "Install Date", "Warranty Expiration"}),
    Typed = Table.TransformColumnTypes(Expanded, {
        {"Install Date", type date},
        {"Warranty Expiration", type date}
    })
in
    Typed
```

**Cost Query:**
```m
let
    BaseURL = "http://localhost:3000/api/acc",
    ProjectID = "YOUR_PROJECT_ID",

    CostURL = BaseURL & "/projects/" & ProjectID & "/cost",
    Source = Json.Document(Web.Contents(CostURL)),
    ToTable = Table.FromList(Source, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    Expanded = Table.ExpandRecordColumn(ToTable, "Column1",
        {"costItemId", "name", "budgeted", "actual", "variance", "committed",
         "costCode", "category", "description"},
        {"Cost Item ID", "Name", "Budgeted", "Actual", "Variance", "Committed",
         "Cost Code", "Category", "Description"}),
    Typed = Table.TransformColumnTypes(Expanded, {
        {"Budgeted", Currency.Type},
        {"Actual", Currency.Type},
        {"Variance", Currency.Type},
        {"Committed", Currency.Type}
    })
in
    Typed
```

### Method 3: Create Reusable Functions

Create a function that can be called with different parameters.

1. **Home** → **Get Data** → **Blank Query**
2. **Advanced Editor**
3. Paste:

```m
(dataType as text, projectId as text, hubId as text, containerId as text) as table =>
let
    BaseURL = "http://localhost:3000/api/acc",

    // Build URL based on data type
    URL = if dataType = "issues" then
            BaseURL & "/projects/" & projectId & "/issues?containerId=" & containerId
          else if dataType = "assets" then
            BaseURL & "/projects/" & projectId & "/assets"
          else if dataType = "cost" then
            BaseURL & "/projects/" & projectId & "/cost"
          else if dataType = "forms" then
            BaseURL & "/projects/" & projectId & "/forms"
          else if dataType = "locations" then
            BaseURL & "/projects/" & projectId & "/locations"
          else
            error "Invalid data type",

    // Fetch and convert to table
    Source = Json.Document(Web.Contents(URL)),
    ToTable = Table.FromList(Source, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    ExpandAll = Table.ExpandRecordColumn(ToTable, "Column1",
        Record.FieldNames(ToTable{0}[Column1]))
in
    ExpandAll
```

4. Name it `fnGetACCData`
5. Invoke it:

```m
fnGetACCData("issues", "YOUR_PROJECT_ID", "YOUR_HUB_ID", "YOUR_CONTAINER_ID")
```

## Creating Your First Dashboard

### Issue Tracking Dashboard

1. **Create visualizations:**

   - **Card Visual**: Count of Issues
     - Field: Issue ID (Count)

   - **Pie Chart**: Issues by Status
     - Legend: Status
     - Values: Issue ID (Count)

   - **Bar Chart**: Issues by Priority
     - Axis: Priority
     - Values: Issue ID (Count)

   - **Table**: Issue Details
     - Columns: Title, Status, Priority, Assigned To Name, Due Date

   - **Line Chart**: Issues Over Time
     - Axis: Created At (by Month)
     - Values: Issue ID (Count)

2. **Add Slicers:**
   - Status
   - Priority
   - Assigned To Name
   - Issue Type

### Cost Management Dashboard

1. **Create visualizations:**

   - **Card Visuals**:
     - Total Budgeted
     - Total Actual
     - Total Variance

   - **Waterfall Chart**: Budget Performance
     - Category: Category
     - Y-Axis: Variance

   - **Gauge**: Budget Utilization
     - Value: Total Actual
     - Maximum: Total Budgeted

   - **Table**: Cost Details
     - Columns: Name, Budgeted, Actual, Variance, Cost Code

### Asset Tracking Dashboard

1. **Create visualizations:**

   - **Card**: Total Assets
   - **Donut Chart**: Assets by Category
   - **Bar Chart**: Assets by Status
   - **Map** (if location data available): Asset Locations
   - **Table**: Asset Inventory

## Advanced Power Query Examples

### Combining Multiple Data Sources

```m
let
    // Get Issues
    Issues = fnGetACCData("issues", ProjectID, HubID, ContainerID),

    // Get Assets
    Assets = fnGetACCData("assets", ProjectID, HubID, ContainerID),

    // Get Cost
    Cost = fnGetACCData("cost", ProjectID, HubID, ContainerID),

    // Create a summary table
    Summary = Table.FromRows({
        {"Total Issues", Table.RowCount(Issues)},
        {"Open Issues", Table.RowCount(Table.SelectRows(Issues, each [Status] = "open"))},
        {"Total Assets", Table.RowCount(Assets)},
        {"Total Budget", List.Sum(Cost[Budgeted])},
        {"Total Actual", List.Sum(Cost[Actual])}
    }, {"Metric", "Value"})
in
    Summary
```

### Creating Date Tables

```m
let
    StartDate = #date(2024, 1, 1),
    EndDate = #date(2026, 12, 31),
    NumberOfDays = Duration.Days(EndDate - StartDate) + 1,
    Dates = List.Dates(StartDate, NumberOfDays, #duration(1, 0, 0, 0)),
    TableFromList = Table.FromList(Dates, Splitter.SplitByNothing(), {"Date"}),
    ChangedType = Table.TransformColumnTypes(TableFromList, {{"Date", type date}}),

    // Add calculated columns
    AddYear = Table.AddColumn(ChangedType, "Year", each Date.Year([Date])),
    AddMonth = Table.AddColumn(AddYear, "Month", each Date.Month([Date])),
    AddMonthName = Table.AddColumn(AddMonth, "Month Name", each Date.MonthName([Date])),
    AddQuarter = Table.AddColumn(AddMonthName, "Quarter", each "Q" & Number.ToText(Date.QuarterOfYear([Date]))),
    AddWeek = Table.AddColumn(AddQuarter, "Week", each Date.WeekOfYear([Date])),
    AddDayOfWeek = Table.AddColumn(AddWeek, "Day of Week", each Date.DayOfWeek([Date]))
in
    AddDayOfWeek
```

### Filtering and Transforming Data

```m
let
    Source = fnGetACCData("issues", ProjectID, HubID, ContainerID),

    // Filter for open issues only
    FilteredRows = Table.SelectRows(Source, each ([Status] = "open" or [Status] = "in_progress")),

    // Add calculated column for overdue
    AddOverdue = Table.AddColumn(FilteredRows, "Is Overdue",
        each if [Due Date] <> null and [Due Date] < DateTime.LocalNow() then "Yes" else "No"),

    // Add aging column
    AddAging = Table.AddColumn(AddOverdue, "Age (Days)",
        each Duration.Days(DateTime.LocalNow() - [Created At]))
in
    AddAging
```

## Setting Up Scheduled Refresh

### For Power BI Service

1. **Publish Your Report:**
   - Click **Publish** in Power BI Desktop
   - Select your workspace
   - Click **Select**

2. **Configure Gateway** (for on-premises connector):
   - Install Power BI Gateway on the machine running the connector
   - Configure gateway settings
   - Add data source

3. **Set Up Refresh Schedule:**
   - Go to Power BI Service
   - Navigate to your workspace
   - Find your dataset
   - Click **⋮** (More options) → **Settings**
   - Expand **Scheduled refresh**
   - Toggle **Keep your data up to date** to **On**
   - Set refresh frequency (e.g., Daily at 6:00 AM)
   - Click **Apply**

### Best Practices for Refresh

- Schedule during low-usage hours
- Start with daily refresh, adjust based on needs
- Monitor refresh history for failures
- Set up failure notifications
- Clear cache before major data changes

## Best Practices

### Performance Optimization

1. **Use Query Folding**: Minimize data loaded into Power BI
2. **Filter Early**: Apply filters in Power Query, not in visuals
3. **Remove Unnecessary Columns**: Only load columns you need
4. **Use Proper Data Types**: Convert to correct types in Power Query
5. **Disable Load for Intermediate Queries**: Right-click query → Uncheck "Enable Load"

### Data Modeling

1. **Create Relationships**: Link tables properly (e.g., Projects → Issues)
2. **Use Star Schema**: Fact tables (Issues, Assets) and dimension tables (Projects, Dates)
3. **Create Calculated Columns**: Add business logic in DAX
4. **Use Measures**: For aggregations and KPIs

### Example Measures (DAX)

```dax
Total Issues = COUNTROWS(ACC_Issues)

Open Issues = CALCULATE(
    COUNTROWS(ACC_Issues),
    ACC_Issues[Status] = "open"
)

Issue Resolution Rate =
DIVIDE(
    CALCULATE(COUNTROWS(ACC_Issues), ACC_Issues[Status] = "closed"),
    COUNTROWS(ACC_Issues),
    0
)

Average Days to Close =
AVERAGEX(
    FILTER(ACC_Issues, ACC_Issues[Status] = "closed"),
    DATEDIFF(ACC_Issues[Created At], ACC_Issues[Updated At], DAY)
)

Budget Variance % =
DIVIDE(
    SUM(ACC_Cost[Variance]),
    SUM(ACC_Cost[Budgeted]),
    0
)
```

### Security

1. **Use HTTPS in Production**: Never use HTTP for production data
2. **Implement Row-Level Security**: Restrict data access by user
3. **Secure Credentials**: Use Power BI Gateway for credential management
4. **Regular Access Reviews**: Audit who has access to reports

### Error Handling

If data doesn't load:

1. Check connector is running: `http://localhost:3000/health`
2. Verify IDs are correct in Power Query
3. Check logs: `logs/combined.log`
4. Clear cache: `POST http://localhost:3000/api/acc/cache/clear`
5. Refresh in Power Query Editor to see detailed errors

## Troubleshooting

### "Cannot connect to data source"

- Ensure connector service is running
- Check firewall settings
- Verify URL is correct

### "Unable to convert JSON"

- Data structure may have changed
- Check API response manually in browser
- Update Power Query column expansion

### "Refresh failed"

- Check connector logs
- Verify authentication is valid
- Ensure gateway is running (for scheduled refresh)

## Next Steps

- Explore additional ACC APIs as they become available
- Create custom visuals for specific metrics
- Set up alerts for critical thresholds
- Build mobile-optimized report layouts
- Share reports with your team

For more help, refer to the main README.md or Autodesk/Power BI documentation.
