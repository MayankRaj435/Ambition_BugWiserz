# 🚀 Deployment Guide

This guide will help you deploy the Ambition ML Platform to production using Vercel (Frontend) and Railway (Backend).

## 📋 Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Railway account (sign up at [railway.app](https://railway.app))
- Clerk account for authentication (sign up at [clerk.com](https://clerk.com))

---

## 🎯 Step 1: Deploy Backend to Railway

### 1.1 Sign Up & Create Project
1. Go to [railway.app](https://railway.app)
2. Click "Login" and sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose `Ambition_BugWiserz` repository

### 1.2 Configure Backend
1. Railway will auto-detect Python
2. Set **Root Directory**: Leave empty (Railway will find `Procfile`)
3. Click on your service → **Variables** tab
4. Add environment variables:
   ```
   FLASK_ENV=production
   PORT=5000
   CORS_ORIGINS=https://your-app.vercel.app
   ```
   *(Replace `your-app.vercel.app` with your actual Vercel domain after Step 2)*

### 1.3 Get Your Backend URL
1. Go to **Settings** tab
2. Under **Domains**, you'll see your Railway URL
3. Copy it (e.g., `https://ambition-production.up.railway.app`)
4. **Save this URL** - you'll need it for frontend deployment

---

## 🌐 Step 2: Deploy Frontend to Vercel

### 2.1 Sign Up & Import Project
1. Go to [vercel.com](https://vercel.com)
2. Click "Login" and sign in with GitHub
3. Click "Add New..." → "Project"
4. Import `Ambition_BugWiserz` repository

### 2.2 Configure Frontend
1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: Click "Edit" → Select `FRONTEND`
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)

### 2.3 Add Environment Variables
Click "Environment Variables" and add:

```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
```

**To get Clerk keys:**
1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Go to **API Keys**
4. Copy the **Publishable Key**

### 2.4 Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like `https://ambition-bugwiserz.vercel.app`

---

## 🔄 Step 3: Update CORS Settings

### 3.1 Update Railway Environment Variables
1. Go back to Railway
2. Click on your backend service
3. Go to **Variables** tab
4. Update `CORS_ORIGINS` with your Vercel URL:
   ```
   CORS_ORIGINS=https://your-actual-app.vercel.app
   ```
5. Click "Save"
6. Railway will automatically redeploy

---

## ✅ Step 4: Verify Deployment

### 4.1 Test Backend
Visit: `https://your-backend.railway.app/`

You should see: `{"message": "ML Platform API is running"}`

### 4.2 Test Frontend
1. Visit your Vercel URL
2. Try uploading a CSV file
3. Train a model
4. Check if results display correctly

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Backend not starting
- **Solution**: Check Railway logs → Click service → "Deployments" → View logs
- Ensure `requirements.txt` has all dependencies
- Check Python version in `runtime.txt`

**Problem**: CORS errors
- **Solution**: Verify `CORS_ORIGINS` environment variable matches your Vercel URL exactly

### Frontend Issues

**Problem**: API calls failing
- **Solution**: Check `NEXT_PUBLIC_API_URL` in Vercel environment variables
- Ensure it includes `https://` and no trailing slash

**Problem**: Build failing
- **Solution**: Check Vercel build logs
- Ensure `FRONTEND` is set as root directory
- Verify all dependencies in `package.json`

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use environment variables** for all sensitive data
3. **Enable Vercel password protection** for staging environments
4. **Set up custom domain** with SSL (both platforms provide free SSL)

---

## 📊 Monitoring & Scaling

### Railway
- **Logs**: View real-time logs in Railway dashboard
- **Metrics**: CPU, Memory, Network usage available
- **Scaling**: Upgrade to Pro plan ($5/month) for better performance

### Vercel
- **Analytics**: Built-in analytics for page views
- **Logs**: View function logs in dashboard
- **Scaling**: Auto-scales based on traffic

---

## 💰 Cost Estimate

### Free Tier (Perfect for starting)
- **Vercel**: 100GB bandwidth, unlimited deployments
- **Railway**: 500 hours/month, $5 credit
- **Total**: **$0/month**

### Recommended Upgrade (When you get users)
- **Vercel Pro**: $20/month (better performance, analytics)
- **Railway Pro**: $5/month (no cold starts, better resources)
- **Total**: **$25/month**

---

## 🎉 You're Live!

Your ML platform is now accessible globally! 🌍

**Share your URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-backend.railway.app`

---

## 📝 Post-Deployment Checklist

- [ ] Test file upload functionality
- [ ] Test model training with sample data
- [ ] Verify XAI charts display correctly
- [ ] Test code export feature
- [ ] Test model deployment and predictions
- [ ] Set up custom domain (optional)
- [ ] Add monitoring/error tracking (Sentry, LogRocket)
- [ ] Update README with live demo links

---

## 🆘 Need Help?

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Issues**: Open an issue on GitHub

---

**Happy Deploying! 🚀**
