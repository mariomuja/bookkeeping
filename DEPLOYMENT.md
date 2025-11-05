# 🚀 Deployment Guide - International Bookkeeping

This guide explains how to deploy International Bookkeeping to **Vercel (Frontend)** and **Render.com (Backend)** for free.

## 📋 Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com - free)
- Render account (sign up at https://render.com - free)
- Your International Bookkeeping code pushed to GitHub

## 🎯 Deployment Overview

**Architecture:**
```
Frontend (Angular)          Backend (Express/Node.js)
    Vercel                        Render.com
       ↓                              ↓
https://international-bookkeeping          https://international-bookkeeping-api
    .vercel.app              →   .onrender.com/api
```

---

## 📦 Part 1: Deploy Backend to Render.com

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 2: Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `mariomuja/bookkeeping`
3. Configure the service:
   - **Name**: `international-bookkeeping-api`
   - **Region**: `Frankfurt` (closest to Germany)
   - **Branch**: `main`
   - **Root Directory**: Leave empty (or enter `bookkeeping-backend` if structure changes)
   - **Runtime**: `Node`
   - **Build Command**: `cd bookkeeping-backend && npm install`
   - **Start Command**: `cd bookkeeping-backend && node server.js`
   - **Plan**: `Free`

### Step 3: Set Environment Variables
In the Render dashboard, add these environment variables:

```
NODE_ENV=production
PORT=3000
USE_MOCK_DATA=true
CORS_ORIGIN=https://international-bookkeeping.vercel.app
```

**Important**: You'll update `CORS_ORIGIN` after deploying the frontend in Part 2.

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Wait 2-3 minutes for deployment
3. Your backend will be available at: `https://international-bookkeeping-api.onrender.com`
4. Test it: Open `https://international-bookkeeping-api.onrender.com/api/health`
   - You should see: `{"status":"ok","version":"1.0.0",...}`

### Step 5: Note Your Backend URL
Copy the URL: `https://international-bookkeeping-api.onrender.com/api`
You'll need this for the frontend deployment.

---

## 🎨 Part 2: Deploy Frontend to Vercel

### Step 1: Update Backend URL in Frontend
1. Open `bookkeeping-frontend/src/environments/environment.prod.ts`
2. Update the `apiUrl` with your Render backend URL:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://international-bookkeeping-api.onrender.com/api'  // Your actual URL
   };
   ```
3. Commit and push this change:
   ```bash
   git add bookkeeping-frontend/src/environments/environment.prod.ts
   git commit -m "Update production API URL for Render backend"
   git push
   ```

### Step 2: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel to access your repositories

### Step 3: Import Project
1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository: `mariomuja/bookkeeping`
3. Configure the project:
   - **Framework Preset**: `Other` (or `Angular` if available)
   - **Root Directory**: `bookkeeping-frontend`
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist/bookkeeping-frontend/browser`
   - **Install Command**: `npm install`

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for build and deployment
3. Your frontend will be available at: `https://international-bookkeeping-XXXXX.vercel.app`
   (Vercel generates a unique URL)

### Step 5: Update CORS in Backend
Now that you have your Vercel URL, update the backend:

1. Go to Render dashboard → Your service
2. Go to **"Environment"** tab
3. Update `CORS_ORIGIN` environment variable:
   ```
   CORS_ORIGIN=https://international-bookkeeping-XXXXX.vercel.app
   ```
   (Use your actual Vercel URL)
4. Click **"Save Changes"**
5. Render will automatically redeploy (takes ~1 minute)

---

## ✅ Verification

### Test Your Deployed Application

1. **Open Frontend**: `https://international-bookkeeping-XXXXX.vercel.app`
2. **Check Bootstrap Screen**: Should show all systems ready
3. **Login**: Use `demo` / `demo123`
4. **Test Features**:
   - ✅ Dashboard loads
   - ✅ Accounts show data
   - ✅ Journal entries display
   - ✅ Reports generate
   - ✅ Framework import works

### Common Issues

