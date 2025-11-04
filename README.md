# BookKeeper Pro - International Bookkeeping System

A comprehensive, modern bookkeeping application built with Angular and designed to work with PostgreSQL + TimescaleDB. This application supports double-entry accounting, multi-currency operations, and can handle millions of bookings efficiently.

## 🌟 Features

### Core Functionality
- **Double-Entry Accounting**: Full support for double-entry bookkeeping principles
- **Multi-Currency Support**: Handle transactions in multiple currencies with exchange rate management
- **Chart of Accounts**: Comprehensive account management with DATEV-style structure
- **Journal Entries**: Create, post, and manage journal entries with real-time balance validation
- **Financial Reports**:
  - Trial Balance
  - Balance Sheet
  - Profit & Loss Statement
- **Data Import**: Import accounts and journal entries from CSV/Excel files
- **Dashboard**: Real-time metrics and key performance indicators

### Technical Features
- **Scalable**: Built on TimescaleDB for handling millions of transactions
- **International**: Multi-timezone support and localization-ready
- **Modern UI**: Clean, professional interface with responsive design
- **Type-Safe**: Full TypeScript implementation
- **Standalone Components**: Modern Angular architecture

## 📁 Project Structure

```
bookkeeping/
├── bookkeeping-frontend/          # Angular frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/       # Feature components
│   │   │   │   ├── dashboard/
│   │   │   │   ├── accounts/
│   │   │   │   ├── journal-entries/
│   │   │   │   ├── reports/
│   │   │   │   ├── import/
│   │   │   │   └── layout/       # Header, Sidebar
│   │   │   ├── models/           # TypeScript interfaces
│   │   │   ├── services/         # API services
│   │   │   └── app.config.ts     # App configuration
│   │   └── styles.css            # Global styles
│   └── package.json
└── database/
    └── bookkeeping-schema.sql    # PostgreSQL database schema
```

## 🗄️ Database Schema

The application uses a comprehensive PostgreSQL schema with TimescaleDB extensions:

### Main Tables
- **organizations**: Company/organization information
- **fiscal_periods**: Accounting periods management
- **currencies**: Supported currencies (ISO 4217)
- **exchange_rates**: Currency exchange rates with historical data
- **account_types**: Account categories (Assets, Liabilities, Equity, Revenue, Expenses)
- **accounts**: Chart of accounts
- **journal_entries**: Transaction headers
- **journal_entry_lines**: Transaction line items (debits/credits)
- **account_balances**: Materialized account balances
- **import_jobs**: Data import tracking

### Key Features
- **TimescaleDB Hypertables**: Optimized for time-series data
- **Continuous Aggregates**: Pre-computed reports for fast queries
- **Views**: Trial Balance, Balance Sheet, Profit & Loss
- **Functions**: Balance validation, entry posting, account calculations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Angular CLI 17+
- PostgreSQL 14+ with TimescaleDB extension
- Git

### Frontend Setup

1. **Install dependencies:**
```bash
cd bookkeeping-frontend
npm install
```

2. **Configure API endpoint:**
Edit `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

3. **Start development server:**
```bash
npm start
# or
ng serve
```

4. **Access the application:**
Open your browser to `http://localhost:4200`

### Database Setup

1. **Create PostgreSQL database:**
```sql
CREATE DATABASE bookkeeping;
```

