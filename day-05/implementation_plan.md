# CSV Dashboard Implementation Plan

This plan outlines the steps to build the CSV uploading, processing, and visualization features for the marketing and sales dashboard.

## Proposed Architecture

### Backend (Node.js & Express)
- **File Upload**: Use `multer` to handle CSV file uploads.
- **CSV Parsing**: Use `csv-parser` or `papaparse` on the backend to parse the incoming CSV data.
- **Database Storage**: Create a `SalesData` Mongoose model to store the parsed records, associating them with the authenticated user.
- **Data Aggregation**: Create an API endpoint (`/api/data/dashboard-metrics`) that aggregates the data (e.g., total sales, sales by month, top campaigns) using MongoDB aggregation pipelines.

### Frontend (React & Vite)
- **Visualization Library**: We will use `recharts`, a highly customizable and elegant React charting library that fits perfectly with our premium UI design.
- **Upload Component**: Enhance the `Dashboard.jsx` empty state to support Drag & Drop CSV uploading.
- **Dashboard Layout**: Build a responsive grid layout to display:
  - Key Performance Indicators (KPI) cards (e.g., Total Revenue, Total Leads).
  - A Line Chart showing trends over time (e.g., Revenue by Month).
  - A Bar Chart comparing categories (e.g., Leads by Campaign).

## Proposed Changes

### 1. Backend Changes
- **Install Dependencies**: `multer`, `csv-parser`
- **Models**: Create `models/SalesData.js` to define the schema (Date, Revenue, Campaign, Leads, etc.).
- **Routes**: Create `routes/data.js` containing:
  - `POST /api/data/upload`: Accepts a CSV file, parses it, and inserts it into MongoDB.
  - `GET /api/data/metrics`: Returns aggregated metrics for the frontend charts.

### 2. Frontend Changes
- **Install Dependencies**: `recharts`
- **Dashboard UI Updates**:
  - Add file input logic with loading states.
  - Create KPI card components.
  - Render `LineChart` and `BarChart` components using the fetched aggregated data.

## Open Questions

> [!WARNING]
> 1. **Data Schema Structure**: Do you have a specific structure for your CSV file? If not, I will assume a standard format with columns like `Date`, `Campaign_Name`, `Revenue`, `Leads`, and `Cost`.
> 2. **Persistence**: Should we store the uploaded CSV data in the database permanently for the user, or do you prefer processing it in-memory just for immediate visualization? Storing it in the database allows the dashboard to reload data without re-uploading the CSV every time.

## Verification Plan
1. Send a mock CSV file to the backend and verify the data parses and saves correctly.
2. Upload a sample CSV via the React UI.
3. Verify that the charts render correctly with the processed data.
