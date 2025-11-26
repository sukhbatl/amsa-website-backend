# Deploying amsa-website-backend to Vercel

## ✅ Vercel Configuration Complete

This backend is now configured for Vercel's serverless environment.

### Files Added/Modified

1. **`vercel.json`** - Vercel configuration for serverless deployment
2. **`server.js`** - Modified to export app for Vercel while maintaining local dev support

---

## 🚀 Deployment Steps

### 1. Push to GitHub (Already Done)
```bash
git add .
git commit -m "Configure for Vercel serverless deployment"
git push origin master
```

### 2. Deploy to Vercel

#### Option A: Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click **"New Project"**
3. Import: `https://github.com/sukhbatl/amsa-website-backend`
4. Configure:
   - **Framework Preset**: Other
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`

5. **Add Environment Variables** (Critical!):
   ```
   DATABASE_URL=postgresql://postgres.eaylfdrxudujbzcchhcp:Bfyxf334zHE%26kYH3@aws-0-us-west-2.pooler.supabase.com:6543/postgres
   JWT_SECRET=your_strong_random_secret_32plus_characters
   NODE_ENV=production
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```

6. Click **"Deploy"**

#### Option B: Vercel CLI

```bash
cd c:\Users\sukhb\Desktop\amsa-website-backend
vercel
# Follow prompts and configure environment variables
```

---

## ⚠️ Important Considerations for Vercel Serverless

### 1. **Database Connection Pooling**
Vercel functions are stateless and short-lived. The current Sequelize configuration includes connection pooling which is optimized for serverless:

```javascript
pool: {
  max: 5,
  min: 0,
  acquire: 30000,
  idle: 10000
}
```

### 2. **Cold Starts**
- First request after idle time may be slower (2-5 seconds)
- Subsequent requests will be faster
- Supabase connection pooler helps mitigate this

### 3. **Function Timeout**
- Free tier: 10 seconds
- Pro tier: 60 seconds
- Most API requests should complete well within limits

### 4. **Rate Limiting**
Current rate limiting (5 requests per 15 min) works but is per-function-instance. For distributed rate limiting, consider:
- Redis-based rate limiting
- Vercel Edge Config
- Upstash Rate Limiting

### 5. **Logs**
- View logs in Vercel Dashboard → Your Project → Logs
- Winston logs will appear in Vercel's log viewer
- Consider external logging service for production (Logtail, Datadog, etc.)

---

## 🔄 Vercel vs Railway/Render Comparison

| Feature | Vercel | Railway/Render |
|---------|--------|----------------|
| **Architecture** | Serverless Functions | Traditional Server |
| **Cold Starts** | Yes (~2-5s) | No |
| **Connection Pooling** | Required | Optional |
| **WebSockets** | Limited | Full Support |
| **Cost** | Free tier generous | Free tier limited |
| **Deployment** | Instant | ~2-5 min |
| **Best For** | API routes, JAMstack | Long-running processes |

---

## ✅ Why Vercel Works for This Backend

1. ✅ **Stateless API** - All routes are stateless
2. ✅ **PostgreSQL with Pooler** - Supabase pooler handles connections
3. ✅ **No WebSockets** - Pure REST API
4. ✅ **Fast Deployment** - Instant from GitHub
5. ✅ **Free Tier** - Generous limits for small projects

---

## 🌐 After Deployment

### 1. Get Your Backend URL
After deployment, Vercel will provide a URL like:
```
https://amsa-website-backend.vercel.app
```

### 2. Update Frontend Environment Variable

Go to your frontend project in Vercel:
1. Settings → Environment Variables
2. Update `VITE_API_URL`:
   ```
   VITE_API_URL=https://amsa-website-backend.vercel.app
   ```
3. Redeploy frontend

### 3. Update Backend CORS

In Vercel → Backend Project → Settings → Environment Variables:
```
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://another-domain.com
```

### 4. Test API Endpoints

```bash
# Health check
curl https://amsa-website-backend.vercel.app/api/health

# Should return: {"ok":true}
```

---

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure `DATABASE_URL` is correctly set in Vercel environment variables
- Check Supabase is active and accessible
- Verify password is URL-encoded (`&` → `%26`)

### CORS Errors
- Add frontend URL to `ALLOWED_ORIGINS`
- Ensure comma-separated if multiple origins
- Redeploy after changing environment variables

### Cold Start Timeout
- First request may be slow (normal)
- Consider implementing a keep-alive ping
- Upgrade to Vercel Pro if needed

### Rate Limiting Not Working
- Serverless functions are stateless
- Consider implementing Redis-based rate limiting for production
- Current in-memory rate limiting works per-instance

---

## 📝 Local Development vs Production

### Local Development (Port 4000)
```bash
npm run dev
# Server listens on http://localhost:4000
```

### Production (Vercel Serverless)
- No port, handled by Vercel
- Functions auto-scale
- Database connection initialized per request

---

## 🔒 Security Checklist

- [x] Environment variables stored in Vercel (not in code)
- [x] HTTPS enforced (automatic in Vercel)
- [x] CORS properly configured
- [x] JWT_SECRET is strong and unique
- [x] Database uses SSL connection
- [x] Rate limiting enabled on auth endpoints
- [x] Password hashing with bcrypt
- [x] Input sanitization with xss
- [ ] Consider adding API key authentication for admin routes
- [ ] Set up monitoring and alerting

---

## 📊 Monitoring

### Vercel Analytics
- Enable in Vercel Dashboard → Your Project → Analytics
- Track request counts, errors, performance

### Database Monitoring
- Monitor in Supabase Dashboard
- Check connection pool usage
- Watch for slow queries

---

## 🚀 Continuous Deployment

Vercel automatically deploys when you push to GitHub:
```bash
git add .
git commit -m "Update backend"
git push origin master
# Vercel automatically deploys
```

---

## 💡 Pro Tips

1. **Environment Variables**: Always use Vercel dashboard for secrets
2. **Preview Deployments**: Every PR gets a preview URL
3. **Rollbacks**: Easy to rollback to previous deployments
4. **Custom Domains**: Add custom domain in Vercel settings
5. **Edge Functions**: Consider upgrading to Edge Functions for even faster response times

---

**Deployment Guide Created**: November 26, 2025  
**Configured For**: Vercel Serverless Functions  
**Database**: Supabase PostgreSQL with Connection Pooling

