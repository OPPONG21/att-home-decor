(function() {
  'use strict';

  // Get product ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    showError();
    return;
  }

  // API configuration
  const API_BASE = (location.protocol === 'file:') ? 'http://localhost:3000' : '';
  const apiUrl = (path) => `${API_BASE}${path}`;

  // State
  let currentProduct = null;
  let selectedSize = '';
  let selectedColor = '';
  let quantity = 1;
  let currentImageIndex = 0;
  let images = [];

  // DOM elements
  const loadingEl = document.getElementById('product-loading');
  const errorEl = document.getElementById('product-error');
  const contentEl = document.getElementById('product-content');
  const mainImageEl = document.getElementById('main-product-image');
  const thumbnailsEl = document.getElementById('product-thumbnails');
  const zoomBtn = document.getElementById('zoom-btn');
  const mainImageContainer = document.querySelector('.product-main-image');

  /**
   * Extract product attributes from name/description
   */
  function extractProductAttributes(product) {
    const text = `${product.name || ''} ${product.description || ''}`.toLowerCase();
    
    // Extract sizes
    const sizes = [];
    if (text.includes('single')) sizes.push('single');
    if (text.includes('double')) sizes.push('double');
    if (text.includes('queen')) sizes.push('queen');
    if (text.includes('king')) sizes.push('king');

    // Extract colors
    const colors = [];
    const colorKeywords = ['white', 'beige', 'gray', 'grey', 'blue', 'red', 'green', 'purple', 'yellow', 'pink', 'black', 'brown'];
    colorKeywords.forEach(color => {
      if (text.includes(color)) {
        colors.push(color === 'grey' ? 'gray' : color);
      }
    });

    // Extract fabric types
    const fabrics = [];
    const fabricKeywords = ['cotton', 'polyester', 'linen', 'velvet', 'silk', 'sheer', 'satin', 'wool'];
    fabricKeywords.forEach(fabric => {
      if (text.includes(fabric)) {
        fabrics.push(fabric);
      }
    });

    return { sizes, colors, fabrics };
  }

  /**
   * Get stock status (mock for now - can be extended with actual inventory)
   */
  function getStockStatus(product) {
    // Prefer server-provided `stock_status` if available
    // Accept values: 'in_stock', 'low_stock', 'out_of_stock' (also hyphen/space variants)
    const raw = (product && (product.stock_status || product.stock || '') ) || '';
    const s = String(raw).trim().toLowerCase().replace(/[-\s]+/g, '_');

    if (s === 'out_of_stock' || s === 'outofstock' || s === 'out_of_stock') {
      return { status: 'out_of_stock', text: 'Out of stock', class: 'out-of-stock' };
    }
    if (s === 'low_stock' || s === 'lowstock' || s === 'low_stock') {
      return { status: 'low_stock', text: 'Low stock', class: 'low-stock' };
    }
    if (s === 'in_stock' || s === 'instock' || s === 'in_stock' || s === 'available') {
      return { status: 'in_stock', text: 'In stock', class: 'in-stock' };
    }

    // Fallback: check quantity-like fields or assume in stock
    return { status: 'in_stock', text: 'In stock', class: 'in-stock' };
  }

  /**
   * Get fabric description
   */
  function getFabricDescription(product) {
    const attrs = extractProductAttributes(product);
    const fabrics = attrs.fabrics;

    if (fabrics.length > 0) {
      const fabricList = fabrics.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(', ');
      return `This product is crafted from high-quality ${fabricList} fabric${fabrics.length > 1 ? 's' : ''}, ensuring durability and comfort. The premium materials used provide a luxurious feel while maintaining ease of care.`;
    }

    return 'Crafted from premium quality materials, this product offers excellent durability and comfort. The fabric is carefully selected to ensure a luxurious feel and long-lasting beauty.';
  }

  /**
   * Get care instructions
   */
  function getCareInstructions(product) {
    const attrs = extractProductAttributes(product);
    const fabrics = attrs.fabrics;

    const instructions = [
      'Machine wash in cold water on gentle cycle',
      'Use mild detergent, avoid bleach',
      'Tumble dry on low heat or air dry',
      'Iron on low heat if needed',
      'Do not dry clean unless specified'
    ];

    // Customize based on fabric type
    if (fabrics.includes('silk')) {
      instructions.unshift('Dry clean recommended');
      instructions.splice(1, 1, 'If hand washing, use cold water and gentle soap');
    }
    if (fabrics.includes('wool')) {
      instructions[0] = 'Hand wash in cold water or dry clean';
    }
    if (fabrics.includes('velvet')) {
      instructions[0] = 'Dry clean only for best results';
    }

    return instructions;
  }

  /**
   * Load product details
   */
  async function loadProduct() {
    try {
      const res = await fetch(apiUrl(`/api/products`));
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const products = await res.json();
      
      if (!Array.isArray(products)) {
        throw new Error('Invalid response format');
      }

      const product = products.find(p => p.id === productId);

      if (!product) {
        showError();
        return;
      }

      currentProduct = product;
      renderProduct(product);

    } catch (err) {
      console.error('Error loading product:', err);
      showError();
    }
  }

  /**
   * Render product details
   */
  function renderProduct(product) {
    // Update breadcrumb
    const breadcrumbEl = document.getElementById('breadcrumb-product');
    if (breadcrumbEl) {
      breadcrumbEl.textContent = product.name;
    }

    // Update page title
    document.title = `${product.name} | Classic Dreamspread`;

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = product.description || `${product.name} - Premium ${product.category} from Classic Dreamspread`;
    }

    // Images
    images = product.image_url ? [product.image_url] : [];
    // For multiple images, you can add more image URLs to the product data
    // For now, we'll use the single image

    // Product name
    const nameEl = document.getElementById('product-name');
    if (nameEl) nameEl.textContent = product.name;

    // Badge
    const badgeEl = document.getElementById('product-badge');
    if (badgeEl && product.badge) {
      badgeEl.textContent = product.badge;
      badgeEl.className = `badge badge-${product.badge.toLowerCase().replace(/\s+/g, '-')}`;
      badgeEl.style.display = 'inline-block';
    }

    // Price
    const priceEl = document.getElementById('product-price');
    if (priceEl) {
      const price = product.price ? Number(product.price).toLocaleString('en-GH') : '0';
      priceEl.textContent = `GHS ${price}`;
    }

    // Description
    const descEl = document.getElementById('product-description');
    if (descEl) {
      descEl.textContent = product.description || 'Premium quality product crafted with care and attention to detail.';
    }

    // Stock status
    const stockStatus = getStockStatus(product);
    const stockTextEl = document.getElementById('stock-text');
    if (stockTextEl) {
      stockTextEl.textContent = stockStatus.text;
      stockTextEl.className = `stock-text ${stockStatus.class}`;
    }

    // Images
    renderImages();

    // Size selector
    const attrs = extractProductAttributes(product);
    const sizeSelect = document.getElementById('size-select');
    if (sizeSelect) {
      // Filter available sizes
      const availableSizes = ['single', 'double', 'queen', 'king'];
      availableSizes.forEach(size => {
        const option = sizeSelect.querySelector(`option[value="${size}"]`);
        if (option && (attrs.sizes.length === 0 || attrs.sizes.includes(size))) {
          option.disabled = false;
        }
      });
    }

    // Color selector
    const colorSelect = document.getElementById('color-select');
    if (colorSelect && attrs.colors.length > 0) {
      attrs.colors.forEach(color => {
        const option = colorSelect.querySelector(`option[value="${color}"]`);
        if (option) option.disabled = false;
      });
    }

    // Fabric description
    const fabricDescEl = document.getElementById('fabric-description');
    if (fabricDescEl) {
      fabricDescEl.textContent = getFabricDescription(product);
    }

    // Care instructions
    const careInstructionsEl = document.getElementById('care-instructions');
    if (careInstructionsEl) {
      const instructions = getCareInstructions(product);
      careInstructionsEl.innerHTML = instructions.map(inst => `<li>${inst}</li>`).join('');
    }

    // WhatsApp link
    const whatsappBtn = document.getElementById('order-whatsapp-btn');
    if (whatsappBtn) {
      const message = encodeURIComponent(`Hello! I'm interested in ${product.name}${selectedSize ? ` - Size: ${selectedSize}` : ''}${selectedColor ? `, Color: ${selectedColor}` : ''}${quantity > 1 ? `, Quantity: ${quantity}` : ''}`);
      whatsappBtn.href = `https://wa.me/233540460532?text=${message}`;
    }

    // Show content
    if (loadingEl) loadingEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'grid';
  }

  /**
   * Render product images
   */
  function renderImages() {
    if (images.length === 0) {
      // Use placeholder
      if (mainImageEl) {
        mainImageEl.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-family="Arial, sans-serif" font-size="24">No Image Available</text></svg>';
        mainImageEl.alt = currentProduct?.name || 'Product image';
      }
      return;
    }

    // Main image
    if (mainImageEl && images[currentImageIndex]) {
      mainImageEl.src = images[currentImageIndex];
      mainImageEl.alt = currentProduct?.name || 'Product image';
    }

    // Thumbnails
    if (thumbnailsEl) {
      thumbnailsEl.innerHTML = '';
      images.forEach((img, index) => {
        const thumb = document.createElement('div');
        thumb.className = `product-thumbnail ${index === currentImageIndex ? 'active' : ''}`;
        thumb.setAttribute('role', 'listitem');
        thumb.setAttribute('aria-label', `View image ${index + 1}`);
        thumb.tabIndex = 0;
        
        const imgEl = document.createElement('img');
        imgEl.src = img;
        imgEl.alt = `${currentProduct?.name || 'Product'} - Image ${index + 1}`;
        imgEl.loading = 'lazy';
        
        thumb.appendChild(imgEl);
        thumb.addEventListener('click', () => switchImage(index));
        thumb.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            switchImage(index);
          }
        });
        
        thumbnailsEl.appendChild(thumb);
      });
    }
  }

  /**
   * Switch to a different image
   */
  function switchImage(index) {
    if (index >= 0 && index < images.length) {
      currentImageIndex = index;
      renderImages();
    }
  }

  /**
   * Initialize zoom feature
   */
  function initZoom() {
    if (!mainImageContainer || !mainImageEl) return;

    let isZoomed = false;

    function toggleZoom() {
      isZoomed = !isZoomed;
      mainImageContainer.classList.toggle('zoomed', isZoomed);
      if (zoomBtn) {
        zoomBtn.textContent = isZoomed ? '✕' : '🔍';
        zoomBtn.setAttribute('aria-label', isZoomed ? 'Close zoom' : 'Zoom image');
      }
    }

    if (zoomBtn) {
      zoomBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleZoom();
      });
    }

    mainImageContainer.addEventListener('click', () => {
      toggleZoom();
    });
  }

  /**
   * Initialize event listeners
   */
  function initEventListeners() {
    // Size selector
    const sizeSelect = document.getElementById('size-select');
    if (sizeSelect) {
      sizeSelect.addEventListener('change', (e) => {
        selectedSize = e.target.value;
        updateWhatsAppLink();
      });
    }

    // Color selector
    const colorSelect = document.getElementById('color-select');
    if (colorSelect) {
      colorSelect.addEventListener('change', (e) => {
        selectedColor = e.target.value;
        updateWhatsAppLink();
      });
    }

    // Quantity controls
    const quantityInput = document.getElementById('quantity-select');
    const decreaseBtn = document.getElementById('quantity-decrease');
    const increaseBtn = document.getElementById('quantity-increase');

    if (quantityInput) {
      quantityInput.addEventListener('change', (e) => {
        quantity = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
        e.target.value = quantity;
        updateWhatsAppLink();
      });
    }

    if (decreaseBtn) {
      decreaseBtn.addEventListener('click', () => {
        quantity = Math.max(1, quantity - 1);
        if (quantityInput) quantityInput.value = quantity;
        updateWhatsAppLink();
      });
    }

    if (increaseBtn) {
      increaseBtn.addEventListener('click', () => {
        quantity = Math.min(10, quantity + 1);
        if (quantityInput) quantityInput.value = quantity;
        updateWhatsAppLink();
      });
    }

    // Add to cart
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => {
        addToCart();
      });
    }

    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        switchTab(tab);
      });
    });

    // WhatsApp button
    const whatsappBtn = document.getElementById('order-whatsapp-btn');
    if (whatsappBtn) {
      whatsappBtn.addEventListener('click', () => {
        updateWhatsAppLink();
      });
    }
  }

  /**
   * Update WhatsApp link with current selections
   */
  function updateWhatsAppLink() {
    if (!currentProduct) return;

    const whatsappBtn = document.getElementById('order-whatsapp-btn');
    if (!whatsappBtn) return;

    let message = `Hello! I'm interested in ${currentProduct.name}`;
    if (selectedSize) message += ` - Size: ${selectedSize.charAt(0).toUpperCase() + selectedSize.slice(1)}`;
    if (selectedColor) message += `, Color: ${selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)}`;
    if (quantity > 1) message += `, Quantity: ${quantity}`;

    whatsappBtn.href = `https://wa.me/233540460532?text=${encodeURIComponent(message)}`;
  }

  /**
   * Add to cart (localStorage)
   */
  function addToCart() {
    if (!currentProduct) return;

    if (!selectedSize || !selectedColor) {
      alert('Please select both size and color before adding to cart.');
      return;
    }

    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      const cartItem = {
        id: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        image: images[0] || currentProduct.image_url,
        size: selectedSize,
        color: selectedColor,
        quantity: quantity,
        addedAt: new Date().toISOString()
      };

      cart.push(cartItem);
      localStorage.setItem('cart', JSON.stringify(cart));

      // Show success message
      const btn = document.getElementById('add-to-cart-btn');
      const originalText = btn.textContent;
      btn.textContent = '✓ Added to Cart!';
      btn.style.background = '#10b981';
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
      }, 2000);

      // Update WhatsApp link to include cart items
      updateWhatsAppLink();
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Unable to add to cart. Please try ordering via WhatsApp.');
    }
  }

  /**
   * Switch tabs
   */
  function switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Update tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `tab-${tab}`);
    });
  }

  /**
   * Show error state
   */
  function showError() {
    if (loadingEl) loadingEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'block';
  }

  /**
   * Load related products
   */
  async function loadRelatedProducts() {
    if (!currentProduct) return;

    try {
      const res = await fetch(apiUrl('/api/products'));
      if (!res.ok) return;

      const products = await res.json();
      if (!Array.isArray(products)) return;

      // Filter related products (same category, exclude current)
      const related = products
        .filter(p => p.id !== currentProduct.id && p.category === currentProduct.category && p.is_published)
        .slice(0, 4);

      if (related.length === 0) return;

      const relatedSection = document.getElementById('related-products-section');
      const relatedContainer = document.getElementById('related-products');

      if (!relatedSection || !relatedContainer) return;

      relatedContainer.innerHTML = '';

      related.forEach((product, index) => {
        const card = document.createElement('article');
        card.className = 'product-card';
        card.dataset.id = product.id;
        card.setAttribute('data-category', product.category || 'all');
        card.setAttribute('role', 'listitem');

        const badgeHTML = product.badge 
          ? `<span class="badge badge-${product.badge.toLowerCase().replace(/\s+/g, '-')}">${product.badge}</span>` 
          : '';

        const imgSrc = product.image_url || '';
        const price = product.price ? Number(product.price).toLocaleString('en-GH') : '0';

        card.innerHTML = `
          <a href="product.html?id=${product.id}" style="text-decoration: none; color: inherit;">
            ${badgeHTML}
            <span class="price-badge">GHS ${price}</span>
            <picture>
              <img src="${imgSrc}" alt="${product.name}" loading="lazy" decoding="async" width="400" height="300">
            </picture>
            <div class="product-card-content">
              <h3>${product.name}</h3>
              <a href="product.html?id=${product.id}" class="btn" style="background: linear-gradient(135deg, #25D366, #128C7E); margin-top: auto;">
                View Details
              </a>
            </div>
          </a>
        `;

        relatedContainer.appendChild(card);
      });

      relatedSection.style.display = 'block';
    } catch (err) {
      console.error('Error loading related products:', err);
    }
  }

  /**
   * Initialize
   */
  function init() {
    initEventListeners();
    initZoom();
    loadProduct().then(() => {
      if (currentProduct) {
        loadRelatedProducts();
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();