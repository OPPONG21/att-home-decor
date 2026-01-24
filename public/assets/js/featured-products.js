(function() {
  'use strict';

  // Supabase public storage URL
  const SUPABASE_PUBLIC_URL = 'https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/';

  // Initialize Supabase client (replace with your ANON key)
  const SUPABASE_URL = 'https://upmhieojblkvtgkxtocn.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_4lmKpyR0VTfgH5L4kkvLSQ_hi9XnpUM'; // <-- replace this
  
  if (!window.supabase) {
    console.error('Supabase library not loaded. Please check your internet connection.');
    return;
  }
  
  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  async function loadFeaturedProducts() {
    const container = document.getElementById('featured-products');
    const loadingEl = container.querySelector('.products-loading');

    try {
      if (loadingEl) loadingEl.textContent = 'Loading products...';

      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message || 'Failed to load products');

      if (!data || data.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--muted);">No products available at the moment.</p>';
        return;
      }

      if (loadingEl) loadingEl.remove();

      data.forEach(product => {
        const card = document.createElement('article');
        card.className = 'product-card';
        card.dataset.id = product.id;
        card.dataset.category = product.category || 'all';
        card.setAttribute('role', 'listitem');
        card.setAttribute('aria-label', `Product: ${product.name || 'Unnamed Product'}`);

        const imgSrc = product.image_url
          ? SUPABASE_PUBLIC_URL + encodeURIComponent(product.image_url)
          : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-family="Arial" font-size="20">No Image</text></svg>';

        const price = product.price ? Number(product.price).toLocaleString('en-GH') : '0';
        const badgeHTML = product.badge
          ? `<span class="badge badge-${product.badge.toLowerCase().replace(/\s+/g, '-')}">${product.badge}</span>`
          : '';

        card.innerHTML = `
          <a href="product.html?id=${product.id}" style="text-decoration: none; color: inherit; display: block;">
            ${badgeHTML}
            <span class="price-badge">GHS ${price}</span>
            <picture>
              <img src="${imgSrc}" alt="${product.name || 'Product'}" loading="lazy" decoding="async" width="400" height="300" fetchpriority="low">
            </picture>
            <div class="product-card-content">
              <h3>${product.name || 'Unnamed Product'}</h3>
              <a href="product.html?id=${product.id}" class="btn" style="background: linear-gradient(135deg, #25D366, #128C7E);">
                View Details
              </a>
            </div>
          </a>
        `;

        container.appendChild(card);
      });

    } catch (err) {
      console.error('Error loading featured products:', err);
      if (loadingEl) loadingEl.remove();
      container.innerHTML = `<div class="error-message" role="alert" style="text-align: center; padding: 2rem; color: var(--error-color, #ef4444);">
        <p>Unable to load products. Please try again later.</p>
        <button onclick="location.reload()" class="btn" style="margin-top: 1rem;">Reload Page</button>
      </div>`;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFeaturedProducts);
  } else {
    loadFeaturedProducts();
  }

})();