**Issue 1: Frontend shows "Backend Connectivity Error"**
- **Cause**: CORS_ORIGIN not set correctly
- **Fix**: Update CORS_ORIGIN in Render to match your exact Vercel URL (including https://)

**Issue 2: Backend returns 404**
- **Cause**: Backend not fully deployed
- **Fix**: Check Render logs for errors, ensure build completed

**Issue 3: "Application Not Found"**
- **Cause**: Wrong API URL in frontend
- **Fix**: Check environment.prod.ts has correct Render URL

---

## 🔄 Automatic Deployments

Both Vercel and Render are configured for automatic deployments:

- **Push to GitHub `main` branch** → Both services automatically redeploy
- **Frontend**: Rebuilds in ~2 minutes
- **Backend**: Rebuilds in ~1 minute

---

## 💰 Cost & Limits

### Vercel (Free Tier)
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Custom domains
- ✅ Automatic HTTPS
- ✅ Perfect for this application

### Render (Free Tier)
- ✅ 750 hours/month (enough for always-on)
- ⚠️ Spins down after 15 minutes of inactivity
- ⚠️ Takes ~30 seconds to wake up on first request
- ✅ Automatic HTTPS
- ✅ Good for demo/testing

**Note**: For production use with no sleep time, consider upgrading Render to $7/month.

---

## 🔧 Custom Domain (Optional)

### Add Custom Domain to Vercel
1. Go to Vercel dashboard → Your project
2. Click **"Settings"** → **"Domains"**
3. Add your domain (e.g., `bookkeeper.yourdomain.com`)
4. Follow DNS configuration instructions
5. Vercel provides automatic HTTPS

### Update Backend CORS
After adding custom domain, update `CORS_ORIGIN` in Render to your new domain.

---

## 📊 Monitoring & Logs

### Vercel Logs
- Go to Vercel dashboard → Your project → **"Deployments"**
- Click any deployment to see build logs
- View runtime logs in **"Functions"** tab

### Render Logs
- Go to Render dashboard → Your service
- Click **"Logs"** tab
- See real-time application logs
- Check for errors or performance issues

---

## 🔄 Updating Your Deployment

### To Deploy Changes:
```bash
# 1. Make your changes locally
# 2. Test locally with npm start
# 3. Commit and push
git add .
git commit -m "Your changes"
git push

# That's it! Both Vercel and Render will auto-deploy
```

---

## 🆘 Troubleshooting

### Backend Sleeping (Render Free Tier)
**Problem**: First request takes 30 seconds
**Solution**:
- This is normal for free tier
- Consider upgrading to $7/month for always-on
- Or: Use a service like UptimeRobot to ping every 10 minutes

### Build Fails on Vercel
**Check**:
- Build command is correct: `npm run vercel-build`
- Output directory: `dist/bookkeeping-frontend/browser`
- Node version compatible (Vercel uses Node 18 by default)

### Build Fails on Render
**Check**:
- Build command includes `cd bookkeeping-backend`
- All dependencies in package.json
- Check logs for specific error messages

---

## 🎉 Success!

Your application is now live and accessible worldwide:

- **Frontend**: https://international-bookkeeping-XXXXX.vercel.app
- **Backend API**: https://international-bookkeeping-api.onrender.com/api
- **Health Check**: https://international-bookkeeping-api.onrender.com/api/health

**Demo Credentials**: `demo` / `demo123`

Share this URL with anyone to showcase your bookkeeping application! 🚀

---

## 📝 Next Steps

1. **Add Custom Domain** (optional)
2. **Set up Database** (optional - for production use)
3. **Configure Email** (for 2FA/notifications)
4. **Monitor Usage** (check Vercel/Render dashboards)
5. **Consider Upgrading** Render for no-sleep backend ($7/month)

---

## 💡 Tips

- **Use Environment Variables**: Never commit secrets to git
- **Monitor Logs**: Check regularly for errors
- **Test After Deploy**: Always verify functionality
- **Keep Costs Low**: Free tier is perfect for demo/testing
- **Upgrade When Ready**: For production, upgrade Render to prevent sleeping

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Check application logs in dashboards
- Open GitHub issue for application-specific problems
