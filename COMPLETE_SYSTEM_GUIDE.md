# 📚 BookKeeper Pro - Complete System Guide

## 🎯 Getting Started

### **Step 1: Login**

1. Navigate to: http://localhost:4300
2. You'll see the login screen
3. Use demo credentials:
   - **Username**: `demo`
   - **Password**: `demo123`
4. Click "Sign In"
5. You're now logged in! 🎉

### **Step 2: Explore the System**

The application has been loaded with **5,000 insurance bookings** for demonstration.

---

## 🗺️ Main Navigation Menu

### **📊 Dashboard**
- Key financial metrics
- Revenue and expenses overview
- Quick stats and charts
- Currency switcher (view in EUR, USD, GBP, etc.)

### **📘 Chart of Accounts**
- View all 10 accounts (Cash, Receivables, Payables, etc.)
- Account types and categories
- Balance information

### **📝 Journal Entries** ⭐ NEW FEATURES
- **5,000 insurance bookings** displayed
- **Fast table view** - one row per entry
- **Pagination** - 1,000 entries per page
- **Search** - by account, description, policy, claim
- **Filter** - amount filtering (>, <, =, >=, <=)
- **Column sorting** - click any header to sort
- **Status tooltips** - hover over POSTED/DRAFT/VOID
- **Account numbers** prominently displayed
- **Custom fields** - Policy #, Claim # visible

### **📈 Reports**
- Click any report to open in new browser tab
- **Financial Reports**:
  - Trial Balance
  - Balance Sheet
  - Profit & Loss
- **Insurance Reports**:
  - Loss Triangle (claims development, IBNR reserves)

### **📥 Import Data**
- Import transactions from CSV/Excel
- Map columns to accounts
- Validate before import

### **🔧 Custom Fields**
- Define insurance-specific fields
- Policy numbers, claim numbers, dates
- Custom field editor

### **🔍 Audit Log** ⭐ NEW - ADMIN ONLY
- **Complete activity tracking**
- **Who** did **what** and **when**
- Filter by action, entity, user, date
- Export to CSV
- Statistics dashboard
- 100 entries per page

### **⚙️ Settings** ⭐ NEW
- Account information
- **2FA Setup** with Google Authenticator
- QR code scanner
- Enable/Disable 2FA

---

## 🔐 Authentication Features

### **Login System**
- ✅ Username and password authentication
- ✅ Secure password hashing (bcrypt)
- ✅ JWT token-based sessions (24h)
- ✅ Auto-redirect to login if not authenticated
- ✅ Logout functionality

### **Two-Factor Authentication (2FA)**
- ✅ Google Authenticator integration
- ✅ QR code setup
- ✅ TOTP (Time-based One-Time Password)
- ✅ 6-digit codes every 30 seconds
- ✅ Optional but recommended
- ✅ Enable/Disable from settings

**How to Setup 2FA:**
1. Login with demo credentials
2. Click your username (top-right)
3. Select "Settings & 2FA"
4. Click "Enable 2FA"
5. Scan QR code with Google Authenticator app
6. Enter 6-digit code
7. Done! ✅

---

## 🔍 Audit Logging Features

### **What Gets Logged**

**Authentication Events:**
- ✅ Login attempts (successful & failed)
- ✅ Logout events
- ✅ 2FA setup, enable, disable

**Data Operations:**
- ✅ Sample data generation
- ✅ Journal entry creation/updates
- ✅ Account changes
- ✅ Custom field modifications
- ✅ Report generation
- ✅ Data import/export

**Logged Information:**
- 📅 **Timestamp** - Exact date/time
- 👤 **Username** - Who made the change
- 🎯 **Action** - What was done (CREATE, UPDATE, DELETE, etc.)
- 📦 **Entity Type** - What was changed (JOURNAL_ENTRY, ACCOUNT, etc.)
- 📝 **Description** - Human-readable explanation
- 🌐 **IP Address** - Where it came from
- 💻 **User Agent** - Browser/device info

### **Audit Log Interface**

**Statistics Cards** (Top of page):
- Total Events
- Last 24 Hours
- Last 7 Days  
- Active Users

**Filters:**
- Action type (LOGIN, CREATE, GENERATE, etc.)
- Entity type (JOURNAL_ENTRY, USER, etc.)
- Username
- Date range (start and end)

**Table Columns:**
- Timestamp (dd/MM/yyyy HH:mm:ss)
- User
- Action (color-coded badge)
- Entity
- Description
- IP Address

**Actions:**
- Export logs to CSV
- Pagination (100 per page)
- Real-time filtering
- Sortable columns

---

## 📋 Current System Status

### **Backend**
- ✅ Running on http://localhost:3000
- ✅ Authentication enabled
- ✅ Audit logging active
- ✅ Demo user created: demo/demo123
- ✅ 5,000 journal entries loaded

### **Frontend**
- ✅ Running on http://localhost:4300
- ✅ Login required
- ✅ Auth guard protecting routes
- ✅ JWT interceptor active
- ✅ Audit log accessible

