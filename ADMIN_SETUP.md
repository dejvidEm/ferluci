# Admin Setup Guide

This guide explains how to set up the custom admin area for managing vehicle listings.

## Environment Variables

You need to set the following environment variables in your `.env.local` file (for local development) and in your Vercel project settings (for production).

### Required Environment Variables

```bash
# Sanity Configuration
SANITY_PROJECT_ID=your-project-id
SANITY_DATASET=production
SANITY_API_VERSION=2024-01-01
SANITY_WRITE_TOKEN=your-write-token

# Admin Authentication
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-password
ADMIN_SESSION_SECRET=your-random-secret-string-min-32-chars
```

### Getting Your Sanity Credentials

1. **SANITY_PROJECT_ID**: Found in your Sanity project dashboard URL or `sanity.config.ts`
2. **SANITY_DATASET**: Usually `production` or `development`
3. **SANITY_WRITE_TOKEN**: 
   - Go to https://www.sanity.io/manage
   - Select your project
   - Go to API → Tokens
   - Create a new token with "Editor" permissions
   - Copy the token (you'll only see it once!)

### Generating ADMIN_SESSION_SECRET

Generate a secure random string (at least 32 characters):

```bash
# Using openssl
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Setting Up Locally

1. Create `.env.local` in the `web` directory:
   ```bash
   cd web
   touch .env.local
   ```

2. Add all environment variables to `.env.local`

3. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Navigate to `http://localhost:3000/admin` and log in

### Setting Up on Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add all required environment variables:
   - Set them for **Production**, **Preview**, and **Development** environments
   - Make sure `SANITY_WRITE_TOKEN` and `ADMIN_SESSION_SECRET` are marked as **Sensitive**
4. Redeploy your application

## Usage

### Accessing the Admin Area

1. Navigate to `/admin` (e.g., `https://yourdomain.com/admin`)
2. Log in with your `ADMIN_USERNAME` and `ADMIN_PASSWORD`
3. You'll be redirected to `/admin/vehicles/new`

### Adding a Vehicle

1. Fill out all required fields in the form
2. Upload images (at least 1 required):
   - Click "Select Images" to choose multiple images
   - Images will appear as previews
   - Click "Upload X Image(s)" to upload to Sanity
   - Wait for upload to complete (green checkmark appears)
   - Reorder images using up/down arrows
   - Remove images using the X button
3. Add features (at least 1 required):
   - Click "Add Feature" to add more
   - Remove features using the X button
4. Toggle "Show Old Price" if you want to display a discounted price
5. Toggle "Mark as Featured Vehicle" to feature it on the homepage
6. Click "Create Vehicle"
7. After success, you can:
   - View the vehicle page
   - Add another vehicle
   - Logout

### Security Notes

- The admin area is protected by server-side middleware
- Session cookies are httpOnly and secure (in production)
- Never commit `.env.local` to version control
- Use strong passwords for `ADMIN_PASSWORD`
- Rotate `ADMIN_SESSION_SECRET` periodically
- Keep `SANITY_WRITE_TOKEN` secure - it has write access to your Sanity dataset

## Troubleshooting

### "Server configuration error"
- Check that all environment variables are set correctly
- Verify `SANITY_WRITE_TOKEN` has write permissions

### "Unauthorized" error
- Your session may have expired - log in again
- Check that `ADMIN_SESSION_SECRET` is set correctly

### Image upload fails
- Verify `SANITY_WRITE_TOKEN` is correct
- Check that images are valid image files
- Ensure network connection is stable

### Vehicle creation fails
- Check browser console for validation errors
- Ensure all required fields are filled
- Verify images are uploaded before submitting
- Check server logs for detailed error messages

## File Structure

```
web/
├── app/
│   ├── admin/
│   │   ├── page.tsx              # Login page
│   │   └── vehicles/
│   │       └── new/
│   │           └── page.tsx      # Vehicle form
│   └── api/
│       └── admin/
│           ├── login/route.ts    # Login endpoint
│           ├── logout/route.ts  # Logout endpoint
│           ├── upload-images/route.ts  # Image upload
│           └── vehicles/route.ts # Vehicle creation
├── components/
│   └── admin/
│       └── image-uploader.tsx    # Image upload component
├── lib/
│   ├── auth.ts                   # Session management
│   ├── slug.ts                   # Slug generation
│   └── sanity/
│       └── adminClient.ts        # Sanity write client
└── middleware.ts                 # Route protection
```

## Support

For issues or questions, check:
- Sanity documentation: https://www.sanity.io/docs
- Next.js documentation: https://nextjs.org/docs
- Vercel documentation: https://vercel.com/docs
