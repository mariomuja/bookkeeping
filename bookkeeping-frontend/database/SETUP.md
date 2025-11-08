# Neon PostgreSQL Setup Guide

## Step 1: Create Neon Databases

You need **TWO separate Neon databases** (one for each app):

### A. Bookkeeping Database

1. Go to https://console.neon.tech
2. Click "Create Project" or use existing project
3. Database name: `bookkeeping` (or `international-bookkeeping`)
4. Region: Choose closest to you (e.g., AWS us-east-1)
5. Copy the **connection string** - looks like:
   ```
   postgresql://user:password@ep-xxxx.us-east-1.aws.neon.tech/bookkeeping?sslmode=require
   ```

### B. Dashboard Database

1. Create another database in Neon
2. Database name: `kpi-dashboard`
3. Copy the **connection string**

---

## Step 2: Initialize Bookkeeping Database

```bash
cd bookkeeping-frontend/database

# Set your Neon connection string
export DATABASE_URL="postgresql://user:password@ep-xxxx.us-east-1.aws.neon.tech/bookkeeping?sslmode=require"

# Run initialization script
node init.js
```

Expected output:
```
🔌 Connecting to Neon PostgreSQL...
📋 Creating tables...
✅ Tables created successfully!
🌱 Seeding demo data...
✅ Demo data seeded successfully!
✅ Database initialized! 13 accounts created.
🎉 Database setup complete!
```

---

## Step 3: Initialize Dashboard Database

```bash
cd ../../dashboard/dashboard-frontend/database

# Set your dashboard Neon connection string
export DATABASE_URL="postgresql://user:password@ep-xxxx.us-east-1.aws.neon.tech/kpi-dashboard?sslmode=require"

# Run initialization script
node init.js
```

---

## Step 4: Add to Vercel Environment Variables

### Bookkeeping App:
https://vercel.com/mariomuja/international-bookkeeping/settings/environment-variables

Add:
- **Key:** `DATABASE_URL`
- **Value:** Your bookkeeping Neon connection string
- **Environments:** ✅ All three (Production, Preview, Development)

### Dashboard App:
https://vercel.com/mariomuja/international-kpi-dashboard/settings/environment-variables

Add:
- **Key:** `DATABASE_URL`
- **Value:** Your dashboard Neon connection string
- **Environments:** ✅ All three

---

## Step 5: Redeploy

After adding DATABASE_URL, Vercel will automatically redeploy both apps with database connectivity!

---

## Verification

After setup, your apps will:
- ✅ Load real data from Neon PostgreSQL
- ✅ Persist data between sessions
- ✅ Fallback to mock data if database is unavailable
- ✅ Show 13 accounts in Chart of Accounts
- ✅ Show 3 journal entries
- ✅ Calculate real metrics on dashboard

---

## Need Help?

If you need me to run the initialization scripts for you, provide your Neon connection strings and I'll set everything up!

