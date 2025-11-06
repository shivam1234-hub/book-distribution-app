#!/bin/bash

# Deploy frontend to Vercel using CLI

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Deploying Frontend to Vercel${NC}"
echo "=============================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Vercel${NC}"
    echo "Logging in..."
    vercel login
fi

cd frontend

echo -e "${BLUE}📦 Building frontend...${NC}"
npm install
npm run build

echo ""
echo -e "${BLUE}🚀 Deploying to Vercel...${NC}"
echo ""

# Get backend URL from user
read -p "Enter your Render backend URL (e.g., https://book-distribution-backend.onrender.com): " BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    echo -e "${YELLOW}⚠️  No backend URL provided. You can set it later in Vercel dashboard.${NC}"
    BACKEND_URL="https://your-backend.onrender.com"
fi

# Remove trailing slash and add /api
BACKEND_URL="${BACKEND_URL%/}/api"

echo ""
echo -e "${BLUE}Deploying with environment variable:${NC}"
echo "REACT_APP_API_URL=$BACKEND_URL"
echo ""

# Deploy to Vercel
vercel --prod \
    --yes \
    --env REACT_APP_API_URL=$BACKEND_URL \
    --cwd . \
    --name book-distribution-app

echo ""
echo -e "${GREEN}✅ Frontend deployed!${NC}"
echo ""
echo "Your app should be live at the URL shown above."
echo ""
echo "To update environment variables later:"
echo "  vercel env add REACT_APP_API_URL production"

cd ..

