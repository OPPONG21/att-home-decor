const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { supabase } = require('../supabase');

const dataDir = path.join(__dirname, '..', 'data');
const clicksFile = path.join(dataDir, 'clicks.json');

async function readClicks() {
  try {
    const txt = await fs.readFile(clicksFile, 'utf8');
    return JSON.parse(txt || '{}');
  } catch (err) {
    // If file missing, initialize
    try {
      await fs.mkdir(dataDir, { recursive: true });
      await fs.writeFile(clicksFile, '{}');
    } catch (e) {
      // ignore
    }
    return {};
  }
}

async function writeClicks(obj) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(clicksFile, JSON.stringify(obj, null, 2));
}

// POST /api/tracking - record a click
router.post('/', async (req, res) => {
  try {
    const { productId, name } = req.body || {};
    const key = productId || (name ? `name:${name}` : null);
    if (!key) return res.status(400).json({ error: 'Missing product identifier' });

    const clicks = await readClicks();
    clicks[key] = (clicks[key] || 0) + 1;
    await writeClicks(clicks);
    res.json({ product: key, clicks: clicks[key] });
  } catch (err) {
    console.error('Track click error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/tracking - return click counts combined with product metadata
router.get('/', async (req, res) => {
  try {
    const clicks = await readClicks();

    // Get products from Supabase (public client)
    let products = [];
    try {
      const { data, error } = await supabase.from('products').select('id, name');
      if (!error && Array.isArray(data)) products = data;
    } catch (e) {
      // ignore supabase errors; we'll still return counts by key
      console.warn('Unable to fetch products for tracking list:', e && e.message);
    }

    // Map products to clicks
    const result = [];
    const usedKeys = new Set();

    for (const p of products) {
      const id = p.id;
      const key = id;
      usedKeys.add(key);
      result.push({ id: id, name: p.name || '', clicks: clicks[key] || 0 });
    }

    // Include any click keys that are not product ids (e.g. name:...)
    for (const k of Object.keys(clicks)) {
      if (usedKeys.has(k)) continue;
      result.push({ id: k, name: k.startsWith('name:') ? k.slice(5) : '', clicks: clicks[k] || 0 });
    }

    res.json(result);
  } catch (err) {
    console.error('Get tracking error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