### **Data**
- ✅ 10 accounts in Chart of Accounts
- ✅ 5,000 insurance bookings (premiums & claims)
- ✅ Multi-currency support (EUR, USD, GBP, PLN, SEK, etc.)
- ✅ Custom fields (Policy #, Claim #, etc.)
- ✅ Audit trail active

---

## 🎮 How to Use

### **Scenario 1: View Audit Logs**

1. Login as `demo` (already admin role)
2. Click "Audit Log" in the sidebar
3. See all system activity
4. Filter by action or date
5. Export to CSV if needed

### **Scenario 2: Enable 2FA for Extra Security**

1. Login as `demo`
2. Click username → "Settings & 2FA"
3. Click "Enable 2FA"
4. Download Google Authenticator on phone
5. Scan QR code
6. Enter 6-digit code
7. 2FA enabled! ✅

### **Scenario 3: Search Journal Entries**

1. Click "Journal Entries" in sidebar
2. Use search box: type account number, policy #, or description
3. Or filter by amount: Select ">", enter "1500"
4. Click column headers to sort
5. Navigate pages with pagination

### **Scenario 4: View Reports**

1. Click "Reports" in sidebar
2. See grid of available reports
3. Click any report (e.g., "Loss Triangle")
4. Report opens in new browser tab
5. Clean view without navigation
6. Print or export as needed

---

## 🔐 Security Best Practices

1. **Change Demo Password**: Create your own users with strong passwords
2. **Enable 2FA**: Especially for admin accounts
3. **Review Audit Logs**: Regularly check for suspicious activity
4. **Use HTTPS**: In production, always use SSL/TLS
5. **Backup Data**: Regular backups of database and audit logs
6. **Monitor Failed Logins**: Check audit log for repeated failures
7. **Export Logs**: Periodically export audit logs for compliance

---

## 📊 Audit Log Examples

### **Sample Log Entries**

```
Timestamp             | User   | Action   | Description
---------------------|--------|----------|----------------------------------
04/11/2025 17:14:38  | System | GENERATE | Generated 5000 insurance bookings
04/11/2025 17:10:23  | demo   | LOGIN    | Login successful
04/11/2025 17:09:15  | demo   | ENABLE_2FA | 2FA enabled for user account
04/11/2025 17:05:42  | unknown| LOGIN    | Login failed - invalid credentials
```

### **Action Types with Colors**

- 🔵 **LOGIN** - User login attempts
- 🟢 **CREATE** - New records created
- 🟡 **UPDATE** - Records modified
- 🔴 **DELETE** - Records removed
- 🟣 **IMPORT/EXPORT** - Data transfers
- 🟢 **POST** - Journal entries posted
- 🔴 **VOID** - Journal entries voided
- 🔷 **GENERATE** - Sample data generation

---

## 🛡️ Compliance & Audit Trail

### **Regulatory Compliance**

The audit logging system helps meet requirements for:
- **GDPR** - Data access and modification tracking
- **SOX** - Financial transaction audit trail
- **Insurance Regulations** - Claims and policy change tracking
- **ISO 27001** - Information security management

### **Audit Trail Features**

✅ **Immutable** - Logs cannot be edited or deleted  
✅ **Complete** - All actions tracked  
✅ **Timestamped** - Precise datetime for each event  
✅ **User Attribution** - Every change tracked to a user  
✅ **Exportable** - CSV export for external analysis  
✅ **Filterable** - Search by multiple criteria  
✅ **Tamper-Evident** - Sequential logging with timestamps  

### **Retention Policy**

- Default: 90 days
- Configurable in `audit-log.js`
- Automatic cleanup of old logs
- Export before cleanup for archival

---

## 🎯 Key Improvements Implemented

### **Performance**
- ⚡ Fast table rendering (1,000 rows loads instantly)
- ⚡ Pagination for large datasets
- ⚡ Client-side filtering and sorting
- ⚡ Minimal DOM elements

### **Usability**
- 🎨 Clean, professional UI
- 🔍 Powerful search and filters
- 📄 One-row-per-entry table format
- 🎯 Account numbers prominently displayed
- 📊 Custom fields as dedicated columns
- 🔀 Clickable column sorting
- 💡 Hover tooltips for status explanations

### **Security**
- 🔐 Login required for all features
- 🔒 JWT token authentication
- 📱 Optional 2FA with Google Authenticator
- 🔍 Complete audit trail
- 👥 Admin-only audit log access
- 🚫 Failed login tracking

### **Features**
- 💰 Multi-currency support with real-time conversion
- 🌍 Multi-language (EN, DE, FR, ES, IT)
- 📊 Insurance loss triangle calculations
- 🔧 Custom field system
- 📥 CSV/Excel import
- 📤 PDF/CSV export
- 📈 Comprehensive financial reports

---

## 🚀 Next Steps

1. **Login**: Use demo/demo123 to access the system
2. **Explore**: Navigate through all features
3. **Enable 2FA**: Scan QR code with Google Authenticator
4. **View Audit Log**: See all tracked activities
5. **Test Features**: Search, filter, sort journal entries
6. **Generate Reports**: Open reports in separate tabs
7. **Review Changes**: Check audit log after each action

---

## 📞 Support

For questions or issues:

**Germany**: +49 1520 464 14 73  
**Italy**: +39 345 345 0098  
**Email**: mario.muja@gmail.com

---

## ✅ System Checklist

- [x] Backend running on port 3000
- [x] Frontend running on port 4300
- [x] Authentication system active
- [x] Demo user created
- [x] 5,000 journal entries loaded
- [x] Audit logging enabled
- [x] 2FA available
- [x] All routes protected
- [x] Logout functionality working
- [x] Admin access to audit logs
- [x] CSV export enabled
- [x] Multi-currency active
- [x] Multi-language active
- [x] Reports in separate tabs
- [x] Fast table sorting
- [x] Pagination working
- [x] Search and filters active

**🎉 System is ready for use!**

---

**BookKeeper Pro © 2025 | Professional Insurance Bookkeeping System**

