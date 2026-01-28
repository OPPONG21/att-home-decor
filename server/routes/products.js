const express = require('express');
const router = express.Router();
const requireAdmin = require('../middleware/requireAdmin');
const { supabase, supabaseAdmin } = require('../supabase');

// Normalize and validate category values before DB insert/update
const ALLOWED_CATEGORIES = ['bedspread', 'curtain', 'pillows', 'blankets'];
function normalizeCategory(input) {
  if (!input) return '';
  const v = String(input).trim().toLowerCase();
  const map = {
    'pillow': 'pillows',
    'pillows': 'pillows',
    'blanket': 'blankets',
    'blankets': 'blankets',
    'bedspreads': 'bedspread',
    'bedspread': 'bedspread',
    'curtain': 'curtain',
    'curtains': 'curtain'
  };
  return map[v] || v;
}

// GET /api/products (PUBLIC)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/products (ADMIN ONLY)
router.post('/', requireAdmin, async (req, res) => {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Admin client not configured' });
  }

  const { name, category, price, image_url, whatsapp_url, subcategory, notes } = req.body;

  if (!name || !category) {
    return res.status(400).json({ error: 'Name and category required' });
  }

  // Normalize category and subcategory
  const normCategory = normalizeCategory(category);
  if (!ALLOWED_CATEGORIES.includes(normCategory)) {
    return res.status(400).json({ error: `Invalid category '${category}'. Allowed: ${ALLOWED_CATEGORIES.join(', ')}` });
  }

  const payload = {
    name: name.trim(),
    category: normCategory,
    subcategory: subcategory ? String(subcategory).trim().toLowerCase() : null,
    price: price || null,
    image_url: image_url || null,
    whatsapp_url: whatsapp_url || '',
    notes: notes ? String(notes).trim() : null,
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(payload)
      .select()
      .single();

    if (error) {
      // Detect common CHECK constraint failure and return a helpful message
      const msg = error.message || '';
      if (msg.toLowerCase().includes('violates check constraint')) {
        return res.status(400).json({ error: 'Database constraint prevented insert. Ensure the category is allowed on the database (run ALTER TABLE to update products_category_check).' });
      }
      return res.status(500).json({ error: msg });
    }

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/products/:id (ADMIN ONLY)
router.delete('/:id', requireAdmin, async (req, res) => {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Admin client not configured' });
  }

  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Product ID required' });

  const { data, error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json({ deleted: data });
});

// PUT /api/admin/products/:id (ADMIN ONLY) - update product (partial)
router.put('/:id', requireAdmin, async (req, res) => {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Admin client not configured' });
  }

  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Product ID required' });

  // Whitelist of allowed update fields
  const allowed = ['name','category','subcategory','price','image_url','whatsapp_url','stock_status','visible','description','notes','badge','is_published'];
  const payload = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      payload[key] = req.body[key];
    }
  }

  // Normalize category if provided
  if (payload.category !== undefined) {
    const norm = normalizeCategory(payload.category);
    if (!ALLOWED_CATEGORIES.includes(norm)) {
      return res.status(400).json({ error: `Invalid category '${payload.category}'. Allowed: ${ALLOWED_CATEGORIES.join(', ')}` });
    }
    payload.category = norm;
  }

  // Normalize subcategory
  if (payload.subcategory !== undefined) {
    payload.subcategory = payload.subcategory ? String(payload.subcategory).trim().toLowerCase() : null;
  }

  if (Object.keys(payload).length === 0) {
    return res.status(400).json({ error: 'No valid fields provided for update' });
  }

  try {
    const attemptUpdate = async (p) => {
      return await supabaseAdmin
        .from('products')
        .update(p)
        .eq('id', id)
        .select()
        .single();
    };

    let { data, error } = await attemptUpdate(payload);

    if (error) {
      // Try to detect unknown/missing column names from the error message
      const msg = String(error.message || error.details || '');
      const removed = [];

      // Find quoted identifiers like "column \"stock_status\"" or 'stock_status'
      const rx = /["'`]([a-zA-Z0-9_]+)["'`]/g;
      let m;
      const suspects = new Set();
      while ((m = rx.exec(msg))) {
        suspects.add(m[1]);
      }

      // Additionally check for simple mention of field names (fallback)
      ['stock_status','visible'].forEach(k => { if (msg.includes(k)) suspects.add(k); });

      // Remove any suspect columns from payload and retry
      for (const col of suspects) {
        if (Object.prototype.hasOwnProperty.call(payload, col)) {
          removed.push(col);
          delete payload[col];
        }
      }

      if (removed.length > 0 && Object.keys(payload).length > 0) {
        console.warn('Retrying update after removing unknown columns:', removed);
        const retry = await attemptUpdate(payload);
        data = retry.data; error = retry.error;
        if (error) {
          console.error('Update retry failed after removing columns:', error);
          return res.status(500).json({ error: error.message });
        }
        // success on retry
        return res.json({ ...data, note: `Some fields were ignored because they do not exist: ${removed.join(', ')}` });
      }

      // Nothing to retry or retry not possible
      return res.status(500).json({ error: error.message });
    }

    // Success first try
    res.json(data);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

module.exports = router;
