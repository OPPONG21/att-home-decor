// Simple Express server to serve the static site and provide a small API endpoint

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const productsRouter = require('./routes/products');
const profilesRouter = require('./routes/profiles');
const trackingRouter = require('./routes/tracking');
const adminRouter = require('./routes/admin');

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
app.use('/api/admin', adminRouter);

// Public config endpoint for client-side apps to fetch required public keys
// This returns only non-sensitive public config (anon key and URL). Do NOT expose service_role keys here.
app.get('/config', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL || 'https://upmhieojblkvtgkxtocn.supabase.co',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ''
  });
});

// --- Health check endpoint for Render ---
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});
// --- End /healthz ---

// Fallback to index.html for SPA-style navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
