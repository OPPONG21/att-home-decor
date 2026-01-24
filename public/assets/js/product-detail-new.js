// product-detail-new.js

// Self-executing async function
(async function () {
  console.log('Product detail page loaded');

  // Supabase should be loaded synchronously now
  if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient !== 'undefined') {
    console.log('Supabase library is available. Proceeding with initialization.');

    const SUPABASE_URL = 'https://upmhieojblkvtgkxtocn.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_4lmKpyR0VTfgH5L4kkvLSQ_hi9XnpUM';

    const supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );

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
  } else {
    console.error('Supabase library failed to load.');
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

  const msg = encodeURIComponent(
    `Hello, I'm interested in:\n${product.name}\nPrice: GHS ${product.price}`
  );

  document.getElementById('order-whatsapp-btn').href =
    product.whatsapp_url ||
    `https://wa.me/233540460532?text=${msg}`;
}

function showError() {
  document.getElementById('product-loading').style.display = 'none';
  document.getElementById('product-error').style.display = 'block';
}