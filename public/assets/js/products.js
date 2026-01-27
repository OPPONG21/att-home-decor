(function() {
  'use strict';
  
  // Supabase client
  const SUPABASE_URL = 'https://upmhieojblkvtgkxtocn.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_4lmKpyR0VTfgH5L4kkvLSQ_hi9XnpUM';
  
  if (!window.supabase) {
    console.error('Supabase library not loaded. Please check your internet connection.');
    return;
  }
  
  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // State management
  let allProducts = [];
  let currentCategory = 'all';
  let searchQuery = '';
  let priceMin = null;
  let priceMax = null;
  let selectedSizes = [];
  let selectedColors = [];
  let selectedFabrics = [];
  let selectedSubcategories = []; // e.g. curtain types
  let currentView = 'grid'; // 'grid' or 'list'

  // Get URL filter parameter
  const urlParams = new URLSearchParams(window.location.search);
  function normalizeCategoryName(s) {
    if (!s) return 'all';
    const t = String(s).trim().toLowerCase();
    if (t === 'bedspreads' || t === 'bedspread') return 'bedspread';
    if (t === 'curtains' || t === 'curtain') return 'curtain';
    return t;
  }
  currentCategory = normalizeCategoryName(urlParams.get('filter')) || 'all';

  // API configuration (kept for compatibility, but using Supabase)
  const API_BASE = (location.protocol === 'file:') ? 'http://localhost:3000' : '';
  const apiUrl = (path = '/api/products') => `${API_BASE}${path}`;

  /**
   * Extract filter values from product name/description
   * This is a temporary solution until database schema is updated
   */
  function extractProductAttributes(product) {
    const text = `${product.name || ''} ${product.description || ''}`.toLowerCase();
    return {
      sizes: ['single', 'double', 'queen', 'king'].filter(size => text.includes(size)),
      colors: ['white', 'beige', 'gray', 'grey', 'blue', 'red', 'green', 'purple', 'yellow'].filter(color => text.includes(color)),
      fabrics: ['cotton', 'polyester', 'linen', 'velvet', 'silk', 'sheer'].filter(fabric => text.includes(fabric))
    };
  }

  /**
   * Filter products based on all active filters
   */
  function filterProducts(products) {
    return products.filter(product => {
      // Category filter (normalize singular/plural)
      if (currentCategory !== 'all') {
        const prodCat = normalizeCategoryName(product.category || '');
        if (prodCat !== currentCategory) {
          return false;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const searchText = `${product.name || ''} ${product.description || ''}`.toLowerCase();
        if (!searchText.includes(query)) {
          return false;
        }
      }

      // Price filter
      const productPrice = Number(product.price) || 0;
      if (priceMin !== null && productPrice < priceMin) {
        return false;
      }
      if (priceMax !== null && productPrice > priceMax) {
        return false;
      }

      // Size filter
      if (selectedSizes.length > 0) {
        const attrs = extractProductAttributes(product);
        const hasMatchingSize = selectedSizes.some(size => attrs.sizes.includes(size));
        if (!hasMatchingSize) {
          return false;
        }
      }

      // Color filter
      if (selectedColors.length > 0) {
        const attrs = extractProductAttributes(product);
        // Handle grey/gray variant
        const normalizedColors = attrs.colors.map(c => c === 'grey' ? 'gray' : c);
        const normalizedSelected = selectedColors.map(c => c === 'grey' ? 'gray' : c);
        const hasMatchingColor = normalizedSelected.some(color => normalizedColors.includes(color));
        if (!hasMatchingColor) {
          return false;
        }
      }

      // Fabric filter
      if (selectedFabrics.length > 0) {
        const attrs = extractProductAttributes(product);
        const hasMatchingFabric = selectedFabrics.some(fabric => attrs.fabrics.includes(fabric));
        if (!hasMatchingFabric) {
          return false;
        }
      }

      // Subcategory (e.g. curtain type) filter
      if (selectedSubcategories.length > 0) {
        const prodSub = (product.subcategory || '').toLowerCase();
        const matchesSub = selectedSubcategories.some(s => s.toLowerCase() === prodSub);
        if (!matchesSub) return false;
      }

      return true;
    });
  }

  /**
   * Render a product card
   */
  function renderProductCard(product, index) {
    const card = document.createElement('article');
    card.className = 'product-card';
    if (product && product.id) card.dataset.id = product.id;
    card.setAttribute('data-category', product.category || 'all');
    card.setAttribute('role', 'listitem');
    card.setAttribute('aria-label', `Product: ${product.name || 'Unnamed Product'}`);

    const badgeHTML = product.badge 
      ? `<span class="badge badge-${product.badge.toLowerCase().replace(/\s+/g, '-')}">${product.badge}</span>` 
      : '';

    // Stock badge (if server provided)
    const rawStock = product.stock_status || product.stock || ''; 
    const stockKey = String(rawStock).trim().toLowerCase().replace(/[-\s]+/g, '_');
    let stockHTML = '';
    if (stockKey === 'out_of_stock' || stockKey === 'outofstock') {
      stockHTML = `<span class="stock-badge out-of-stock">Out of stock</span>`;
    } else if (stockKey === 'low_stock' || stockKey === 'lowstock') {
      stockHTML = `<span class="stock-badge low-stock">Low stock</span>`;
    } else if (stockKey) {
      stockHTML = `<span class="stock-badge in-stock">In stock</span>`;
    }
    
    const imgSrc = product.image_url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-family="Arial, sans-serif" font-size="20">No Image</text></svg>';
    const whatsappUrl = product.whatsapp_url || 'https://wa.me/233540460532';
    const price = product.price ? Number(product.price).toLocaleString('en-GH') : '0';
    const productName = product.name || 'Unnamed Product';
    const description = product.description || '';

    card.innerHTML = `
      <a href="product.html?id=${product.id}" style="text-decoration: none; color: inherit; display: block;">
        ${badgeHTML}
        <span class="price-badge">GHS ${price}</span>
        <picture>
          <img src="${imgSrc}" alt="${productName}" loading="${index < 4 ? 'eager' : 'lazy'}" decoding="async" width="400" height="300" fetchpriority="${index < 4 ? 'high' : 'low'}">
        </picture>
        <div class="product-card-content">
          <h3>${productName}</h3>
          ${description ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: var(--muted);">${description}</p>` : ''}
          ${stockHTML}
          <a href="product.html?id=${product.id}" class="btn" style="background: linear-gradient(135deg, #25D366, #128C7E); margin-top: auto;">
            View Details
          </a>
        </div>
      </a>
    `;

    return card;
  }

  /**
   * Update filter count display
   */
  function updateFilterCount() {
    const count = (priceMin !== null ? 1 : 0) + 
                 (priceMax !== null ? 1 : 0) + 
                 selectedSizes.length + 
                 selectedColors.length + 
                 selectedFabrics.length + 
                 selectedSubcategories.length;
    const countEl = document.getElementById('active-filter-count');
    if (countEl) {
      countEl.textContent = `${count} active`;
      countEl.setAttribute('data-count', count);
    }
  }

  /**
   * Update results count
   */
  function updateResultsCount(filteredProducts) {
    const resultsEl = document.getElementById('results-text');
    if (resultsEl) {
      const count = filteredProducts.length;
      resultsEl.textContent = `${count} product${count !== 1 ? 's' : ''} found`;
    }
  }

  /**
   * Apply view (grid/list)
   */
  function applyView(view) {
    currentView = view;
    const container = document.getElementById('products-grid');
    if (!container) return;

    container.classList.remove('products-grid', 'products-list');
    container.classList.add(`products-${view}`);

    const gridBtn = document.getElementById('view-grid');
    const listBtn = document.getElementById('view-list');
    if (gridBtn && listBtn) {
      gridBtn.classList.toggle('active', view === 'grid');
      listBtn.classList.toggle('active', view === 'list');
      gridBtn.setAttribute('aria-pressed', (view === 'grid').toString());
      listBtn.setAttribute('aria-pressed', (view === 'list').toString());
    }

    // Save to localStorage
    try {
      localStorage.setItem('productView', view);
    } catch (e) {}
  }

  /**
   * Load and display products
   */
  async function loadProducts() {
    const container = document.getElementById('products-grid');
    const errorEl = document.getElementById('products-error');
    
    if (!container) {
      console.error('Products container not found');
      return;
    }

    // Clear error messages
    if (errorEl) {
      errorEl.innerHTML = '';
      errorEl.setAttribute('aria-live', 'polite');
    }

    // Show loading state
    container.innerHTML = '<div class="products-loading" style="text-align: center; padding: 2rem; color: var(--muted);">Loading products...</div>';
    container.setAttribute('aria-busy', 'true');

    try {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message || 'Failed to load products');

      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected array');
      }

      // Store all products and render via existing filter flow
      allProducts = data;

      // Use the centralized applyFilters() to render results
      applyFilters();
      return;

    } catch (err) {
      console.error('Error loading products:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      container.innerHTML = `
        <div role="alert" style="text-align: center; padding: 2rem; color: var(--error-color, #ef4444);">
          <p class="lead">Failed to load products. Please try again later.</p>
          <p style="font-size: 0.9rem; margin-top: 0.5rem; color: var(--muted);">${errorMessage}</p>
          <button onclick="location.reload()" class="btn" style="margin-top: 1rem;" aria-label="Reload page">Reload Page</button>
        </div>
      `;
      container.setAttribute('aria-busy', 'false');

      // Show detailed error for debugging (development only)
      if (errorEl && location.hostname === 'localhost') {
        errorEl.innerHTML = `
          <details style="text-align: left; margin-top: 1rem; padding: 1rem; background: #fee; border: 1px solid #fcc; border-radius: 8px;">
            <summary style="cursor: pointer; font-weight: 600; color: #c00;">Debug Information</summary>
            <p style="margin-top: 0.5rem; font-size: 0.85rem;"><strong>Error:</strong> ${errorMessage}</p>
            <p style="font-size: 0.85rem;"><strong>URL:</strong> <code>${location.href}</code></p>
          </details>
        `;
      }
    }
  }

  /**
   * Apply all filters and refresh display
   */
  function applyFilters() {
    if (allProducts.length === 0) {
      loadProducts();
      return;
    }
    
    const container = document.getElementById('products-grid');
    if (!container) return;

    const filtered = filterProducts(allProducts);
    container.innerHTML = '';
    container.setAttribute('aria-busy', 'false');

    if (filtered.length === 0) {
      container.innerHTML = `
        <div role="status" style="text-align: center; padding: 3rem; color: var(--muted);">
          <p class="lead" style="margin-bottom: 1rem;">No products found matching your criteria.</p>
          <button class="btn" id="clear-all-btn" style="margin-top: 1rem; margin-right: 0.5rem;">
            Clear Filters
          </button>
          <a href="contact.html" class="btn" style="margin-top: 1rem;">
            Contact Us
          </a>
        </div>
      `;
      const clearAllBtn = document.getElementById('clear-all-btn');
      if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
          clearAllFilters();
          applyFilters();
        });
      }
      updateResultsCount([]);
      return;
    }

    // If viewing curtains, group by common curtain subcategories
    if (currentCategory === 'curtain') {
      const groups = ['two in one', 'three in one', 'door curtains', 'bathroom curtains'];
      // Render each requested group in order
      groups.forEach((groupName) => {
        const groupProducts = filtered.filter(p => (p.subcategory || '').toLowerCase() === groupName);
        if (groupProducts.length === 0) return;
        const heading = document.createElement('h3');
        heading.className = 'curtain-group-heading';
        heading.textContent = groupName.replace(/\b\w/g, c => c.toUpperCase());
        container.appendChild(heading);

        const groupDiv = document.createElement('div');
        // reuse products grid styles so grouped items look like the main grid
        groupDiv.className = 'products curtain-group';
        groupDiv.setAttribute('role', 'list');
        groupDiv.setAttribute('aria-label', `${groupName} curtains`);
        groupProducts.forEach((product, idx) => {
          const card = renderProductCard(product, idx);
          groupDiv.appendChild(card);
        });
        container.appendChild(groupDiv);
      });

      // Render any curtains without a matching subcategory under "Other Curtains"
      const uncategorized = filtered.filter(p => p.category === 'curtain' && !groups.includes((p.subcategory || '').toLowerCase()));
      if (uncategorized.length > 0) {
        const heading = document.createElement('h3');
        heading.className = 'curtain-group-heading';
        heading.textContent = 'Other Curtains';
        container.appendChild(heading);

        const groupDiv = document.createElement('div');
        groupDiv.className = 'products curtain-group';
        groupDiv.setAttribute('role', 'list');
        groupDiv.setAttribute('aria-label', 'Other curtains');
        uncategorized.forEach((product, idx) => groupDiv.appendChild(renderProductCard(product, idx)));
        container.appendChild(groupDiv);
      }
    } else {
      filtered.forEach((product, index) => {
        const card = renderProductCard(product, index);
        container.appendChild(card);
      });
    }

    updateResultsCount(filtered);
    updateFilterCount();
  }

  /**
   * Clear all filters
   */
  function clearAllFilters() {
    searchQuery = '';
    priceMin = null;
    priceMax = null;
    selectedSizes = [];
    selectedColors = [];
    selectedFabrics = [];

    // Reset UI elements
    const searchInput = document.getElementById('product-search');
    if (searchInput) searchInput.value = '';

    const priceMinInput = document.getElementById('price-min');
    const priceMaxInput = document.getElementById('price-max');
    if (priceMinInput) priceMinInput.value = '';
    if (priceMaxInput) priceMaxInput.value = '';

    document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
      checkbox.checked = false;
    });

    updateFilterCount();
  }

  /**
   * Update filter button states
   */
  function updateFilterButtons(activeCategory) {
    activeCategory = normalizeCategoryName(activeCategory);
    document.querySelectorAll('.filter-btn').forEach(btn => {
      const category = normalizeCategoryName(btn.dataset.category || 'all');
      const isActive = category === activeCategory;
      
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive.toString());
      
      // Update URL without reload
      const url = new URL(window.location);
      if (category === 'all') {
        url.searchParams.delete('filter');
      } else {
        url.searchParams.set('filter', category);
      }
      window.history.replaceState({}, '', url);
    });
  }

  /**
   * Initialize event listeners
   */
  function initEventListeners() {
    // Category filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        currentCategory = normalizeCategoryName(btn.dataset.category || 'all');
        updateFilterButtons(currentCategory);
        applyFilters();
        document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    // Search input
    const searchInput = document.getElementById('product-search');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchQuery = e.target.value.trim();
        searchTimeout = setTimeout(() => {
          applyFilters();
        }, 300);
      });
    }

    // Price filters
    const priceMinInput = document.getElementById('price-min');
    const priceMaxInput = document.getElementById('price-max');
    if (priceMinInput) {
      priceMinInput.addEventListener('change', (e) => {
        priceMin = e.target.value ? Number(e.target.value) : null;
        applyFilters();
      });
    }
    if (priceMaxInput) {
      priceMaxInput.addEventListener('change', (e) => {
        priceMax = e.target.value ? Number(e.target.value) : null;
        applyFilters();
      });
    }

    // Checkbox filters
    document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const filterType = checkbox.dataset.filter;
        const value = checkbox.value;

        if (filterType === 'size') {
          if (checkbox.checked) {
            selectedSizes.push(value);
          } else {
            selectedSizes = selectedSizes.filter(s => s !== value);
          }
        } else if (filterType === 'color') {
          if (checkbox.checked) {
            selectedColors.push(value);
          } else {
            selectedColors = selectedColors.filter(c => c !== value);
          }
        } else if (filterType === 'fabric') {
          if (checkbox.checked) {
            selectedFabrics.push(value);
          } else {
            selectedFabrics = selectedFabrics.filter(f => f !== value);
          }
        } else if (filterType === 'subcategory') {
          if (checkbox.checked) {
            selectedSubcategories.push(value);
          } else {
            selectedSubcategories = selectedSubcategories.filter(s => s !== value);
          }
        }

        applyFilters();
      });
    });

    // Clear filters button
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        clearAllFilters();
        applyFilters();
      });
    }

    // View toggle buttons
    const gridBtn = document.getElementById('view-grid');
    const listBtn = document.getElementById('view-list');
    if (gridBtn) {
      gridBtn.addEventListener('click', () => applyView('grid'));
    }
    if (listBtn) {
      listBtn.addEventListener('click', () => applyView('list'));
    }

    // Reload button
    const reloadBtn = document.getElementById('reload-products');
    if (reloadBtn) {
      reloadBtn.addEventListener('click', () => {
        const reloadContainer = document.getElementById('reload-container');
        if (reloadContainer) {
          reloadContainer.style.display = 'none';
        }
        loadProducts();
      });
    }
  }

  /**
   * Initialize page
   */
  function init() {
    // Load saved view preference
    try {
      const savedView = localStorage.getItem('productView');
      if (savedView === 'grid' || savedView === 'list') {
        applyView(savedView);
      }
    } catch (e) {}

    initEventListeners();
    updateFilterButtons(currentCategory);
    loadProducts();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();