const express = require('express');
const router = express.Router();
const requireAdmin = require('../middleware/requireAdmin');
const { supabaseAdmin } = require('../supabase');

// GET /api/admin/stats - Admin dashboard statistics
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('category, is_published');

    if (error) return res.status(500).json({ error: error.message });

    const stats = {
      total: data.length,
      categories: {},
      published: data.filter(p => p.is_published).length
    };

    data.forEach(p => {
      const cat = p.category || 'other';
      stats.categories[cat] = (stats.categories[cat] || 0) + 1;
    });

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;