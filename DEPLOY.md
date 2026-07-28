# FixIt AI — Deployment Guide

## Replace Your Repo

```bash
# 1. Go to your local fixitaibeta clone
cd fixitaibeta

# 2. Delete everything except .git
find . -maxdepth 1 -not -name '.git' -not -name '.' -exec rm -rf {} +

# 3. Extract the archive
tar -xzf ~/Downloads/fixitaibeta-clean.tar.gz

# 4. Install dependencies
npm install

# 5. Create .env.local
cp .env.example .env.local
# Edit .env.local with your actual Supabase values

# 6. Test locally
npm run dev
# Open http://localhost:3000

# 7. Commit and push
git add -A
git commit -m "rebuild: clean Phase 1 codebase with real OAuth and BYOK onboarding"
git push origin main
```

## Supabase Setup

### Database Migration
Run `supabase/migrations/001_initial.sql` in your Supabase SQL Editor:
https://supabase.com/dashboard/project/radejtldjxmqeevzlipc/sql/new

### Auth Configuration
1. Go to: https://supabase.com/dashboard/project/radejtldjxmqeevzlipc/auth/url-configuration
2. Set **Site URL** to your Vercel URL (e.g. `https://fixitaibeta.vercel.app`)
3. Add to **Redirect URLs**: `https://fixitaibeta.vercel.app/auth/callback`
4. Under **Auth Providers** → Google: confirm Client ID and Client Secret are set

### Google Cloud Console
1. Go to: https://console.cloud.google.com/apis/credentials
2. Your OAuth Client → **Authorized redirect URIs** must include:
   `https://radejtldjxmqeevzlipc.supabase.co/auth/v1/callback`
3. **Authorized JavaScript origins** must include your Vercel URL

## Vercel Environment Variables

In Vercel → Project Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://radejtldjxmqeevzlipc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = [your anon key]
SUPABASE_SERVICE_ROLE_KEY = [your service role key]
```

## Onboarding Images

Place 4 screenshots in `public/onboarding/`:
- `step-1-api-keys.png`
- `step-2-create-key.png`
- `step-3-create-project.png`
- `step-4-copy-key.png`

Take screenshots from https://aistudio.google.com/apikey walking through key creation.

## Verify

1. Open your Vercel URL
2. Click "Get started" → redirects to login
3. Click "Continue with Google" → Google consent screen appears
4. Sign in → redirected to /onboarding
5. Select "Homeowner" → name robot → robot greeting → carousel → paste key → verify → "Noice work" → workspace
6. Upload a photo → receive structured diagnosis
