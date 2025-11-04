# Troubleshooting Guide - BookKeeper Pro

## Issue: No Data Showing in App

If you see empty Chart of Accounts or Journal Entries, follow these steps:

### Solution 1: Clear Browser Cache and Storage

1. **Open Chrome DevTools**: Press `F12` or `Ctrl+Shift+I`
2. **Open Application Tab**: Click "Application" in the top menu
3. **Clear Storage**: 
   - Click "Storage" in the left sidebar
   - Click "Clear site data" button
   - Confirm the action
4. **Hard Refresh**: Press `Ctrl+F5` or `Ctrl+Shift+R`

### Solution 2: Clear LocalStorage via Console

1. **Open Console**: Press `F12` → Click "Console" tab
2. **Run Command**:
   ```javascript
   localStorage.clear();
   location.reload();
   ```
3. **App will restart** with fresh data

### Solution 3: Verify Backend Connection

1. **Check Backend Status**:
   ```
   http://localhost:3000/api/health
   ```
   Should return: `{"status":"ok"}`

2. **Check Organization**:
   ```
   http://localhost:3000/api/organizations
   ```
   Should return organization data

3. **Check Accounts**:
   ```
   http://localhost:3000/api/organizations/550e8400-e29b-41d4-a716-446655440000/accounts
   ```
   Should return 10 accounts

4. **Check Journal Entries**:
   ```
   http://localhost:3000/api/organizations/550e8400-e29b-41d4-a716-446655440000/journal-entries
   ```
   Should return 20,000 entries

### Solution 4: Check Console for Errors

1. **Open Console**: Press `F12`
2. **Look for red error messages**
3. **Common issues**:
   - `CORS error`: Backend not allowing frontend origin
   - `404 Not Found`: Backend not running
   - `Network error`: Wrong API URL

### Solution 5: Restart Services

**Stop All Services**:
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

**Start Backend**:
```powershell
cd bookkeeping-backend
npm start
```

**Start Frontend** (new terminal):
```powershell
cd bookkeeping-frontend
ng serve --port 4300
```

### Current Data Status

✅ **Backend Data Confirmed**:
- Organization ID: `550e8400-e29b-41d4-a716-446655440000`
- Organization Name: Demo Insurance Company
- Accounts: 10 (Cash, Receivables, Payables, etc.)
- Journal Entries: 20,000 (insurance premiums & claims)
- Revenue: $29.6M
- Expenses: $124.7M

### Debug Checklist

- [ ] Backend running on http://localhost:3000
- [ ] Frontend running on http://localhost:4300
- [ ] Browser console shows no errors
- [ ] LocalStorage cleared
- [ ] Hard refresh performed (Ctrl+F5)
- [ ] Organization ID matches: `550e8400-e29b-41d4-a716-446655440000`

### Manual Data Verification

**Test in Browser Console** (F12 → Console):
```javascript
// Check if API is accessible
fetch('http://localhost:3000/api/organizations')
  .then(r => r.json())
  .then(d => console.log('Organizations:', d));

// Check current organization in app
console.log('Current Org:', localStorage.getItem('currentOrganization'));

// Force set correct organization
localStorage.setItem('currentOrganization', JSON.stringify({
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Demo Insurance Company',
  countryCode: 'US',
  defaultCurrency: 'USD'
}));

// Reload
location.reload();
```

### Still Having Issues?

1. **Check Network Tab** (F12 → Network):
   - Refresh the page
   - Look for API calls to `localhost:3000`
   - Check if they return 200 OK status
   - Click on failed requests to see details

2. **Check Browser Console** (F12 → Console):
   - Look for any red error messages
   - Share the error message for help

3. **Verify Organization Service**:
   - Open Console (F12)
   - Type: `window.location.reload()`
   - Check if data loads after fresh start

## Quick Fix Command

**Run this in PowerShell**:
```powershell
# Stop all node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Start backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd bookkeeping-backend; npm start"

# Wait for backend
Start-Sleep -Seconds 5

# Start frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd bookkeeping-frontend; ng serve --port 4300"

# Wait for frontend
Start-Sleep -Seconds 20

# Open browser
start chrome "http://localhost:4300"
```

Then in Chrome, press **Ctrl+Shift+Delete** → Check "Cookies and other site data" and "Cached images and files" → Click "Clear data" → Refresh page.

