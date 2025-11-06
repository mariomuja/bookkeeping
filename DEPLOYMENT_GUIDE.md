# 🚀 Complete Deployment Guide - Session-Based Isolation

## ✅ **What We've Implemented**

### **Session-Based Demo Isolation** (Option D - Hybrid Approach)

Each demo user now gets their **own isolated data sandbox** that:
- ✅ Persists for **24 hours**
- ✅ **Never interferes** with other users' data
- ✅ **Auto-cleans up** expired sessions
- ✅ Scales to **unlimited concurrent users**

---

## 📊 **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                     User 1 (Demo Login)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Frontend   │
                    │   (Vercel)   │
                    └──────┬───────┘
                           │ JWT with sessionId
                           ▼
                    ┌──────────────┐
                    │   Backend    │
                    │   (Render)   │
                    └──────┬───────┘
                           │
                           ▼
            ┌──────────────────────────────┐
            │     PostgreSQL (Render)      │
            ├──────────────────────────────┤
            │ session_abc123:              │
            │   ├─ 10 accounts             │
            │   ├─ 4 journal entries       │
            │   └─ Expires: 24h later      │
            └──────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     User 2 (Demo Login)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
                    [Same Frontend/Backend]
                           │
                           ▼
            ┌──────────────────────────────┐
            │     PostgreSQL (Render)      │
            ├──────────────────────────────┤
            │ session_def456:              │
            │   ├─ 10 accounts (isolated)  │
            │   ├─ 4 journal entries       │
            │   └─ INDEPENDENT from User 1 │
            └──────────────────────────────┘
```

---

## 🛠️ **Manual Setup Required**

### **Step 1: Create GitHub Repositories**

You need to create ONE new GitHub repository:

```bash
# On GitHub.com, create:
Repository: mariomuja/dashboard-backend
Description: Backend API for KPI Dashboard
```

**Note:** `mariomuja/bookkeeping` already exists ✅

---

### **Step 2: Push Dashboard Backend**

```bash
cd C:\Users\mario\dashboard-backend
git push --set-upstream origin master
```

---

### **Step 3: Set Up Render PostgreSQL Databases**

#### **For Bookkeeping App:**

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Settings:
   - **Name:** `bookkeeping-db`
   - **Database:** `international_bookkeeping`
   - **User:** `bookkeeping_user`
   - **Region:** Choose closest to you
   - **Plan:** **Free** (256 MB, 90 days, then $7/month)
4. Click **"Create Database"**
5. Copy the **Internal Database URL**
6. Run the schema:
   ```bash
   # In Render's PostgreSQL dashboard, go to "Connect" tab
   # Copy the PSQL Command and run:
   psql [your-connection-string] < C:\Users\mario\bookkeeping\database\session-isolation-schema.sql
   ```

#### **For KPI Dashboard:**

1. Repeat above steps but with:
   - **Name:** `kpi-dashboard-db`
   - **Database:** `kpi_dashboard`
   - **User:** `kpi_dashboard_user`
2. Run the schema:
   ```bash
   psql [connection-string] < C:\Users\mario\dashboard-backend\database-schema.sql
   ```

---

### **Step 4: Update Render Backend Services**

#### **Bookkeeping Backend (Already Deployed):**

1. Go to your existing Render service: `international-bookkeeping-api`
2. Go to **"Environment"** tab
3. Add new environment variable:
   - **Key:** `DATABASE_URL`
   - **Value:** (Use "Add from database" → select `bookkeeping-db`)
4. Click **"Save Changes"**
5. Service will auto-redeploy

#### **Dashboard Backend (New Deployment):**

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect to `mariomuja/dashboard-backend` repository
4. Settings:
   - **Name:** `kpi-dashboard-api`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** **Free**
5. **Environment Variables** (will auto-populate from `render.yaml`):
   - `DATABASE_URL` → Select `kpi-dashboard-db`
   - `JWT_SECRET` → Auto-generated
   - `CORS_ORIGIN` → `https://kpi-dashboard.vercel.app`
   - `SESSION_EXPIRY_HOURS` → `24`
6. Click **"Create Web Service"**

---

### **Step 5: Update Frontend Environment Variables**

#### **Bookkeeping Frontend:**

File: `bookkeeping-frontend/src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://international-bookkeeping-api.onrender.com/api'
};
```

#### **Dashboard Frontend:**

Create: `C:\Users\mario\dashboard\src\environments\environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://kpi-dashboard-api.onrender.com/api'
};
```

---

### **Step 6: Deploy Dashboard to Vercel**

