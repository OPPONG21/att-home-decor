// product-detail-new.js

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
  document.getElementById('product-price').textContent =
    `GHS ${Number(product.price).toLocaleString('en-GH')}`;

  document.getElementById('product-description').innerHTML =
    `<p>${product.description || ''}</p>`;

  const mainImg = document.getElementById('main-product-image');
  mainImg.src = product.image_url;
  mainImg.alt = product.name;

  const thumbs = document.getElementById('product-thumbnails');
  thumbs.innerHTML = '';

  const images = Array.isArray(product.images)
    ? product.images
    : [product.image_url];

  images.forEach((url) => {
    const img = document.createElement('img');
    img.src = url;
    img.alt = product.name;
    img.onclick = () => (mainImg.src = url);
    thumbs.appendChild(img);
  });

  document.getElementById('stock-text').textContent =
    product.in_stock === false ? 'Out of stock' : 'In stock';

  // Populate color options
  const colorSelect = document.getElementById('color-select');
  colorSelect.innerHTML = '<option value="">Select Color</option>';
  
  // Extract colors from product text (similar to products.js)
  const text = `${product.name || ''} ${product.description || ''}`.toLowerCase();
  const availableColors = ['white', 'beige', 'gray', 'grey', 'blue', 'red', 'green', 'purple', 'yellow']
    .filter(color => text.includes(color));
  
  // Add default colors if none found
  if (availableColors.length === 0) {
    availableColors.push('white', 'beige', 'gray');
  }
  
  availableColors.forEach(color => {
    const option = document.createElement('option');
    option.value = color;
    option.textContent = color.charAt(0).toUpperCase() + color.slice(1);
    colorSelect.appendChild(option);
  });

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

  colorSelect.addEventListener('change', () => updateWhatsAppLink(product));

  // Initial WhatsApp link
  updateWhatsAppLink(product);
}

function updateWhatsAppLink(product) {
  const colorSelect = document.getElementById('color-select');
  const quantityInput = document.getElementById('quantity-input');
  
  const selectedColor = colorSelect.value;
  const quantity = parseInt(quantityInput.value) || 1;
  
  let message = `Hello, I'm interested in\n${product.name}\nPrice: GHS ${product.price}`;
  if (selectedColor) {
    message += `\nColor: ${selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)}`;
  }
  message += `\nQuantity: ${quantity}`;
  message += `\nTotal: GHS ${(product.price * quantity).toLocaleString('en-GH')}`;
  
  const encodedMsg = encodeURIComponent(message);
  
  document.getElementById('order-whatsapp-btn').href =
    product.whatsapp_url ||
    `https://wa.me/233540460532?text=${encodedMsg}`;
}

function showError() {
  document.getElementById('product-loading').style.display = 'none';
  document.getElementById('product-error').style.display = 'block';
}