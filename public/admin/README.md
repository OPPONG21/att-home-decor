# Admin Login System

## Overview

This admin system provides secure authentication and a dashboard for managing Classic Dreamspread. It uses Supabase authentication with role-based access control.

## Files

- **login.html** - Admin login page
- **dashboard.html** - Admin dashboard with product statistics
- **admin.css** - Professional styling for admin pages
- **admin.js** - Authentication and dashboard functionality

## Setup

### 1. Supabase Database Setup

You need a `profiles` table in your Supabase database with the following structure:

```sql
-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Create policy to allow service role to read all profiles
CREATE POLICY "Service role can read all profiles"
  ON profiles FOR SELECT
  USING (auth.role() = 'service_role');
```

### 2. Create Admin User

To create an admin user, you need to:

1. **Sign up a user** via Supabase Auth (they can sign up through your app)
2. **Update their profile** to set `role = 'admin'`:

```sql
-- Replace 'user-email@example.com' with the actual admin email
UPDATE profiles
SET role = 'admin'
WHERE email = 'user-email@example.com';
```

Or via Supabase Dashboard:
- Go to Authentication → Users
- Find the user you want to make admin
- Note their User ID
- Go to Table Editor → profiles
- Create/update a row with:
  - `id` = the user's UUID
  - `email` = the user's email
  - `role` = `admin`

### 3. Access Admin Panel

1. Navigate to `/admin/login.html` (or `/admin/` if your server redirects)
2. Enter your admin email and password
3. You'll be redirected to the dashboard if authentication succeeds

## Features

### Login Page
- Email and password authentication
- Password visibility toggle
- Form validation
- Error handling
- Loading states
- Responsive design

### Dashboard
- **Statistics Cards**:
  - Total Products
  - Categories Count
  - Bedspreads Count
  - Curtains Count

- **Products Table**:
  - Displays all products
  - Shows name, category, price, and image
  - Refresh button to reload data

- **Security**:
  - Automatic authentication check
  - Role-based access (only `role='admin'` can access)
  - Auto-redirect to login if not authenticated
  - Secure logout functionality

## Security Considerations

1. **Row Level Security (RLS)**: Ensure RLS is enabled on your `profiles` table
2. **Environment Variables**: The Supabase keys are in the JavaScript file for simplicity, but in production, consider loading them from environment variables
3. **HTTPS**: Always use HTTPS in production
4. **Password Policy**: Ensure strong password requirements in Supabase Auth settings
5. **Session Management**: Supabase handles session management automatically

## Customization

### Change Supabase Configuration

Edit `admin.js` and update:
```javascript
const SUPABASE_URL = 'your-supabase-url';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

### Modify Dashboard

You can extend the dashboard in `dashboard.html` to add:
- Product management (create, edit, delete)
- User management
- Analytics
- Settings

### Styling

All styles are in `admin.css`. The design uses CSS variables from the main stylesheet, so changes there will propagate automatically.

## Troubleshooting

### "Access denied" error
- Verify the user's profile has `role = 'admin'`
- Check that the `profiles` table exists and has the correct structure

### Cannot load products
- Verify Supabase connection
- Check that the `products` table exists
- Ensure RLS policies allow authenticated users to read products

### Login doesn't work
- Verify Supabase authentication is enabled
- Check browser console for errors
- Ensure the Supabase URL and keys are correct

## Future Enhancements

Possible improvements:
- [ ] Server-side admin routes for additional operations
- [ ] Product CRUD operations
- [ ] User management
- [ ] Analytics and reporting
- [ ] Image upload functionality
- [ ] Export/import features
