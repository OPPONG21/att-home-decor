const { supabaseAdmin } = require('../supabase');

module.exports = async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = (authHeader.split(' ')[1]) || null;
    if (!token) return res.status(401).json({ error: 'Missing access token' });

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Admin client not configured' });
    }

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = userData.user;

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = user;
    req.profile = profile;
    next();
  } catch (err) {
    console.error('requireAdmin error:', err);
    res.status(500).json({ error: err.message || 'Internal error' });
  }
};
