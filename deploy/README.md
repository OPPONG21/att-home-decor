# Deployment Guide

This document shows quick, reproducible steps to deploy the frontend (static `public/`) and backend (`server/`) for production.

Providers chosen in this guide:
- Frontend: Vercel (static)
- Backend: Render (or any container/PaaS that runs Node)

Security note
- Never store `SUPABASE_SERVICE_ROLE` in client code. Add it only to your backend host's secret store.
- Use `SUPABASE_ANON_KEY` in client apps and `SUPABASE_SERVICE_ROLE` on server only.

1) Frontend — Vercel

- Option A: Deploy from the Vercel dashboard
  1. Push your repo to GitHub/GitLab/Bitbucket.
  2. Go to https://vercel.com/new and import the repo.
  3. For Framework Preset choose "Other". Set the Output Directory to `public`.
  4. No build command is required for static sites. Confirm and deploy.
  5. Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` to Environment Variables if you use them in Serverless functions (not required for purely static sites).

- Option B: Deploy with the Vercel CLI (quick test)
```
npm i -g vercel
vercel --prod --confirm
```

2) Backend — Render (recommended)

Using the Render dashboard (recommended):
1. Push the repo to GitHub/GitLab.
2. Create a new Web Service in Render and connect your repo.
3. Set the Root to the repo root, and the Start Command to:
```
node server/index.js
```
4. Configure Environment: add the following secrets in Render's dashboard:
  - `SUPABASE_URL` = https://your-project.supabase.co
  - `SUPABASE_SERVICE_ROLE` = <your service role key>
  - `SUPABASE_ANON_KEY` = <your anon key> (optional for server-side use)
5. Deploy. Render will install dependencies and run the start command.

Using the Dockerfile (any host that accepts containers):
```
docker build -t att-home-decor .
docker run -e SUPABASE_URL=... -e SUPABASE_SERVICE_ROLE=... -e SUPABASE_ANON_KEY=... -p 3000:3000 att-home-decor
```

3) Heroku (alternative)

1. Install the Heroku CLI and log in.
2. Create an app and push:
```
heroku create
git push heroku main
heroku config:set SUPABASE_URL=... SUPABASE_SERVICE_ROLE=... SUPABASE_ANON_KEY=...
```

4) Post-deploy checks
- Visit the frontend URL and ensure the site loads.
- Check `GET /config` to confirm the frontend can obtain `SUPABASE_URL` and `SUPABASE_ANON_KEY` if needed.
- Test API endpoints:
  - `GET /api/products` should return products (may be empty).
  - Protected admin endpoints (`POST/DELETE /api/products`) require `SUPABASE_SERVICE_ROLE` and should be invoked from a server or with proper authorization.

5) Supabase storage (enforce RLS)
- If you want RLS policies to control who can download files, set the bucket `product-images` to Private in the Supabase dashboard and ensure the server uses the service role to create signed URLs. See `server/routes/products.js` for how signed URLs are built.

6) DNS and HTTPS
- Vercel and Render provide automatic HTTPS for their assigned domains. To use a custom domain, add the domain in the provider UI and follow the DNS validation steps.

If you want, I can now:
- Create a `.github/workflows` CI file to deploy automatically, or
- Deploy to Vercel and Render for you if you provide repository access and env var values.
