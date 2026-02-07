import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { prisma } from "@yukti/database";
import {
  signUpUser,
  confirmSignUp,
  signInUser,
  refreshCognitoTokens,
  globalSignOut,
  getUserFromToken,
  getSocialLoginUrl,
  exchangeCodeForTokens,
} from "../../utils/cognito";
import {
  createSession,
  validateSession,
  updateSession,
  revokeSession,
  revokeAllSessions,
  getUserSessions,
  generateDeviceId,
  type DeviceInfo,
} from "../../utils/session";
import { authorizeRequest } from "../../utils/auth";

// CORS headers
const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Device-Id, X-Device-Name, X-Device-Type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

/**
 * Extract device info from request headers
 */
function getDeviceInfo(event: APIGatewayProxyEvent): DeviceInfo {
  return {
    deviceId: event.headers["x-device-id"] || event.headers["X-Device-Id"],
    deviceName: event.headers["x-device-name"] || event.headers["X-Device-Name"],
    deviceType: event.headers["x-device-type"] || event.headers["X-Device-Type"],
    ipAddress: event.requestContext?.identity?.sourceIp || event.headers["X-Forwarded-For"],
    userAgent: event.headers["user-agent"] || event.headers["User-Agent"],
  };
}

/**
 * Parse request body safely
 */
function parseBody(event: APIGatewayProxyEvent): Record<string, unknown> {
  try {
    return JSON.parse(event.body || "{}");
  } catch {
    return {};
  }
}

/**
 * Handle user signup
 * POST /auth/signup
 */
export async function handleSignUp(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body = parseBody(event);
  const { email, password, name } = body as {
    email?: string;
    password?: string;
    name?: string;
  };

  if (!email || !password) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "ValidationError",
        message: "Email and password are required",
      }),
    };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "ValidationError",
        message: "Invalid email format",
      }),
    };
  }

  // Validate password strength
  if (password.length < 8) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "ValidationError",
        message: "Password must be at least 8 characters long",
      }),
    };
  }

  try {
    const result = await signUpUser(email, password, name || email.split("@")[0]);

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "User registered successfully. Please check your email for verification code.",
        userSub: result.userSub,
        isConfirmed: result.isConfirmed,
      }),
    };
  } catch (error) {
    console.error("Signup error:", error);

    const errorMessage = error instanceof Error ? error.message : "Signup failed";
    const errorName = (error as { name?: string })?.name || "SignupError";

    // Handle specific Cognito errors
    if (errorName === "UsernameExistsException") {
      return {
        statusCode: 409,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "UserExists",
          message: "An account with this email already exists",
        }),
      };
    }

    if (errorName === "InvalidPasswordException") {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "InvalidPassword",
          message:
            "Password does not meet requirements. Must contain uppercase, lowercase, numbers, and special characters.",
        }),
      };
    }

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "SignupError",
        message: errorMessage,
      }),
    };
  }
}

/**
 * Handle email verification
 * POST /auth/verify
 */
export async function handleVerify(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body = parseBody(event);
  const { email, code } = body as { email?: string; code?: string };

  if (!email || !code) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "ValidationError",
        message: "Email and verification code are required",
      }),
    };
  }

  try {
    await confirmSignUp(email, code);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Email verified successfully. You can now sign in.",
      }),
    };
  } catch (error) {
    console.error("Verification error:", error);

    const errorName = (error as { name?: string })?.name || "VerifyError";

    if (errorName === "CodeMismatchException") {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "InvalidCode",
          message: "Invalid verification code",
        }),
      };
    }

    if (errorName === "ExpiredCodeException") {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "ExpiredCode",
          message: "Verification code has expired. Please request a new one.",
        }),
      };
    }

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "VerifyError",
        message: error instanceof Error ? error.message : "Verification failed",
      }),
    };
  }
}

/**
 * Handle user signin
 * POST /auth/signin
 */
