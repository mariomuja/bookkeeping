# International Bookkeeping - Backend API

Express.js REST API for International Bookkeeping with custom fields support.

## Features

- ✅ Full REST API for bookkeeping operations
- ✅ Custom fields management
- ✅ Insurance sample data generator (1M+ records)
- ✅ Mock data mode (works without database)
- ✅ PostgreSQL support (when configured)
- ✅ CORS enabled for frontend
- ✅ Real-time aggregation reports

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Server
```bash
npm start
```

Server will run on `http://localhost:3000`

### 3. Test API
```bash
curl http://localhost:3000/api/health
```

## Configuration

Edit `config.js` to change:
- Port number
- Database connection settings
- Enable/disable mock data mode

## API Endpoints

### Health Check
- `GET /api/health` - Server status

### Organizations
- `GET /api/organizations` - List organizations
- `GET /api/organizations/:id` - Get organization
- `POST /api/organizations` - Create organization

### Accounts
- `GET /api/organizations/:orgId/accounts` - List accounts
- `GET /api/accounts/:id` - Get account
- `POST /api/organizations/:orgId/accounts` - Create account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account

### Journal Entries
- `GET /api/organizations/:orgId/journal-entries` - List entries (supports filters)
- `GET /api/journal-entries/:id` - Get entry with lines
- `POST /api/organizations/:orgId/journal-entries` - Create entry
- `POST /api/journal-entries/:id/post` - Post entry
- `POST /api/journal-entries/:id/void` - Void entry

### Custom Fields
- `GET /api/organizations/:orgId/custom-fields` - List field definitions
- `GET /api/custom-fields/:id` - Get field definition
- `POST /api/organizations/:orgId/custom-fields` - Create field
- `PUT /api/custom-fields/:id` - Update field
- `DELETE /api/custom-fields/:id` - Delete field
- `POST /api/organizations/:orgId/custom-fields/reorder` - Reorder fields
- `POST /api/organizations/:orgId/custom-fields/insurance-defaults` - Create insurance fields

### Reports
- `GET /api/organizations/:orgId/dashboard` - Dashboard metrics
- `GET /api/organizations/:orgId/reports/trial-balance` - Trial balance
- `GET /api/organizations/:orgId/reports/balance-sheet` - Balance sheet
- `GET /api/organizations/:orgId/reports/profit-loss` - Profit & loss
- `GET /api/organizations/:orgId/reports/policy-summary` - Policy aggregations
- `GET /api/organizations/:orgId/reports/claim-summary` - Claim aggregations

### Sample Data
- `POST /api/organizations/:orgId/sample-data/insurance` - Generate sample data
  - Body: `{ "count": 1000000 }`

## Generating Sample Data

### Via API:
```bash
curl -X POST http://localhost:3000/api/organizations/550e8400-e29b-41d4-a716-446655440000/sample-data/insurance \
  -H "Content-Type: application/json" \
  -d '{"count": 10000}'
```

### Via Frontend:
1. Navigate to Custom Fields page
2. Click "Generate Sample Data"
3. Enter desired count (e.g., 1000000)
4. Wait for completion

## Sample Data Details

Generated data includes:
- 70% Premium collections
- 30% Claim payments
- Random policy types (Auto, Home, Life, Health, Business, Liability)
- Random amounts within realistic ranges
- Dates distributed over past 2 years
- Master policy groupings (every 100 policies)
- Claim statuses (Open, Under Review, Approved, Paid, Closed)
- Realistic insured party names

## Performance

The mock data mode can handle:
- 1M+ journal entries in memory
- Sub-second response times for most queries
- Real-time aggregations for reports

For production with PostgreSQL:
- Millions of entries with TimescaleDB
- Continuous aggregates for instant reports
- Materialized views for complex queries

## Development

### Start with auto-reload:
```bash
npm run dev
```

(Requires nodemon: `npm install -g nodemon`)

## Next Steps

1. ✅ Start backend server
2. ✅ Create insurance custom fields (via API or frontend)
3. ✅ Generate sample data
4. ✅ Test with frontend application
5. Connect to PostgreSQL for production use

## Author

Mario Muja
- Email: mario.muja@gmail.com
- Phone (DE): +49 1520 464 14 73
- Phone (IT): +39 345 345 0098
- Location: Hamburg, Germany

