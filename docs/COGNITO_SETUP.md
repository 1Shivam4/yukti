# AWS Cognito Setup Guide

## Overview

This guide walks through setting up AWS Cognito for Yukti's authentication system.

## Step 1: Create User Pool

### Using AWS Console

1. **Navigate to AWS Cognito**
   - Go to AWS Console → Cognito → User Pools
   - Click "Create user pool"

2. **Configure Sign-in Experience**
   - Sign-in options: Email
   - User name requirements: Email address
   - Click "Next"

3. **Configure Security Requirements**
   - Password policy: Cognito defaults (or customize)
   - Multi-factor authentication: Optional (OFF for MVP, enable for production)
   - Click "Next"

4. **Configure Sign-up Experience**
   - Self-registration: Enabled
   - Attribute verification: Email
   - Required attributes:
     - name (required)
     - email (required)
   - Click "Next"

5. **Configure Message Delivery**
   - Email provider: Send email with Cognito (free tier)
   - FROM email address: no-reply@verificationemail.com
   - Click "Next"

6. **Integrate Your App**
   - User pool name: `yukti-users`
   - Hosted authentication pages: Not configured (we'll use custom UI)
   - App client name: `yukti-web-client`
   - Client secret: Don't generate (for frontend apps)
   - Authentication flows: ALLOW_USER_PASSWORD_AUTH, ALLOW_REFRESH_TOKEN_AUTH
   - Click "Next"

7. **Review and Create**
   - Review settings
   - Click "Create user pool"

### Save These Values

After creation, note down:

- **User Pool ID**: `us-east-1_XXXXXXXXX`
- **App Client ID**: `XXXXXXXXXXXXXXXXXXXXXXXXXX`
- **Region**: `us-east-1` (or your chosen region)

## Step 2: Configure Social Providers (Optional)

### Google OAuth

1. **Create Google OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create project "Yukti"
   - Enable "Google+ API"
   - Create OAuth 2.0 credentials
   - Authorized redirect URIs:
     ```
     https://<your-cognito-domain>.auth.<region>.amazoncognito.com/oauth2/idpresponse
     ```

2. **Add to Cognito**
   - User Pool → Sign-in experience → Federated identity providers
   - Add "Google"
   - Client ID: From Google Console
   - Client secret: From Google Console
   - Scopes: `profile email openid`

### LinkedIn OAuth (Similar Process)

1. Create LinkedIn app
2. Add redirect URI
3. Configure in Cognito

## Step 3: Configure App Client Settings

1. Go to: User Pool → App integration → App client list → yukti-web-client
2. Configure:
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
   - **OAuth flows**: Authorization code grant, Implicit grant
   - **OAuth scopes**: email, openid, profile

## Step 4: Set Environment Variables

Create/update `.env`:

```bash
# AWS Cognito Configuration
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
COGNITO_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXXXXX

# For backend Lambda
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

## Step 5: Test Authentication Flow

```bash
# Start frontend
cd apps/web
bun dev

# Should redirect to Cognito hosted UI for login
```

## Using AWS CLI (Alternative)

```bash
# Create user pool
aws cognito-idp create-user-pool \
  --pool-name yukti-users \
  --auto-verified-attributes email \
  --policies 'PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true}' \
  --region us-east-1

# Create app client
aws cognito-idp create-user-pool-client \
  --user-pool-id us-east-1_XXXXXXXXX \
  --client-name yukti-web-client \
  --no-generate-secret \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --region us-east-1
```

## Post-Confirmation Trigger (Lambda)

To sync Cognito users to PostgreSQL:

```javascript
// Lambda trigger: Post confirmation
exports.handler = async (event) => {
  const { email, sub, name } = event.request.userAttributes;

  // Call your API to create user in PostgreSQL
  await fetch("https://api.yukti.com/auth/cognito-webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cognitoId: sub,
      email,
      name,
    }),
  });

  return event;
};
```

## Troubleshooting

### "User does not exist" Error

- Verify user pool ID and client ID
- Check that user confirmed email

### CORS Errors

- Add your domain to allowed callback URLs
- Verify CORS configuration in API Gateway

### Invalid Refresh Token

- Check token expiration settings in Cognito
- Verify ALLOW_REFRESH_TOKEN_AUTH is enabled

## Next Steps

1. ✅ Cognito User Pool created
2. ⏭️ Implement auth Lambda function
3. ⏭️ Add auth UI to frontend
4. ⏭️ Test complete auth flow
