require('dotenv').config();
const { supabaseAdmin } = require('../supabase');

async function main() {
  if (!supabaseAdmin) {
    console.error('supabaseAdmin is not configured. Set SUPABASE_SERVICE_ROLE in your environment.');
    process.exit(1);
  }

  const products = [
    {"id":"7d22c84d-a53a-46f5-8ce1-d396348ca1c2","name":"Classic Bedspread","category":"bedspread","price":280,"image_url":"https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/bedspread-classic.webp","whatsapp_url":"https://wa.me/0554731557","created_at":"2026-01-06T14:07:55.053096"},
    {"id":"6e65e7f7-4d8d-46ab-a132-d43fa56e313e","name":"Cozy Bedspread","category":"bedspread","price":290,"image_url":"https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/bedspread-cozy.webp","whatsapp_url":"https://wa.me/0554731557","created_at":"2026-01-06T14:07:55.053096"},
    {"id":"fc841239-f5b6-4537-bf78-a36eeb0fbf76","name":"Heritage Bedspread","category":"bedspread","price":310,"image_url":"https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/bedspread-heritage.webp","whatsapp_url":"https://wa.me/0554731557","created_at":"2026-01-06T14:07:55.053096"},
    {"id":"da6360a0-3c92-467d-91f2-b4f1e15fb325","name":"Luxury Bedspread","category":"bedspread","price":350,"image_url":"https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/bedspread-luxury.webp","whatsapp_url":"https://wa.me/0554731557","created_at":"2026-01-06T14:07:55.053096"},
    {"id":"de20153b-5622-459c-87d5-e98c9d2385ea","name":"Modern Bedspread","category":"bedspread","price":300,"image_url":"https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/bedspread-modern.webp","whatsapp_url":"https://wa.me/0554731557","created_at":"2026-01-06T14:07:55.053096"},
    {"id":"669c0ad9-6d1a-4ae2-b6df-66b52583029b","name":"Opal Bedspread","category":"bedspread","price":275,"image_url":"https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/bedspread-opal.webp","whatsapp_url":"https://wa.me/0554731557","created_at":"2026-01-06T14:07:55.053096"},
    {"id":"cbc27ea5-66b9-478b-8900-f7a87a9c2089","name":"Regal Bedspread","category":"bedspread","price":320,"image_url":"https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/bedspread-regal.webp","whatsapp_url":"https://wa.me/0554731557","created_at":"2026-01-06T14:07:55.053096"},
    {"id":"6eb3e1c3-8c70-4b44-9269-9ff6d2109087","name":"Vista Bedspread","category":"bedspread","price":310,"image_url":"https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/bedspread-vista.webp","whatsapp_url":"https://wa.me/0554731557","created_at":"2026-01-06T14:07:55.053096"},
    {"id":"fc20a3e3-a1db-41fd-a3d9-0ac0c0553b64","name":"Curtain 1","category":"curtain","price":200,"image_url":"https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/curt1.webp","whatsapp_url":"https://wa.me/0554731557","created_at":"2026-01-06T14:07:55.053096"},
    {"id":"a26c2d29-fbbe-4e6c-980f-9486a3add925","name":"Curtain 2","category":"curtain","price":180,"image_url":"https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/curt2.webp","whatsapp_url":"https://wa.me/0554731557","created_at":"2026-01-06T14:07:55.053096"},
    {"id":"8326c697-6baf-4b8d-8e31-2fb0b73712a2","name":"Curtain 3","category":"curtain","price":250,"image_url":"https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/curt3.webp","whatsapp_url":"https://wa.me/0554731557","created_at":"2026-01-06T14:07:55.053096"},
    {"id":"a3718c49-2d35-46b9-af5d-360c2b253671","name":"Curtain 4","category":"curtain","price":190,"image_url":"https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/curt4.jpg","whatsapp_url":"https://wa.me/0554731557","created_at":"2026-01-06T14:07:55.053096"},
    {"id":"8c957611-484e-4068-8c68-571de3c2d82e","name":"Curtain 5","category":"curtain","price":260,"image_url":"https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/curt5.jpg","whatsapp_url":"https://wa.me/0554731557","created_at":"2026-01-06T14:07:55.053096"},
    {"id":"b26ef018-67d6-4a01-8c41-dd37dcd5a516","name":"Curtain 6","category":"curtain","price":240,"image_url":"https://upmhieojblkvtgkxtocn.supabase.co/storage/v1/object/public/product-images/curt6.jpg","whatsapp_url":"https://wa.me/0554731557","created_at":"2026-01-06T14:07:55.053096"}
  ];

  try {
    // Use upsert to be idempotent
    const { data, error } = await supabaseAdmin.from('products').upsert(products, { returning: 'representation' });
    if (error) {
      console.error('Seed error:', error);
      process.exit(1);
    }
    if (Array.isArray(data)) {
      console.log('Seeded products:', data.length);
    } else {
      console.log('Seed completed. Response data:', data);
    }

    // Verify by fetching a few products
    try {
      const { data: checkData, error: checkErr } = await supabaseAdmin.from('products').select('id,name').limit(10).order('created_at', { ascending: false });
      if (checkErr) {
        console.warn('Could not verify products after seed:', checkErr);
      } else if (Array.isArray(checkData)) {
        console.log('Products in table (sample):', checkData.length);
      } else {
        console.log('Products verification returned:', checkData);
      }
    } catch (e) {
      console.warn('Verification error:', e);
    }
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error during seed:', err);
    process.exit(1);
  }
}

main();
