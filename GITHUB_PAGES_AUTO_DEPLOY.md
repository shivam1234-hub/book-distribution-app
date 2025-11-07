# Automatic GitHub Pages Deployment

Your repository is now configured to automatically deploy to GitHub Pages when you push to the `main` branch!

## Setup Steps (One-time)

### 1. Enable GitHub Pages in Repository Settings

1. Go to your GitHub repository: `https://github.com/shivam1234-hub/book-distribution-app`
2. Click on **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select:
   - **Source**: `GitHub Actions`
5. Click **Save**

### 2. Verify Workflow Permissions

The workflow file (`.github/workflows/deploy.yml`) is already configured with the correct permissions. No action needed.

## How It Works

✅ **Automatic Deployment**: Every time you push to the `main` branch:
1. GitHub Actions automatically triggers
2. Builds your React frontend
3. Deploys to GitHub Pages
4. Your site will be live at: `https://shivam1234-hub.github.io/book-distribution-app`

## Viewing Deployments

- Go to **Actions** tab in your GitHub repository to see deployment status
- Green checkmark = successful deployment
- Red X = deployment failed (check logs)

## Manual Deployment (Alternative)

If you prefer manual deployment, you can still use:
```bash
cd frontend
npm run deploy
```

## Troubleshooting

### Workflow not running?
- Check that the workflow file is in `.github/workflows/deploy.yml`
- Make sure you're pushing to the `main` branch
- Check the **Actions** tab for any errors

### Build failing?
- Check that all dependencies are in `frontend/package.json`
- Verify Node.js version (should be 18+)
- Check the Actions logs for specific errors

### Pages not updating?
- Wait a few minutes after push (deployment takes 1-2 minutes)
- Clear browser cache
- Check the Actions tab to confirm deployment completed

## Environment Variables (Optional)

If you need to customize API URLs, you can add secrets in:
**Settings → Secrets and variables → Actions → New repository secret**

- `REACT_APP_API_URL_VERCEL` (optional)
- `REACT_APP_API_URL_RENDER` (optional)

The workflow will use defaults if these aren't set.

