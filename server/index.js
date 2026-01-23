// Simple Express server to serve the static site and provide a small API endpoint

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const productsRouter = require('./routes/products');
const profilesRouter = require('./routes/profiles');
const trackingRouter = require('./routes/tracking');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from public/
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// API routes
app.use('/api/products', productsRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/tracking', trackingRouter);

// Public config endpoint for client-side apps to fetch required public keys
// This returns only non-sensitive public config (anon key and URL). Do NOT expose service_role keys here.
app.get('/config', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL || 'https://upmhieojblkvtgkxtocn.supabase.co',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ''
  });
});

// Note: Admin routes have been removed. If needed in the future, re-create admin routes
// and ensure they are properly protected with authentication and authorization checks.

// Fallback to index for SPA-style navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));