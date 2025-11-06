# Deployment Guide

This guide will help you deploy the Book Distribution App for free using:
- **Backend**: Render (free tier)
- **Frontend**: Vercel (free tier)
- **Database**: MongoDB Atlas (already configured)

## Prerequisites

1. GitHub account
2. Render account (sign up at https://render.com)
3. Vercel account (sign up at https://vercel.com)
4. MongoDB Atlas account (already have)

## Step 1: Push Code to GitHub

1. Create a new repository on GitHub
2. Push your code:
```bash
cd /Users/test/Downloads/self/book-distribution-app
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/book-distribution-app.git
git push -u origin main
```

## Step 2: Deploy Backend to Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `book-distribution-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: Leave empty (or set to `backend` if needed)

5. Add Environment Variables:
   - `PORT`: `10000` (Render uses this port)
   - `MONGODB_URI`: Your MongoDB Atlas connection string
     ```
     mongodb+srv://iymfpanathur_db_user:TlPQctbpVzXUnYBl@cluster0.xug7orv.mongodb.net/book-distribution?retryWrites=true&w=majority
     ```

6. Click "Create Web Service"
7. Wait for deployment (takes 5-10 minutes)
8. Copy the service URL (e.g., `https://book-distribution-backend.onrender.com`)

## Step 3: Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. Add Environment Variable:
   - `REACT_APP_API_URL`: Your Render backend URL + `/api`
     ```
     https://book-distribution-backend.onrender.com/api
     ```

6. Click "Deploy"
7. Wait for deployment (takes 2-3 minutes)
8. Your app will be live at a URL like `https://book-distribution-app.vercel.app`

## Step 4: Update MongoDB Atlas Network Access

1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (or add Render's IP ranges)
4. This allows Render to connect to your database

## Step 5: Test Your Deployment

1. Visit your Vercel frontend URL
2. Try adding a center
3. Try adding a user
4. Test the full functionality

## Troubleshooting

### Backend Issues:
- Check Render logs for errors
- Verify MongoDB connection string is correct
- Ensure PORT environment variable is set

### Frontend Issues:
- Check Vercel build logs
- Verify REACT_APP_API_URL points to your Render backend
- Check browser console for CORS errors (should be fixed)

### CORS Issues:
- The backend CORS is configured to allow all origins
- If issues persist, check Render logs

## Alternative: Deploy Both on Render

You can also deploy both on Render:
- Backend as Web Service
- Frontend as Static Site (after building)

## Notes

- Render free tier: Services may spin down after 15 minutes of inactivity (first request may be slow)
- Vercel free tier: Unlimited requests, great for React apps
- Both services are free and suitable for production use

