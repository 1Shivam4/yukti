import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  GlobalSignOutCommand,
  GetUserCommand,
  AdminGetUserCommand,
  type InitiateAuthCommandInput,
  type SignUpCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";

const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || "us-east-1",
});

// Use getters to ensure env vars are read after dotenv loads
const getClientId = () => process.env.COGNITO_CLIENT_ID || "";
const getUserPoolId = () => process.env.COGNITO_USER_POOL_ID || "";

export interface CognitoTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface CognitoUser {
  sub: string;
  email: string;
  name?: string;
  emailVerified: boolean;
}

/**
 * Sign up a new user with email and password
 */
export async function signUpUser(
  email: string,
  password: string,
  name: string
): Promise<{ userSub: string; isConfirmed: boolean }> {
  const params: SignUpCommandInput = {
    ClientId: getClientId(),
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "name", Value: name },
    ],
  };

  const command = new SignUpCommand(params);
  const response = await cognito.send(command);

  return {
    userSub: response.UserSub || "",
    isConfirmed: response.UserConfirmed || false,
  };
}

/**
 * Confirm user signup with verification code
 */
export async function confirmSignUp(email: string, code: string): Promise<void> {
  const command = new ConfirmSignUpCommand({
    ClientId: getClientId(),
    Username: email,
    ConfirmationCode: code,
  });

  await cognito.send(command);
}

/**
 * Sign in user with email and password
 */
export async function signInUser(email: string, password: string): Promise<CognitoTokens> {
  const params: InitiateAuthCommandInput = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: getClientId(),
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  };

  const command = new InitiateAuthCommand(params);
  const response = await cognito.send(command);

  if (!response.AuthenticationResult) {
    throw new Error("Authentication failed - no result returned");
  }

  return {
    accessToken: response.AuthenticationResult.AccessToken || "",
    idToken: response.AuthenticationResult.IdToken || "",
    refreshToken: response.AuthenticationResult.RefreshToken || "",
    expiresIn: response.AuthenticationResult.ExpiresIn || 3600,
  };
}

/**
 * Refresh tokens using refresh token
 */
export async function refreshCognitoTokens(
  refreshToken: string
): Promise<Omit<CognitoTokens, "refreshToken">> {
  const params: InitiateAuthCommandInput = {
    AuthFlow: "REFRESH_TOKEN_AUTH",
    ClientId: getClientId(),
    AuthParameters: {
      REFRESH_TOKEN: refreshToken,
    },
  };

  const command = new InitiateAuthCommand(params);
  const response = await cognito.send(command);

  if (!response.AuthenticationResult) {
    throw new Error("Token refresh failed - no result returned");
  }

  return {
    accessToken: response.AuthenticationResult.AccessToken || "",
    idToken: response.AuthenticationResult.IdToken || "",
    expiresIn: response.AuthenticationResult.ExpiresIn || 3600,
  };
}

/**
 * Get user info from access token (requires aws.cognito.signin.user.admin scope)
 */
export async function getUserFromToken(accessToken: string): Promise<CognitoUser> {
  const command = new GetUserCommand({
    AccessToken: accessToken,
  });

  const response = await cognito.send(command);

  const getAttr = (name: string) => response.UserAttributes?.find((a) => a.Name === name)?.Value;

  return {
    sub: getAttr("sub") || "",
    email: getAttr("email") || "",
    name: getAttr("name"),
    emailVerified: getAttr("email_verified") === "true",
  };
}

/**
 * Get user info from ID token (for social logins - doesn't require admin scope)
 * The ID token is a JWT that contains user claims
 */
export function getUserFromIdToken(idToken: string): CognitoUser {
  // Decode the JWT payload (middle part)
  const parts = idToken.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid ID token format");
  }

  const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));

  return {
    sub: payload.sub || "",
    email: payload.email || "",
    name: payload.name || payload["cognito:username"],
    emailVerified: payload.email_verified === true || payload.email_verified === "true",
  };
}

/**
 * Get user by email from user pool (admin operation)
 */
export async function adminGetUser(email: string): Promise<CognitoUser | null> {
  try {
    const command = new AdminGetUserCommand({
      UserPoolId: getUserPoolId(),
      Username: email,
    });

    const response = await cognito.send(command);

    const getAttr = (name: string) => response.UserAttributes?.find((a) => a.Name === name)?.Value;

    return {
      sub: getAttr("sub") || "",
      email: getAttr("email") || "",
      name: getAttr("name"),
      emailVerified: getAttr("email_verified") === "true",
    };
  } catch (error) {
    if ((error as Error).name === "UserNotFoundException") {
      return null;
    }
    throw error;
  }
}

/**
 * Global sign out - invalidates all refresh tokens
 */
export async function globalSignOut(accessToken: string): Promise<void> {
  const command = new GlobalSignOutCommand({
    AccessToken: accessToken,
  });

  await cognito.send(command);
}

/**
 * Generate OAuth URL for social login
 */
export function getSocialLoginUrl(
  provider: "Google" | "Facebook",
  redirectUri: string,
  state: string
): string {
  const cognitoDomain = process.env.COGNITO_DOMAIN || "";
  const clientId = getClientId();

  const params = new URLSearchParams({
    identity_provider: provider,
    redirect_uri: redirectUri,
    response_type: "code",
    client_id: clientId,
    scope: "email openid profile",
    state: state,
  });

  return `https://${cognitoDomain}/oauth2/authorize?${params.toString()}`;
}

/**
 * Exchange OAuth authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<CognitoTokens> {
  const cognitoDomain = process.env.COGNITO_DOMAIN || "";
  const clientId = getClientId();

  const response = await fetch(`https://${cognitoDomain}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      code: code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    id_token: string;
    refresh_token: string;
    expires_in: number;
  };

  return {
    accessToken: data.access_token,
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}
