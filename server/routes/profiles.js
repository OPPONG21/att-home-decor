const express = require('express');
const router = express.Router();
const { supabaseAdmin, upsertProfile } = require('../supabase');

// POST /api/profiles/bootstrap
// Body: none. Requires Authorization: Bearer <access_token>
// This endpoint is intended to bootstrap an admin profile for a user whose
// email is included in the ADMIN_EMAILS environment variable (comma-separated).
router.post('/bootstrap', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = (authHeader.split(' ')[1]) || null;
    if (!token) return res.status(401).json({ error: 'Missing access token' });

    // Validate token and get user info using the service client
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData || !userData.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = userData.user;
    const allowed = (process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!allowed.length || !user.email || !allowed.includes(user.email)) {
      return res.status(403).json({ error: 'Not permitted to bootstrap admin profile' });
    }

    // Upsert profile with admin role using service role client
    try {
      const profile = await upsertProfile(user.id, user.email, 'admin');
      return res.json(profile);
    } catch (upsertErr) {
      console.error('Failed to upsert profile:', upsertErr);
      return res.status(500).json({ error: 'Failed to create profile' });
    }
  } catch (err) {
    console.error('Bootstrap error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
});

module.exports = router;
