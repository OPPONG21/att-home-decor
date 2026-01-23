# Security Notes

This document contains short guidance for keeping secrets safe in this project.

- Do **not** commit `.env` to version control. Add actual secret values to `.env` (already present in `.gitignore`).
- Use `SUPABASE_ANON_KEY` in client/browser code for public interactions (read-only or authenticated with RLS).
- Use `SUPABASE_SERVICE_ROLE` only on the server for elevated tasks (bypasses RLS). Never send it to the client.
- Enable Row Level Security (RLS) on your Supabase tables and add minimum-privilege policies for client access.
- Rotate service-role keys if they are ever exposed and update the values in your deployment secret manager.

Recommended checklist:
- [ ] Add `SUPABASE_SERVICE_ROLE` to your deployment platform's secret store (Vercel/Render/Heroku, etc.).
- [ ] Verify no service-role or other secrets exist in client files.
- [ ] Review RLS policies for `products` and other tables before using admin client.
