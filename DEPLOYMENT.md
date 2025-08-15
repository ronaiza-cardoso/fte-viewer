# 🚀 FTE Viewer - Vercel Deployment Guide

## 📋 Prerequisites

- [Vercel Account](https://vercel.com/signup)
- [Git](https://git-scm.com/) installed
- [Node.js](https://nodejs.org/) 18+ installed

## 🛠️ Local Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Build the application:**

   ```bash
   npm run build
   ```

3. **Test the build locally:**
   ```bash
   npx serve -s build
   ```

## 🌐 Deploy to Vercel

### Option 1: Vercel CLI (Recommended)

1. **Install Vercel CLI:**

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**

   ```bash
   vercel login
   ```

3. **Deploy:**

   ```bash
   vercel
   ```

4. **Follow the prompts:**

   - Set up and deploy? `Y`
   - Which scope? `[Your Account]`
   - Link to existing project? `N`
   - Project name: `fte-viewer`
   - Directory: `./` (current directory)
   - Override settings? `N`

5. **For production deployment:**
   ```bash
   vercel --prod
   ```

### Option 2: GitHub Integration

1. **Push your code to GitHub**
2. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
3. **Click "New Project"**
4. **Import your GitHub repository**
5. **Configure build settings:**
   - Framework Preset: `Create React App`
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Production environment variables
REACT_APP_ENV=production
REACT_APP_VERSION=1.0.0

# Build optimization
GENERATE_SOURCEMAP=false
REACT_APP_GENERATE_SOURCEMAP=false
```

### Build Optimization

The `vercel.json` file is already configured with:

- Static file serving
- Route handling for SPA
- Cache headers for performance
- Proper handling of JSON data files

## 📁 File Structure

```
fte-viewer/
├── public/
│   ├── all_fte_data.json      # FTE data file
│   ├── index.html             # Main HTML file
│   └── ...                    # Other static assets
├── src/
│   ├── App.js                 # Main React component
│   ├── App.css                # Styles
│   └── index.js               # Entry point
├── vercel.json                # Vercel configuration
├── package.json               # Dependencies and scripts
└── README.md                  # Project documentation
```

## 🔧 Build Commands

```bash
# Development
npm start

# Production build
npm run build

# Test build locally
npx serve -s build

# Deploy to Vercel
vercel --prod
```

## 🌍 Custom Domain (Optional)

1. **Go to Vercel Dashboard → Your Project → Settings → Domains**
2. **Add your custom domain**
3. **Configure DNS records as instructed by Vercel**

## 📊 Performance Optimization

The app is already optimized with:

- Material-UI for efficient component rendering
- Lazy loading of components
- Optimized bundle splitting
- Cache headers for static assets
- Responsive design for all devices

## 🚨 Troubleshooting

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Deployment Issues

```bash
# Check Vercel logs
vercel logs

# Redeploy
vercel --prod
```

### Data Loading Issues

- Ensure `all_fte_data.json` is in the `public/` directory
- Check file permissions and size limits
- Verify JSON format is valid

## 📱 Features After Deployment

✅ **Responsive Design** - Works on all devices  
✅ **Search & Filter** - Find FTEs quickly  
✅ **Source Navigation** - Direct links to government pages  
✅ **Raw Content Display** - View original HTML content  
✅ **Referências Normativas** - Numbered regulatory references  
✅ **Statistics Dashboard** - Data analytics and insights  
✅ **Export Functionality** - CSV export of statistics  
✅ **Modern UI/UX** - Material-UI components

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)
- [Material-UI Documentation](https://mui.com/)

## 📞 Support

For deployment issues:

1. Check Vercel logs
2. Verify build output locally
3. Check environment variables
4. Ensure all dependencies are installed

---

**Happy Deploying! 🎉**
