// Server-side Supabase clients (safe setup)
// Reads credentials from environment variables. Provide env vars in a .env file for local dev.
// Use SUPABASE_ANON_KEY for public client and SUPABASE_SERVICE_ROLE for server-only admin tasks.

require('dotenv').config(); // loads .env in local development (no-op if not present)

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
// Accept either SUPABASE_SERVICE_ROLE or SERVICE_KEY (some docs refer to SERVICE_KEY)
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || process.env.SERVICE_KEY || process.env.SERVICE_KEY;

if (!SUPABASE_URL) {
  console.warn('Warning: SUPABASE_URL is not set. Set it in your environment or .env file.');
}

if (!SUPABASE_ANON_KEY) {
  console.warn('Warning: SUPABASE_ANON_KEY is not set. Client-side operations may fail.');
}

if (!SUPABASE_SERVICE_ROLE) {
  console.warn('Warning: SUPABASE_SERVICE_ROLE (or SERVICE_KEY) not set. Admin server operations will be disabled.');
}

// Public client (respects RLS and is safe to use for most operations)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin client for elevated server operations (bypasses RLS). Only create if service role is provided.
const supabaseAdmin = SUPABASE_SERVICE_ROLE ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE) : null;

if (supabaseAdmin) {
  console.log('Supabase admin client configured. Server admin operations enabled.');
} else {
  console.log('Supabase admin client NOT configured. Server admin operations disabled.');
}

/**
 * Upsert a profile row (server-side only). Uses the service role client which bypasses RLS.
 * @param {string} id - UUID of the auth user
 * @param {string} email - user's email
 * @param {string} role - role to set (default: 'admin')
 * @returns {Promise<object>} - the upserted profile row
 */
async function upsertProfile(id, email, role = 'admin') {
  if (!supabaseAdmin) {
    throw new Error('SUPABASE_SERVICE_ROLE not configured. Cannot perform admin upsert.');
  }

  const payload = {
    id,
    email,
    role,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert(payload, { returning: 'representation' });

  if (error) {
    const err = new Error(`Failed to upsert profile: ${error.message || error}`);
    err.cause = error;
    throw err;
  }

  // upsert returns an array of rows when successful
  return Array.isArray(data) ? data[0] : data;
}

module.exports = { supabase, supabaseAdmin, upsertProfile };