export async function handleSignIn(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body = parseBody(event);
  const { email, password } = body as { email?: string; password?: string };

  if (!email || !password) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "ValidationError",
        message: "Email and password are required",
      }),
    };
  }

  try {
    // Authenticate with Cognito
    const tokens = await signInUser(email, password);

    // Get user from Cognito
    const cognitoUser = await getUserFromToken(tokens.accessToken);

    // Find or create user in database
    let user = await prisma.user.findUnique({
      where: { cognitoId: cognitoUser.sub },
    });

    if (!user) {
      // Create user if not exists (first-time login after signup)
      user = await prisma.user.create({
        data: {
          cognitoId: cognitoUser.sub,
          email: cognitoUser.email,
          name: cognitoUser.name || email.split("@")[0],
          plan: "FREE",
        },
      });
    }

    // Create device session
    const deviceInfo = getDeviceInfo(event);
    const { session, removedSessions } = await createSession(
      user.id,
      tokens.refreshToken,
      deviceInfo
    );

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Signed in successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
        },
        tokens: {
          accessToken: tokens.accessToken,
          idToken: tokens.idToken,
          expiresIn: tokens.expiresIn,
        },
        session: {
          deviceId: session.deviceId,
          deviceName: session.deviceName,
        },
        // Notify if devices were removed due to limit
        removedDevices:
          removedSessions.length > 0
            ? removedSessions.map((s) => ({
                deviceName: s.deviceName,
                lastActive: s.lastActive,
              }))
            : undefined,
      }),
    };
  } catch (error) {
    console.error("Signin error:", error);

    const errorName = (error as { name?: string })?.name || "SigninError";

    if (errorName === "NotAuthorizedException") {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "InvalidCredentials",
          message: "Incorrect email or password",
        }),
      };
    }

    if (errorName === "UserNotConfirmedException") {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "UserNotConfirmed",
          message: "Please verify your email before signing in",
        }),
      };
    }

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "SigninError",
        message: error instanceof Error ? error.message : "Signin failed",
      }),
    };
  }
}

/**
 * Handle token refresh
 * POST /auth/refresh
 */
export async function handleRefreshToken(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const body = parseBody(event);
  const { refreshToken } = body as { refreshToken?: string };

  if (!refreshToken) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "ValidationError",
        message: "Refresh token is required",
      }),
    };
  }

  try {
    // Validate session
    const sessionValidation = await validateSession(refreshToken);

    if (!sessionValidation.valid || !sessionValidation.session) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "InvalidSession",
          message: "Session expired or invalid. Please sign in again.",
        }),
      };
    }

    // Refresh tokens with Cognito
    const newTokens = await refreshCognitoTokens(refreshToken);

    // Update session last active time
    await updateSession(sessionValidation.session.id, refreshToken);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Tokens refreshed successfully",
        tokens: {
          accessToken: newTokens.accessToken,
          idToken: newTokens.idToken,
          expiresIn: newTokens.expiresIn,
        },
      }),
    };
  } catch (error) {
    console.error("Token refresh error:", error);

    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "RefreshError",
        message: "Failed to refresh tokens. Please sign in again.",
      }),
    };
  }
}

/**
 * Handle user signout
 * POST /auth/signout
 */
export async function handleSignOut(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const auth = await authorizeRequest(event.headers.Authorization || event.headers.authorization);

  if (!auth.isAuthorized || !auth.userId) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Unauthorized",
        message: "Invalid or expired token",
      }),
    };
  }

  const body = parseBody(event);
  const { allDevices, deviceId } = body as { allDevices?: boolean; deviceId?: string };

  try {
    // Get user
    const user = await prisma.user.findFirst({
      where: { cognitoId: auth.userId },
    });

    if (!user) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "UserNotFound",
          message: "User not found",
        }),
      };
    }

    if (allDevices) {
      // Revoke all sessions
      const count = await revokeAllSessions(user.id);

      // Global signout from Cognito
      const accessToken = (event.headers.Authorization || event.headers.authorization)?.replace(
        "Bearer ",
        ""
      );
      if (accessToken) {
        await globalSignOut(accessToken);
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          message: `Signed out from all ${count} devices`,
        }),
      };
    }

    if (deviceId) {
      // Revoke specific device session
      const session = await prisma.userSession.findFirst({
        where: { userId: user.id, deviceId, isActive: true },
      });

      if (!session) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({
            error: "SessionNotFound",
            message: "Session not found",
          }),
        };
      }

      await revokeSession(session.id);

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Signed out from device",
          deviceName: session.deviceName,
        }),
      };
    }

    // Revoke current device session
    const currentDeviceId = event.headers["x-device-id"] || event.headers["X-Device-Id"];
    if (currentDeviceId) {
      const session = await prisma.userSession.findFirst({
        where: { userId: user.id, deviceId: currentDeviceId, isActive: true },
      });

      if (session) {
        await revokeSession(session.id);
      }
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Signed out successfully",
      }),
    };
  } catch (error) {
    console.error("Signout error:", error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "SignoutError",
        message: error instanceof Error ? error.message : "Signout failed",
      }),
    };
  }
}

