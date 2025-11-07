# Quick Start: Deploy Backend to Vercel

## Quick Checklist

1. ✅ **Code is ready** - Serverless function created at `api/index.js`
2. ✅ **Configuration ready** - `vercel.json` configured
3. ⚠️ **Set MongoDB URI** - Add `MONGODB_URI` environment variable in Vercel dashboard
4. ⚠️ **Deploy** - Push to GitHub and import to Vercel, or use CLI

## Fastest Way to Deploy

### Using Vercel Dashboard (5 minutes)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add Vercel serverless backend"
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to https://vercel.com/new
   - Import your repository
   - Vercel auto-detects configuration

3. **Add Environment Variable**:
   - In project settings → Environment Variables
   - Add: `MONGODB_URI` = `your-mongodb-connection-string`

4. **Deploy**:
   - Click "Deploy"
   - Your API will be live at `https://your-project.vercel.app/api`

### Using Vercel CLI (3 minutes)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Add environment variable
vercel env add MONGODB_URI
# Paste your MongoDB connection string

# Deploy
vercel --prod
```

## Test Your Deployment

```bash
# Test API
curl https://your-project.vercel.app/api/test

# Should return: {"message":"Server is running!"}
```

## Update Frontend (if needed)

If your frontend is on a different domain, update the API URL:

```bash
# In Vercel dashboard, add environment variable:
REACT_APP_API_URL=https://your-project.vercel.app/api
```

Or if frontend and backend are on the same Vercel project, use:
```javascript
const API_URL = '/api';  // Relative path
```

## Need Help?

See `VERCEL_DEPLOYMENT.md` for detailed instructions and troubleshooting.

