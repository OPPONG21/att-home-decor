// public/assets/js/supabase.js
(function () {
  const SUPABASE_URL = 'https://upmhieojblkvtgkxtocn.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_4lmKpyR0VTfgH5L4kkvLSQ_hi9XnpUM';

  function createClientIfReady() {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return true;
      } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
      }
    }
    return false;
  }

  // If already available, initialize immediately
  if (createClientIfReady()) return;

  // Try to dynamically load the official UMD bundle if the library is missing
  const CDN_URLS = [
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js',
    'https://unpkg.com/@supabase/supabase-js/dist/umd/supabase.min.js'
  ];

  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = url;
      s.async = false; // preserve execution order for defer-like behavior
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load ' + url));
      document.head.appendChild(s);
    });
  }

  (async function tryLoad() {
    for (const url of CDN_URLS) {
      try {
        await loadScript(url);
        if (createClientIfReady()) {
          console.info('Supabase client loaded from', url);
          return;
        }
      } catch (e) {
        console.warn(e.message || e);
      }
    }

    // Final fallback: log helpful message but do not throw
    console.error('Supabase library not loaded after attempting CDNs. Supabase-dependent features will be disabled.');
  })();
})();