2. **Enable TimescaleDB extension:**
```sql
\c bookkeeping
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

3. **Run the schema:**
```bash
psql -U postgres -d bookkeeping -f database/bookkeeping-schema.sql
```

### Backend API (Required)

This frontend requires a REST API backend. The expected endpoints are:

#### Organizations
- `GET /api/organizations` - List organizations
- `GET /api/organizations/:id` - Get organization
- `POST /api/organizations` - Create organization
- `PUT /api/organizations/:id` - Update organization
- `DELETE /api/organizations/:id` - Delete organization

#### Accounts
- `GET /api/account-types` - List account types
- `GET /api/organizations/:orgId/accounts` - List accounts
- `GET /api/accounts/:id` - Get account
- `POST /api/organizations/:orgId/accounts` - Create account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account

#### Journal Entries
- `GET /api/organizations/:orgId/journal-entries` - List entries
- `GET /api/journal-entries/:id` - Get entry
- `POST /api/organizations/:orgId/journal-entries` - Create entry
- `PUT /api/journal-entries/:id` - Update entry
- `DELETE /api/journal-entries/:id` - Delete entry
- `POST /api/journal-entries/:id/post` - Post entry
- `POST /api/journal-entries/:id/void` - Void entry

#### Reports
- `GET /api/organizations/:orgId/reports/trial-balance` - Trial balance
- `GET /api/organizations/:orgId/reports/balance-sheet` - Balance sheet
- `GET /api/organizations/:orgId/reports/profit-loss` - P&L statement
- `GET /api/organizations/:orgId/dashboard` - Dashboard metrics

## 🎨 UI Components

### Dashboard
- Key metrics cards (Assets, Liabilities, Equity, Net Income)
- Activity summary
- Quick actions for common tasks

### Chart of Accounts
- Searchable account list
- Filter by category
- Create/Edit/Delete accounts
- Account hierarchy support

### Journal Entries
- Double-entry transaction form
- Real-time balance validation
- Multi-line entries
- Post and void functionality
- Entry status tracking (Draft, Posted, Void)

### Reports
- Trial Balance with totals
- Balance Sheet (Assets, Liabilities, Equity)
- Profit & Loss Statement
- Export to CSV/Excel

### Import Data
- CSV/Excel file upload
- Import history tracking
- Progress monitoring
- Template download

## 🛠️ Development

### Build for Production
```bash
cd bookkeeping-frontend
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Run Tests
```bash
npm test
```

### Code Style
```bash
npm run lint
```

## 📊 Database Performance

The schema is optimized for high-volume bookkeeping:

- **TimescaleDB Hypertables**: Automatic partitioning by time for `journal_entries`
- **Continuous Aggregates**: Pre-computed monthly summaries
- **Materialized Views**: Fast report generation
- **Indexes**: Optimized for common query patterns

Expected performance:
- Handles millions of journal entries
- Sub-second report generation
- Real-time dashboard metrics

## 🌍 Multi-Currency Support

The system supports:
- Multiple currencies per organization
- Historical exchange rates
- Automatic base currency conversion
- Currency-specific decimal places

## 🔒 Security Considerations

When implementing the backend API:
- Implement authentication and authorization
- Validate all double-entry transactions (debits = credits)
- Prevent modification of posted entries
- Implement fiscal period locking
- Audit trail for all transactions
- Rate limiting for API endpoints

## 📝 Data Model

### Double-Entry Bookkeeping Rules
1. Every transaction must have at least one debit and one credit
2. Total debits must equal total credits
3. Posted entries cannot be modified (void and create new)
4. Closed fiscal periods cannot accept new entries

### Account Types
- **Assets**: Normal balance = Debit
- **Liabilities**: Normal balance = Credit
- **Equity**: Normal balance = Credit
- **Revenue**: Normal balance = Credit
- **Expenses**: Normal balance = Debit

## 🤝 Contributing

This is a demonstration/template project. Feel free to:
- Fork and customize for your needs
- Submit issues for bugs or suggestions
- Contribute improvements via pull requests

## 📄 License

This project is provided as-is for educational and commercial use.

## 🙏 Acknowledgments

- Built with Angular 17
- Database powered by PostgreSQL and TimescaleDB
- DATEV-inspired account structure
- Modern UI design principles

## 📞 Support

For questions or issues:
- Check the database schema documentation in `database/bookkeeping-schema.sql`
- Review the Angular component code for implementation details
- Consult PostgreSQL and TimescaleDB documentation for database optimization

---

**Built with ❤️ for modern bookkeeping**

---

## 💼 Professional Services

Would you like to create feature-rich services & apps in short time without expensive developers working on it for weeks and months? Let me help you. I live in Hamburg.

### 📞 Contact Me

**Germany:** +49 1520 464 14 73

**Italy:** +39 345 345 0098

**Email:** mario.muja@gmail.com

I am looking forward to hearing from you!

