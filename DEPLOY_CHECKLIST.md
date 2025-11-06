# Deployment Checklist ✅

## Before Deploying

- [x] Server uses `process.env.PORT` (already configured)
- [x] CORS is configured for all origins
- [x] MongoDB connection string is ready
- [x] Frontend API URL uses environment variable
- [x] Build scripts are in package.json
- [x] .env files are in .gitignore

## Deployment Steps

### Backend (Render)
1. [ ] Push code to GitHub
2. [ ] Create Render account
3. [ ] Create Web Service
4. [ ] Set environment variables:
   - [ ] PORT = 10000
   - [ ] MONGODB_URI = (your connection string)
5. [ ] Deploy and get backend URL

### Frontend (Vercel)
1. [ ] Create Vercel account
2. [ ] Import GitHub repository
3. [ ] Set root directory to `frontend`
4. [ ] Set environment variable:
   - [ ] REACT_APP_API_URL = https://your-backend.onrender.com/api
5. [ ] Deploy

### MongoDB Atlas
1. [ ] Go to Network Access
2. [ ] Add IP: 0.0.0.0/0 (Allow from anywhere)
3. [ ] Verify connection works

## Testing After Deployment

- [ ] Frontend loads correctly
- [ ] Can add a center
- [ ] Can add a user
- [ ] Can add a book
- [ ] Can add distribution
- [ ] Analytics work correctly

## URLs to Save

- Frontend URL: _______________________
- Backend URL: _______________________
- MongoDB URI: (already saved)

## Support

If you encounter issues:
1. Check Render logs
2. Check Vercel build logs
3. Check browser console
4. Verify environment variables are set correctly

