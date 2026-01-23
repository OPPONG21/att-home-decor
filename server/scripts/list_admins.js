require('dotenv').config();
const { supabaseAdmin } = require('../supabase');

async function main() {
  if (!supabaseAdmin) {
    console.error('supabaseAdmin not configured. Ensure SUPABASE_SERVICE_ROLE is set.');
    process.exit(1);
  }

  try {
    const { data, error } = await supabaseAdmin.from('profiles').select('id, email, role').eq('role', 'admin');
    if (error) {
      console.error('Query error:', error);
      process.exit(1);
    }

    console.log(JSON.stringify(data || [], null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

main();
