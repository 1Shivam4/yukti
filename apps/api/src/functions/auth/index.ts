import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { prisma } from "@yukti/database";
import {
  handleSignUp,
  handleVerify,
  handleSignIn,
  handleRefreshToken,
  handleSignOut,
  handleGetSessions,
  handleGetSocialLoginUrl,
  handleSocialCallback,
  handleGetMe,
} from "./handlers";

// CORS headers
const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Device-Id, X-Device-Name, X-Device-Type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

/**
 * Handle CORS preflight requests
 */
function handleOptions(): APIGatewayProxyResult {
  return {
    statusCode: 204,
    headers: corsHeaders,
    body: "",
  };
}

/**
 * Legacy webhook handler for Cognito post-confirmation trigger
 * Creates user in PostgreSQL after successful Cognito signup
 */
export const cognitoWebhook = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { cognitoId, email, name } = body;

    if (!cognitoId || !email) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Missing required fields: cognitoId, email" }),
      };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { cognitoId },
    });

    if (existingUser) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "User already exists",
          userId: existingUser.id,
        }),
      };
    }

    // Create user in PostgreSQL
    const user = await prisma.user.create({
      data: {
        cognitoId,
        email,
        name: name || email.split("@")[0],
        plan: "FREE",
      },
    });

    console.log("Created user:", user.id);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "User created successfully",
        userId: user.id,
      }),
    };
  } catch (error) {
    console.error("Error creating user:", error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Failed to create user",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};

/**
 * Main auth handler - routes to appropriate function
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("Auth function called:", event.httpMethod, event.path);

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return handleOptions();
  }

  const path = event.path.toLowerCase();
  const method = event.httpMethod;

  // Route based on path and method
  try {
    // POST /auth/signup - Register new user
    if (path.endsWith("/signup") && method === "POST") {
      return handleSignUp(event);
    }

    // POST /auth/verify - Verify email with code
    if (path.endsWith("/verify") && method === "POST") {
      return handleVerify(event);
    }

    // POST /auth/signin - Sign in with email/password
    if (path.endsWith("/signin") && method === "POST") {
      return handleSignIn(event);
    }

    // POST /auth/refresh - Refresh tokens
    if (path.endsWith("/refresh") && method === "POST") {
      return handleRefreshToken(event);
    }

    // POST /auth/signout - Sign out (current or all devices)
    if (path.endsWith("/signout") && method === "POST") {
      return handleSignOut(event);
    }

    // GET /auth/sessions - Get active sessions
    if (path.endsWith("/sessions") && method === "GET") {
      return handleGetSessions(event);
    }

    // GET /auth/social/:provider - Get social login URL
    if (path.includes("/social/") && method === "GET") {
      return handleGetSocialLoginUrl(event);
    }

    // GET /auth/callback - Handle Cognito OAuth redirect (browser redirect)
    if (path.endsWith("/callback") && method === "GET") {
      const code = event.queryStringParameters?.code;
      const error = event.queryStringParameters?.error;
      const errorDescription = event.queryStringParameters?.error_description;

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

      // If there's an error from Cognito, redirect to frontend with error
      if (error) {
        const errorParams = new URLSearchParams({
          error: "OAuthError",
          message: errorDescription || error,
        });
        return {
          statusCode: 302,
          headers: {
            ...corsHeaders,
            Location: `${frontendUrl}/auth/callback?${errorParams.toString()}`,
          },
          body: "",
        };
      }

      // If we have a code, process it and redirect with tokens
      if (code) {
        try {
          // Import needed functions inline to avoid circular deps
          const { exchangeCodeForTokens, getUserFromIdToken } = await import("../../utils/cognito");
          const { createSession, generateDeviceId } = await import("../../utils/session");

          const callbackUri =
            process.env.OAUTH_REDIRECT_URI || "http://localhost:9000/auth/callback";

          // Exchange code for tokens
          const tokens = await exchangeCodeForTokens(code, callbackUri);

          // Get user from ID token
          const cognitoUser = getUserFromIdToken(tokens.idToken);

          // Find or create user in database
          let user = await prisma.user.findUnique({
            where: { cognitoId: cognitoUser.sub },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                cognitoId: cognitoUser.sub,
                email: cognitoUser.email,
                name: cognitoUser.name || cognitoUser.email.split("@")[0],
                plan: "FREE",
              },
            });
          }

          // Create device session
          const deviceId = generateDeviceId();
          await createSession(user.id, tokens.refreshToken, {
            deviceId,
            deviceName: "Web Browser",
            deviceType: "web",
          });

          // Encode auth data for URL fragment (only essential data)
          const authData = {
            accessToken: tokens.accessToken,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              plan: user.plan,
            },
          };

          // Base64 encode the auth data for safe URL transmission
          const encodedData = Buffer.from(JSON.stringify(authData)).toString("base64url");

          // Redirect to frontend callback page with data in fragment
          return {
            statusCode: 302,
            headers: {
              ...corsHeaders,
              Location: `${frontendUrl}/auth/callback#data=${encodedData}`,
            },
            body: "",
          };
        } catch (err) {
          console.error("OAuth callback error:", err);
          const errorParams = new URLSearchParams({
            error: "AuthError",
            message: err instanceof Error ? err.message : "Authentication failed",
          });
          return {
            statusCode: 302,
            headers: {
              ...corsHeaders,
              Location: `${frontendUrl}/auth/callback?${errorParams.toString()}`,
            },
            body: "",
          };
        }
      }

      return {
        statusCode: 302,
        headers: {
          ...corsHeaders,
          Location: `${frontendUrl}/auth/callback?error=MissingCode&message=Authorization+code+is+required`,
        },
        body: "",
      };
    }

    // POST /auth/callback - Handle social login callback (API call)
    if (path.endsWith("/callback") && method === "POST") {
      return handleSocialCallback(event);
    }

    // GET /auth/me - Get current user info
    if (path.endsWith("/me") && method === "GET") {
      return handleGetMe(event);
    }

    // Legacy: POST /auth/cognito-webhook
    if (path.includes("/cognito-webhook") && method === "POST") {
      return cognitoWebhook(event);
    }

    // Not found
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "NotFound",
        message: `Route not found: ${method} ${path}`,
        availableRoutes: [
          "POST /auth/signup",
          "POST /auth/verify",
          "POST /auth/signin",
          "POST /auth/refresh",
          "POST /auth/signout",
          "GET /auth/sessions",
          "GET /auth/social/:provider",
          "POST /auth/callback",
          "GET /auth/me",
        ],
      }),
    };
  } catch (error) {
    console.error("Auth handler error:", error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "InternalError",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      }),
    };
  }
};
