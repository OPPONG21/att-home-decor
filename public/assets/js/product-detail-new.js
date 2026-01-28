// product-detail-new.js

// Helper function to capitalize strings
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Self-executing async function
(async function () {
  console.log('Product detail page loaded');

  const SUPABASE_URL = 'https://upmhieojblkvtgkxtocn.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_4lmKpyR0VTfgH5L4kkvLSQ_hi9XnpUM';

  // Wait for Supabase to be available (created by `supabase.js` or CDN)
  async function waitForSupabase(timeout = 4000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
        return window.supabaseClient;
      }
      if (window.supabase && typeof window.supabase.createClient === 'function') {
        try {
          window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
          return window.supabaseClient;
        } catch (e) {
          console.warn('Error creating supabase client:', e);
        }
      }
      await new Promise((r) => setTimeout(r, 100));
    }
    return null;
  }

  const supabaseClient = await waitForSupabase(5000);

  if (!supabaseClient) {
    console.error('Supabase library failed to load.');
    showError();
    return;
  }

  // Continue with fetching product
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (!productId) {
    showError();
    return;
  }

  try {
    const { data: product, error } = await supabaseClient
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('is_published', true)
      .single();

    if (error || !product) {
      console.error('Supabase data fetch error:', error);
      showError();
      return;
    }

    populateProduct(product);
  } catch (fetchError) {
    console.error('An error occurred during Supabase data fetch:', fetchError);
    showError();
  }
})(); // End of self-executing async function

function populateProduct(product) {
  document.getElementById('product-loading').style.display = 'none';
  document.getElementById('product-content').style.display = 'grid';

  document.getElementById('product-name').textContent = product.name;
  
  // Display category and subcategory
  let categoryText = product.category ? capitalize(product.category) : '';
  if (product.subcategory) {
    categoryText += ` / ${product.subcategory}`;
  }
  document.getElementById('product-category').textContent = categoryText;
  
  document.getElementById('product-price').textContent =
    `GHS ${Number(product.price).toLocaleString('en-GH')}`;

  document.getElementById('product-description').innerHTML =
    `<p>${product.notes || product.description || ''}</p>`;

  const mainImg = document.getElementById('main-product-image');
  mainImg.src = product.image_url;
  mainImg.alt = product.name;

  const thumbs = document.getElementById('product-thumbnails');
  thumbs.innerHTML = '';

  const images = Array.isArray(product.images)
    ? product.images
    : [product.image_url];

  const mainWrapper = document.querySelector('.product-main-image');

  images.forEach((url, idx) => {
    const thumbWrap = document.createElement('div');
    thumbWrap.className = 'product-thumbnail';

    const img = document.createElement('img');
    img.src = url;
    img.alt = product.name;

    img.addEventListener('click', () => {
      mainImg.src = url;
      // mark active thumbnail
      Array.from(thumbs.children).forEach((c) => c.classList.remove('active'));
      thumbWrap.classList.add('active');
      // remove zoom when changing image
      if (mainWrapper) mainWrapper.classList.remove('zoomed');
    });

    if (idx === 0) thumbWrap.classList.add('active');

    thumbWrap.appendChild(img);
    thumbs.appendChild(thumbWrap);
  });

  // Toggle zoom on main image or zoom button
  if (mainWrapper) {
    const zoomBtn = mainWrapper.querySelector('.zoom-btn');
    mainWrapper.addEventListener('click', (e) => {
      // prevent toggling when clicking a thumbnail (thumbs are outside)
      if (e.target.closest('.product-thumbnail')) return;
      mainWrapper.classList.toggle('zoomed');
    });
    if (zoomBtn) {
      zoomBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mainWrapper.classList.toggle('zoomed');
      });
    }
  }

  document.getElementById('stock-text').textContent =
    product.in_stock === false ? 'Out of stock' : 'In stock';

  // Populate color options
  // Quantity controls
  const quantityInput = document.getElementById('quantity-input');
  const quantityMinus = document.getElementById('quantity-minus');
  const quantityPlus = document.getElementById('quantity-plus');

  quantityMinus.addEventListener('click', () => {
    const current = parseInt(quantityInput.value) || 1;
    if (current > 1) quantityInput.value = current - 1;
    updateWhatsAppLink(product);
  });

  quantityPlus.addEventListener('click', () => {
    const current = parseInt(quantityInput.value) || 1;
    quantityInput.value = current + 1;
    updateWhatsAppLink(product);
  });

  quantityInput.addEventListener('change', () => {
    const current = parseInt(quantityInput.value) || 1;
    if (current < 1) quantityInput.value = 1;
    updateWhatsAppLink(product);
  });

  // Initial WhatsApp link
  updateWhatsAppLink(product);
}

function updateWhatsAppLink(product) {
  const quantityInput = document.getElementById('quantity-input');
  const quantity = parseInt(quantityInput.value) || 1;
  
  let message = `Hello, I'm interested in:\n${product.name}`;
  if (product.subcategory) {
    message += `\nType: ${product.subcategory}`;
  }
  message += `\nPrice: GHS ${product.price}`;
  message += `\nQuantity: ${quantity}`;
  message += `\nTotal: GHS ${(product.price * quantity).toLocaleString('en-GH')}`;
  
  const encodedMsg = encodeURIComponent(message);
  
  // If the product provides a WhatsApp base URL, append the message as a query param.
  // Otherwise use the default phone number with the encoded text.
  let href;
  if (product.whatsapp_url && typeof product.whatsapp_url === 'string') {
    const base = product.whatsapp_url.split('?')[0];
    href = `${base}?text=${encodedMsg}`;
  } else {
    href = `https://wa.me/233540460532?text=${encodedMsg}`;
  }

  document.getElementById('order-whatsapp-btn').href = href;
}

function showError() {
  document.getElementById('product-loading').style.display = 'none';
  document.getElementById('product-error').style.display = 'block';
}