/**
 * Get active sessions
 * GET /auth/sessions
 */
export async function handleGetSessions(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const auth = await authorizeRequest(event.headers.Authorization || event.headers.authorization);

  if (!auth.isAuthorized || !auth.userId) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Unauthorized",
        message: "Invalid or expired token",
      }),
    };
  }

  try {
    const user = await prisma.user.findFirst({
      where: { cognitoId: auth.userId },
    });

    if (!user) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "UserNotFound",
          message: "User not found",
        }),
      };
    }

    const sessions = await getUserSessions(user.id);
    const currentDeviceId = event.headers["x-device-id"] || event.headers["X-Device-Id"];

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        sessions: sessions.map((s) => ({
          id: s.id,
          deviceId: s.deviceId,
          deviceName: s.deviceName,
          deviceType: s.deviceType,
          lastActive: s.lastActive,
          createdAt: s.createdAt,
          isCurrent: s.deviceId === currentDeviceId,
        })),
      }),
    };
  } catch (error) {
    console.error("Get sessions error:", error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "GetSessionsError",
        message: error instanceof Error ? error.message : "Failed to get sessions",
      }),
    };
  }
}

/**
 * Get social login URL
 * GET /auth/social/:provider
 */
export async function handleGetSocialLoginUrl(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const pathParts = event.path.split("/");
  const provider = pathParts[pathParts.length - 1]?.toLowerCase();

  if (provider !== "google" && provider !== "facebook") {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "InvalidProvider",
        message: "Provider must be 'google' or 'facebook'",
      }),
    };
  }

  const redirectUri =
    event.queryStringParameters?.redirect_uri ||
    process.env.OAUTH_REDIRECT_URI ||
    "http://localhost:3000/auth/callback";

  // Generate state for CSRF protection
  const state = generateDeviceId();

  const providerName = provider === "google" ? "Google" : "Facebook";
  const url = getSocialLoginUrl(providerName, redirectUri, state);

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      url,
      state,
    }),
  };
}

/**
 * Handle social login callback
 * POST /auth/callback
 */
export async function handleSocialCallback(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const body = parseBody(event);
  const { code, state, redirectUri } = body as {
    code?: string;
    state?: string;
    redirectUri?: string;
  };

  if (!code) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "ValidationError",
        message: "Authorization code is required",
      }),
    };
  }

  try {
    const callbackUri =
      redirectUri || process.env.OAUTH_REDIRECT_URI || "http://localhost:3000/auth/callback";

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, callbackUri);

    // Get user from Cognito
    const cognitoUser = await getUserFromToken(tokens.accessToken);

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
    const deviceInfo = getDeviceInfo(event);
    const { session, removedSessions } = await createSession(
      user.id,
      tokens.refreshToken,
      deviceInfo
    );

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Signed in successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
        },
        tokens: {
          accessToken: tokens.accessToken,
          idToken: tokens.idToken,
          expiresIn: tokens.expiresIn,
        },
        session: {
          deviceId: session.deviceId,
          deviceName: session.deviceName,
        },
        removedDevices:
          removedSessions.length > 0
            ? removedSessions.map((s) => ({
                deviceName: s.deviceName,
                lastActive: s.lastActive,
              }))
            : undefined,
      }),
    };
  } catch (error) {
    console.error("Social callback error:", error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "SocialAuthError",
        message: error instanceof Error ? error.message : "Social authentication failed",
      }),
    };
  }
}

/**
 * Get current user info
 * GET /auth/me
 */
export async function handleGetMe(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const auth = await authorizeRequest(event.headers.Authorization || event.headers.authorization);

  if (!auth.isAuthorized || !auth.userId) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Unauthorized",
        message: "Invalid or expired token",
      }),
    };
  }

  try {
    const user = await prisma.user.findFirst({
      where: { cognitoId: auth.userId },
      include: {
        _count: {
          select: { resumes: true, sessions: true },
        },
      },
    });

    if (!user) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "UserNotFound",
          message: "User not found",
        }),
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          createdAt: user.createdAt,
          stats: {
            resumeCount: user._count.resumes,
            activeDevices: user._count.sessions,
          },
        },
      }),
    };
  } catch (error) {
    console.error("Get me error:", error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "GetUserError",
        message: error instanceof Error ? error.message : "Failed to get user",
      }),
    };
  }
}
