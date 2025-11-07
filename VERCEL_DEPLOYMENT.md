# Deploying Backend to Vercel

This guide will help you deploy your backend API to Vercel as serverless functions.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. MongoDB Atlas database (or your MongoDB connection string)
3. Vercel CLI installed (optional, for CLI deployment): `npm i -g vercel`

## Project Structure

The backend has been configured for Vercel with the following structure:
- `api/index.js` - Serverless function that wraps your Express app
- `vercel.json` - Vercel configuration for routing
- `backend/` - Your existing backend code (models, routes)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Add Vercel serverless function configuration"
   git push origin main
   ```

2. **Import project to Vercel**:
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

3. **Configure Environment Variables**:
   - In your Vercel project settings, go to "Environment Variables"
   - Add your MongoDB connection string:
     - **Name**: `MONGODB_URI`
     - **Value**: Your MongoDB Atlas connection string (e.g., `mongodb+srv://username:password@cluster.mongodb.net/book-distribution?retryWrites=true&w=majority`)
   - If deploying frontend separately, you may also need:
     - **Name**: `REACT_APP_API_URL`
     - **Value**: Your Vercel API URL (will be provided after deployment, e.g., `https://your-project.vercel.app/api`)

4. **Deploy**:
   - Click "Deploy"
   - Wait for the deployment to complete

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Set environment variables**:
   ```bash
   vercel env add MONGODB_URI
   # Paste your MongoDB connection string when prompted
   ```

4. **Deploy**:
   ```bash
   vercel
   ```
   
   For production deployment:
   ```bash
   vercel --prod
   ```

## API Endpoints

After deployment, your API will be available at:
- `https://your-project.vercel.app/api/books`
- `https://your-project.vercel.app/api/centers`
- `https://your-project.vercel.app/api/users`
- `https://your-project.vercel.app/api/test` (test endpoint)

## Frontend Configuration

If you're deploying the frontend separately or updating it to use the Vercel backend:

1. **Update API URL**:
   - Set environment variable `REACT_APP_API_URL` to your Vercel API URL
   - Or update `frontend/src/App.js` to use `/api` if frontend and backend are on the same domain

2. **Rebuild frontend**:
   ```bash
   cd frontend
   npm run build
   ```

## Testing the Deployment

1. **Test the API**:
   ```bash
   curl https://your-project.vercel.app/api/test
   ```

2. **Check MongoDB connection**:
   - The API should connect to MongoDB automatically
   - Check Vercel function logs if there are connection issues

## Troubleshooting

### MongoDB Connection Issues

- Ensure your MongoDB Atlas IP whitelist includes `0.0.0.0/0` (all IPs) or Vercel's IP ranges
- Verify your `MONGODB_URI` environment variable is set correctly
- Check Vercel function logs for connection errors

### CORS Issues

- CORS is already configured in the serverless function
- If you still see CORS errors, verify the frontend is making requests to the correct API URL

### Function Timeout

- Vercel free tier has a 10-second timeout for serverless functions
- For longer operations, consider upgrading to a paid plan or optimizing your queries

## Notes

- The serverless function uses connection caching to reuse MongoDB connections across invocations
- Each API route is handled by the same serverless function (catch-all pattern)
- The Express app is wrapped in a serverless function handler

## Updating the Deployment

After making changes:
1. Commit and push to GitHub
2. Vercel will automatically redeploy (if connected to GitHub)
3. Or run `vercel --prod` if using CLI

