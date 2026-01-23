# Open Graph Image Requirements

## File Needed
Create an `og-image.jpg` file in this directory (`assets/images/og-image.jpg`).

## Specifications
- **Dimensions**: 1200x630 pixels (1.91:1 aspect ratio)
- **Format**: JPG or PNG
- **File size**: Under 300KB (optimize for web)
- **Content**: Should feature Classic Dreamspread branding, product imagery, or a compelling visual that represents the brand

## Recommended Tools
- Use tools like Canva, Figma, or Photoshop to create the image
- Optimize using tools like:
  - [TinyPNG](https://tinypng.com/)
  - [Squoosh](https://squoosh.app/)
  - [ImageOptim](https://imageoptim.com/)

## Alternative: Use a Product Image
If you don't have a custom OG image yet, you can temporarily use one of your product images from Supabase storage. Update the `og:image` meta tag in `public/index.html` to point to that image URL.

## Current Reference
The meta tag in `public/index.html` references:
```
https://att-home-decor.com/assets/images/og-image.jpg
```

Make sure this file exists and is accessible at the production URL.
