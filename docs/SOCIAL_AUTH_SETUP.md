# Social Authentication Setup Guide

This guide walks through setting up Google and Facebook social logins for Yukti.

## Prerequisites

- AWS Cognito User Pool already created (see [COGNITO_SETUP.md](./COGNITO_SETUP.md))
- Cognito Domain configured

---

## Step 1: Configure Cognito Hosted UI Domain

1. Go to **AWS Console → Cognito → User Pools → yukti-users**
2. Navigate to **App Integration** tab
3. Under **Domain**, click **Actions → Create Cognito domain**
4. Enter a domain prefix: `yukti-auth` (or your preferred name)
5. The full domain will be: `yukti-auth.auth.us-east-1.amazoncognito.com`
6. Add this to your `.env`:
   ```
   COGNITO_DOMAIN=yukti-auth.auth.us-east-1.amazoncognito.com
   NEXT_PUBLIC_COGNITO_DOMAIN=yukti-auth.auth.us-east-1.amazoncognito.com
   ```

---

## Step 2: Google OAuth Setup

### Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services → OAuth consent screen**
4. Configure consent screen:
   - User Type: External
   - App name: Yukti
   - User support email: Your email
   - Authorized domains: `amazoncognito.com`
   - Developer contact: Your email
5. Add scopes: `email`, `profile`, `openid`
6. Go to **APIs & Services → Credentials**
7. Click **Create Credentials → OAuth client ID**
8. Application type: Web application
9. Name: Yukti Web Client
10. Add **Authorized redirect URIs**:
    ```
    https://yukti-auth.auth.us-east-1.amazoncognito.com/oauth2/idpresponse
    ```
11. Click **Create** and save the **Client ID** and **Client Secret**

### Add Google to Cognito

1. Go to **Cognito → User Pools → yukti-users → Sign-in experience**
2. Under **Federated identity provider sign-in**, click **Add identity provider**
3. Select **Google**
4. Enter:
   - Google Client ID: (from Google Console)
   - Google Client secret: (from Google Console)
   - Authorized scopes: `profile email openid`
5. Map attributes:
   - `email` → email
   - `name` → name
6. Click **Add identity provider**

---

## Step 3: Facebook Login Setup

### Create Facebook App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click **My Apps → Create App**
3. Select **Consumer** use case
4. App name: Yukti
5. Contact email: Your email
6. Navigate to **App Settings → Basic**
7. Note down **App ID** and **App Secret**
8. Add Platform → Website → Site URL: `https://yukti.com`

### Configure Facebook Login

1. In your Facebook app, go to **Use Cases → Customize → Facebook Login**
2. Go to **Facebook Login → Settings**
3. Add Valid OAuth Redirect URIs:
   ```
   https://yukti-auth.auth.us-east-1.amazoncognito.com/oauth2/idpresponse
   ```
4. Save changes

### Add Facebook to Cognito

1. Go to **Cognito → User Pools → yukti-users → Sign-in experience**
2. Under **Federated identity provider sign-in**, click **Add identity provider**
3. Select **Facebook**
4. Enter:
   - Facebook App ID: (from Meta Console)
   - Facebook App secret: (from Meta Console)
   - Authorize scopes: `public_profile, email`
5. Map attributes:
   - `email` → email
   - `name` → name
6. Click **Add identity provider**

---

## Step 4: Configure App Client

1. Go to **Cognito → User Pools → yukti-users → App Integration**
2. Under **App clients**, click on `yukti-web-client`
3. Click **Edit Hosted UI**
4. Configure:
   - **Allowed callback URLs**:
     ```
     http://localhost:3000/auth/callback
     https://yukti.com/auth/callback
     ```
   - **Allowed sign-out URLs**:
     ```
     http://localhost:3000
     https://yukti.com
     ```
   - **Identity providers**: Select Google and Facebook
   - **OAuth grant types**: Authorization code grant
   - **OpenID Connect scopes**: email, openid, profile
5. Save changes

---

## Step 5: Test Social Logins

1. Start your development server:
   ```bash
   cd apps/web && bun dev
   ```
2. Navigate to `http://localhost:3000/auth/login`
3. Click **Google** or **Facebook** button
4. You should be redirected to the social provider's login page
5. After authentication, you'll be redirected back to your app

---

## Troubleshooting

### "redirect_mismatch" Error

- Verify the callback URL in Cognito matches exactly
- Check for trailing slashes
- Ensure you're using the correct Cognito domain

### "Access blocked" on Google

- Enable Google+ API in Google Cloud Console
- Verify OAuth consent screen is configured
- Check authorized domains include `amazoncognito.com`

### Facebook Login Not Working

- Ensure app is in Live mode (not Development)
- Check Valid OAuth Redirect URIs
- Verify app is not restricted

### User Not Created in Database

- The `/auth/callback` endpoint creates users automatically
- Check Lambda logs for errors
- Verify database connection

---

## Environment Variables Summary

```bash
# Required for social logins
COGNITO_DOMAIN=yukti-auth.auth.us-east-1.amazoncognito.com
NEXT_PUBLIC_COGNITO_DOMAIN=yukti-auth.auth.us-east-1.amazoncognito.com
OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback
```
