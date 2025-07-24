# 🚀 Deployment Guide

This timesheet tracker app is ready to deploy on any hosting service. Here are the most popular free options:

## 📁 Project Structure
```
├── backend/          # Express.js API server
├── frontend/         # React.js application
├── docs/            # Documentation
└── README.md        # Main documentation
```

## 🏗️ Deployment Options

### Option 1: Render.com (Recommended - Completely Free)
**Backend (Web Service):**
1. Create account at [render.com](https://render.com)
2. Connect GitHub repository
3. Create "Web Service"
4. Settings:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node

**Frontend (Static Site):**
1. Create "Static Site" on Render
2. Settings:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Publish Directory: `build`

### Option 2: Railway (Backend) + Netlify (Frontend)
**Backend:**
```bash
npm install -g @railway/cli
railway login
cd backend
railway init
railway up
```

**Frontend:**
- Connect repository to Netlify
- Build directory: `frontend`
- Build command: `npm run build`
- Publish directory: `frontend/build`

### Option 3: Fly.io
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy backend
cd backend
fly launch
fly deploy

# Deploy frontend
cd ../frontend
npm run build
fly launch --dockerfile-generator
```

## 🔧 Environment Variables

### Backend Variables:
```
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-secure-random-string
NODE_ENV=production
PORT=5000
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Frontend Variables:
```
REACT_APP_API_URL=https://your-backend-domain.com/api
```

## 📝 Deployment Checklist

### Backend Setup:
- [ ] Set `MONGODB_URI` to MongoDB Atlas connection string
- [ ] Set `JWT_SECRET` to a secure random string
- [ ] Set `NODE_ENV=production`
- [ ] Set `ALLOWED_ORIGINS` to your frontend domain
- [ ] Deploy backend and note the URL

### Frontend Setup:
- [ ] Set `REACT_APP_API_URL` to your backend URL + `/api`
- [ ] Deploy frontend
- [ ] Update backend `ALLOWED_ORIGINS` if needed

### Testing:
- [ ] Visit frontend URL - should load login page
- [ ] Test user registration
- [ ] Test user login
- [ ] Test timesheet functionality
- [ ] Test all navigation links

## 🔄 Local Development

### Start Backend:
```bash
cd backend
npm install
npm start
```

### Start Frontend:
```bash
cd frontend
npm install
npm start
```

Visit: http://localhost:3000

## 🆘 Troubleshooting

### CORS Errors:
- Ensure `ALLOWED_ORIGINS` includes your frontend domain
- Check that frontend `REACT_APP_API_URL` points to correct backend

### Database Connection:
- Verify MongoDB Atlas connection string
- Check that IP whitelist includes 0.0.0.0/0 for cloud hosting

### 404 Errors:
- Ensure frontend build directory is correctly configured
- Check that API routes are properly set up
