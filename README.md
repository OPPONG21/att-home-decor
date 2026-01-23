# att-home-decor

This repository contains the static site and a minimal Express server for Classic Dreamspread.

Structure
```
att-home-decor/
  assets/
    css/style.css
    js/navbar.js
    favicon/favicon.ico
    images/
  public/
    index.html
    products.html
    about.html
    contact.html
  server/
    index.js
    routes/products.js
    supabase.js
  package.json
  .gitignore
```

Quick start

1. Install dependencies

   npm install

2. Create a `.env` file (copy from `.env.example`) and set required keys:

   - `SUPABASE_URL` — your Supabase project URL
   - `SUPABASE_ANON_KEY` — publishable anon key (used by client-side code)
   - `SUPABASE_SERVICE_ROLE` — service role key (server-only; optional; used for admin operations)

   Use `.env` for local development and **never** commit it. See `SECURITY.md` for more guidance.

3. Start server

   npm start

Admin UI

- **Admin UI removed**: admin functionality has been permanently removed from this branch. If you want to restore admin capabilities later, re-add the admin pages under `public/admin/` and server routes under `server/routes/` and ensure endpoints are protected (server-side admin checks and RLS policies).
- Note: The server can use `SUPABASE_SERVICE_ROLE` for server-only elevated operations, but this key must be stored securely and never committed to source control.

The server serves static files from `public/` and exposes `GET /api/products` which proxies queries to Supabase's `products` table.

Admin UI and dev admin endpoints have been permanently deleted.

- The admin page files under `public/admin/` and associated server routes have been removed. If you want to restore them, re-create the pages and routes and ensure admin routes are only mounted in non-production or are properly protected.
- There is no local dev admin endpoint in this branch; if desired, I can scaffold a dev-only endpoint with safe checks for local testing.


