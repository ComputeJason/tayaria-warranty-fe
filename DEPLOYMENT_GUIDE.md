# Deployment Guide - Environment Configuration

## ✅ **Setup Complete!**

Your frontend is now configured to automatically switch between development and production API endpoints.

## 🚀 **How It Works**

### **Local Development**
```bash
npm run dev
# Uses: http://localhost:8080/api
```

### **Production (Vercel)**
```bash
npm run build
# Uses: https://tayaria-warranty-be.onrender.com/api
```

## 📁 **Files Created/Modified**

### **Environment Files**
- `.env.local` - Development environment (localhost:8080/api)
- `.env.production` - Production environment (Render URL/api)

### **Configuration Files**
- `src/config/api.ts` - Centralized API configuration
- `src/services/warrantyApi.ts` - Updated to use environment variables
- `src/utils/envTest.ts` - Environment testing utility

### **Documentation**
- `ENVIRONMENT_SETUP.md` - Detailed environment setup guide
- `API_INTEGRATION.md` - API integration documentation

## 🔧 **Environment Variables**

| Environment | API Base URL |
|-------------|--------------|
| Development | `http://localhost:8080/api` |
| Production | `https://tayaria-warranty-be.onrender.com/api` |

## 🧪 **Testing**

### **Local Development**
1. Start your backend on `localhost:8080`
2. Run `npm run dev`
3. Check browser console for environment logs
4. Test warranty registration and status checking

### **Production Testing**
1. Deploy to Vercel
2. Vercel automatically uses `.env.production`
3. Test with your Render backend

## 🚀 **Deployment Steps**

### **Vercel Deployment**
1. Push your code to GitHub
2. Connect repository to Vercel
3. Vercel automatically detects environment
4. Deploy - no additional configuration needed!

### **Manual Deployment**
If deploying elsewhere, set environment variable:
```bash
VITE_API_BASE_URL=https://tayaria-warranty-be.onrender.com/api
```

## 🔍 **Debugging**

### **Development Console Logs**
```
🔧 API Configuration: {
  BASE_URL: "http://localhost:8080/api",
  ENV: "development",
  DEV: true
}

🌍 Environment Test: {
  mode: "development",
  isDev: true,
  apiBaseUrl: "http://localhost:8080/api"
}
```

### **Production Console Logs**
```
🔧 API Configuration: {
  BASE_URL: "https://tayaria-warranty-be.onrender.com/api",
  ENV: "production",
  DEV: false
}
```

## ✅ **Verification Checklist**

- [x] Environment files created (`.env.local`, `.env.production`)
- [x] API service updated to use environment variables
- [x] Configuration centralized in `src/config/api.ts`
- [x] Debug logging added for development
- [x] TypeScript compilation successful
- [x] Environment switching logic tested
- [x] Documentation created

## 🎯 **Next Steps**

1. **Test Locally**: Run `npm run dev` and test with your local backend
2. **Deploy to Vercel**: Push to GitHub and deploy
3. **Verify Production**: Test the deployed app with your Render backend
4. **Monitor Logs**: Check browser console for environment confirmation

## 🆘 **Troubleshooting**

### **Build Issues**
- Node.js version: Consider upgrading to Node 16+ for better compatibility
- Clear cache: `rm -rf node_modules && npm install`

### **Environment Issues**
- Check `.env.local` exists for development
- Verify `.env.production` has correct Render URL
- Ensure environment variables are prefixed with `VITE_`

### **API Issues**
- Verify backend is running on correct URL
- Check CORS settings on backend
- Test API endpoints directly with curl/Postman

---

**🎉 Your environment configuration is ready for deployment!** 