# Vercel Deployment Guide for MindVap

This guide provides step-by-step instructions to deploy your MindVap project to Vercel.

## Prerequisites

1. A Vercel account (sign up at [https://vercel.com](https://vercel.com))
2. Git installed on your computer
3. Node.js and npm installed
4. The project code on your local machine

## Step 1: Prepare Your Project

### 1.1 Install Project Dependencies
```bash
cd mindvap
npm install
```

### 1.2 Build the Project
```bash
npm run build
```

### 1.3 Verify the Build
Check that the `dist` folder is created with the compiled assets.

## Step 2: Set Up Git Repository

### 2.1 Initialize Git (if not already done)
```bash
cd /Users/lycanbeats/Desktop/Herb business/MindVap WebPage
git init
```

### 2.2 Create a .gitignore File
Ensure you have a `.gitignore` file with the following content:
```
node_modules/
.env
.DS_Store
*.log
```

### 2.3 Commit Your Code
```bash
git add .
git commit -m "Initial commit"
```

### 2.4 Create a GitHub Repository
1. Go to [https://github.com](https://github.com)
2. Click "New" to create a new repository
3. Name it "mindvap-ecommerce"
4. Click "Create repository"

### 2.5 Push to GitHub
```bash
git remote add origin https://github.com/your-username/mindvap-ecommerce.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### 3.1 Sign in to Vercel
1. Go to [https://vercel.com](https://vercel.com)
2. Sign in with your GitHub account

### 3.2 Create a New Project
1. Click "Add New" > "Project"
2. Select your GitHub repository "mindvap-ecommerce"
3. Click "Import"

### 3.3 Configure Project Settings
1. **Project Name**: "mindvap-ecommerce"
2. **Framework Preset**: "Vite"
3. **Root Directory**: "mindvap"
4. **Build Command**: "npm run build"
5. **Output Directory**: "dist"
6. **Install Command**: "npm install"

### 3.4 Add Environment Variables
1. Go to the "Settings" tab
2. Click "Environment Variables"
3. Add the following variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `VITE_APP_URL`: Your production app URL (e.g., `https://mindvap-ecommerce.vercel.app`)

### 3.5 Deploy
1. Click "Deploy"
2. Wait for the deployment to complete

## Step 4: Verify Deployment

### 4.1 Check Deployment Status
1. Go to the "Deployments" tab
2. Verify that the deployment is successful

### 4.2 Test the Live Site
1. Click the deployment URL
2. Test the application to ensure it works correctly

## Step 5: Set Up Custom Domain (Optional)

### 5.1 Add a Custom Domain
1. Go to the "Settings" tab
2. Click "Domains"
3. Add your custom domain (e.g., `mindvap.com`)
4. Follow the instructions to configure DNS

### 5.2 Configure SSL
Vercel automatically provisions SSL certificates for custom domains.

## Step 6: Monitor and Maintain

### 6.1 Set Up Monitoring
1. Go to the "Monitoring" tab
2. Set up alerts for errors and performance issues

### 6.2 Configure CI/CD
1. Go to the "Git" tab
2. Configure automatic deployments for the `main` branch

## Troubleshooting

### Deployment Failed
1. Check the deployment logs for errors
2. Ensure all environment variables are correctly set
3. Verify that the build command is correct

### Application Not Working
1. Check the browser console for errors
2. Ensure the Supabase URL and key are correct
3. Verify that the database migrations are applied

### Performance Issues
1. Optimize images and assets
2. Enable Vercel's caching
3. Use a CDN for static assets

## Notes

- Vercel provides free hosting for personal projects
- The free tier includes automatic SSL, CDN, and CI/CD
- For production use, consider upgrading to a paid plan

## Contact

For further assistance, refer to the [Vercel documentation](https://vercel.com/docs) or contact Vercel support.