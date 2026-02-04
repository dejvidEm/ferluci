# Resend Email Setup Guide

This guide explains how to set up Resend for the contact forms.

## Installation

First, install the Resend package:

```bash
npm install resend
# or
pnpm install resend
```

## Environment Variables

Add the following environment variables to your `.env.local` file (or your deployment platform's environment variables):

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
CONTACT_EMAIL=contact@ferlucicars.eu
```

**Note:** 
- `RESEND_FROM_EMAIL` is optional. If not set, it will default to `onboarding@resend.dev` (Resend's default email that works without domain verification).
- You can use `onboarding@resend.dev` for testing, or set it to your verified domain email (e.g., `noreply@yourdomain.com`) for production.

### Getting Your Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Go to your dashboard
3. Navigate to "API Keys" section
4. Create a new API key
5. Copy the key and add it to `RESEND_API_KEY`

### Setting Up Email Domain (Optional)

If you want to use a custom email address from your domain:

1. In Resend dashboard, go to "Domains"
2. Add your domain (e.g., `ferlucicars.eu`)
3. Follow the DNS setup instructions to verify your domain
4. Once verified, set `RESEND_FROM_EMAIL` to an email from your domain (e.g., `noreply@ferlucicars.eu`)

**Note:** You can skip this step and use the default `onboarding@resend.dev` email for testing and development.

### Contact Email

Set `CONTACT_EMAIL` to the email address where you want to receive form submissions. This can be any email address (doesn't need to be from your verified domain).

## Forms

Both forms are now functional:

1. **Contact Form** (`/contact`) - Sends emails via `/api/contact`
2. **Custom Vehicle Form** (`custom-vehicle-form.tsx`) - Sends emails via `/api/custom-vehicle`

Both forms send emails to the same address specified in `CONTACT_EMAIL`.

## Testing

After setting up the environment variables:

1. Restart your development server
2. Fill out either form
3. Check your email inbox (and spam folder) for the submission

## Troubleshooting

- **"Chyba pri odosielaní emailu"**: Check that `RESEND_API_KEY` is correct and your domain is verified
- **Emails not arriving**: Check spam folder, verify domain DNS settings in Resend dashboard
- **API errors**: Check server logs for detailed error messages
