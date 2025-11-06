#!/bin/bash

# Deployment script for Book Distribution App
# This script will help deploy both frontend and backend

set -e

echo "🚀 Book Distribution App - Terminal Deployment"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Git not initialized. Initializing...${NC}"
    git init
    git add .
    git commit -m "Initial commit - ready for deployment"
    echo -e "${GREEN}✅ Git initialized${NC}"
    echo ""
    echo -e "${YELLOW}📝 Next steps:${NC}"
    echo "1. Create a repository on GitHub: https://github.com/new"
    echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    echo "3. Run: git push -u origin main"
    echo ""
    read -p "Have you created the GitHub repo and want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if we're on a branch
BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
echo -e "${BLUE}📦 Current branch: ${BRANCH}${NC}"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
    read -p "Commit changes? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "Update before deployment"
        echo -e "${GREEN}✅ Changes committed${NC}"
    fi
fi

# Push to GitHub
echo ""
echo -e "${BLUE}📤 Pushing to GitHub...${NC}"
git push origin $BRANCH || {
    echo -e "${YELLOW}⚠️  Push failed. Make sure you have a remote configured:${NC}"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    exit 1
}
echo -e "${GREEN}✅ Pushed to GitHub${NC}"

echo ""
echo "=============================================="
echo -e "${GREEN}✅ Code pushed to GitHub!${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. BACKEND (Render):"
echo "   - Go to: https://dashboard.render.com"
echo "   - Click 'New +' → 'Web Service'"
echo "   - Connect GitHub repo"
echo "   - Configure:"
echo "     * Root Directory: backend"
echo "     * Build Command: npm install"
echo "     * Start Command: npm start"
echo "     * Environment Variables:"
echo "       - PORT=10000"
echo "       - MONGODB_URI=your_mongodb_uri"
echo ""
echo "2. FRONTEND (Vercel):"
echo "   Run: ./deploy-frontend.sh"
echo "   Or use: vercel --prod"
echo ""
echo "=============================================="