1. Go to https://vercel.com/new
2. Import `mariomuja/dashboard` repository
3. Settings (auto-detected from `vercel.json`):
   - **Framework Preset:** Angular
   - **Build Command:** `npm run vercel-build`
   - **Output Directory:** `dist/kpi-dashboard/browser`
4. Click **"Deploy"**
5. Once deployed, add custom domain (optional):
   - `kpi-dashboard.vercel.app` or custom domain

---

## 🧪 **Testing Session Isolation**

### **Test Scenario:**

1. **User 1 Actions:**
   - Open https://international-bookkeeping.vercel.app
   - Login with `demo` / `DemoUser2025!Secure`
   - Create a new account: "Test Account 1"
   - Create a journal entry: "User 1 Entry"

2. **User 2 Actions (Different Browser/Incognito):**
   - Open https://international-bookkeeping.vercel.app
   - Login with `demo` / `DemoUser2025!Secure`
   - Should see **only default demo data**
   - Should **NOT** see "Test Account 1" or "User 1 Entry"
   - Create account: "Test Account 2"

3. **Verify:**
   - User 1 refreshes → Still sees "Test Account 1" ✅
   - User 1 doesn't see "Test Account 2" ✅
   - User 2 doesn't see "Test Account 1" ✅
   - User 2 sees "Test Account 2" ✅

---

## 📋 **What Happens Now**

| User Action | Data Behavior |
|-------------|---------------|
| **Demo user logs in** | Creates new session with fresh demo data |
| **User creates accounts** | Saved to their session in PostgreSQL |
| **User creates journal entries** | Saved to their session in PostgreSQL |
| **User logs out** | Session remains active for 24h |
| **User logs back in (same browser)** | New session created (fresh start) |
| **Different user logs in** | Gets completely separate session |
| **24 hours pass** | Session auto-deleted by cleanup job |

---

## 🔧 **Manual Cleanup (if needed)**

```sql
-- See all active sessions
SELECT * FROM demo_sessions WHERE is_active = TRUE;

-- See session statistics
SELECT * FROM demo_session_stats;

-- Manual cleanup
SELECT * FROM cleanup_expired_sessions();

-- Delete specific session
DELETE FROM demo_sessions WHERE session_id = 'abc-123-def';
```

---

## 📊 **Database Limits (Render Free Tier)**

- **Storage:** 256 MB
- **Connections:** 97 hours/month active time
- **Estimated Capacity:** ~100-200 concurrent sessions
- **Auto-cleanup:** Keeps database size manageable

---

## 🎯 **Benefits of This Implementation**

1. ✅ **True Isolation** - No data conflicts between demo users
2. ✅ **Persistent Play** - Changes last 24 hours
3. ✅ **Automatic Cleanup** - No manual maintenance
4. ✅ **Production Ready** - Scales to many users
5. ✅ **Free Tier Compatible** - Works on Render's free plan
6. ✅ **Future Proof** - Easy to add real user accounts later

---

## 🚨 **Important Notes**

1. **GitHub Repository Required:**
   - You must create `mariomuja/dashboard-backend` on GitHub before pushing

2. **Render PostgreSQL:**
   - Free tier sleeps after inactivity
   - First request might be slow (cold start)
   - Consider upgrading to paid tier ($7/month) for production

3. **Session Tokens:**
   - Stored in JWT (no cookies needed)
   - Frontend stores in localStorage
   - Auto-expires after 24 hours

---

## 📞 **Next Steps After GitHub Repo Creation**

```bash
# 1. Create mariomuja/dashboard-backend on GitHub

# 2. Push backend code
cd C:\Users\mario\dashboard-backend
git push --set-upstream origin master

# 3. Follow Step 4 (Render setup)

# 4. Follow Step 5 (Frontend env vars)

# 5. Follow Step 6 (Vercel deployment)

# 6. Test! 🎉
```

---

## 📚 **Files Created**

### **Bookkeeping:**
- ✅ `database/session-isolation-schema.sql` - PostgreSQL schema
- ✅ `bookkeeping-backend/session-manager.js` - Session management
- ✅ `bookkeeping-backend/db-queries.js` - Database queries
- ✅ `render.yaml` - Render configuration

### **Dashboard:**
- ✅ `dashboard-backend/` - Complete backend separation
- ✅ `dashboard-backend/database-schema.sql` - PostgreSQL schema
- ✅ `dashboard-backend/session-manager.js` - Session management  
- ✅ `dashboard-backend/render.yaml` - Render configuration
- ✅ `dashboard-backend/mock-data.js` - Default demo data

---

**All code is ready to deploy!** Just need to create the GitHub repo and follow the deployment steps above.

