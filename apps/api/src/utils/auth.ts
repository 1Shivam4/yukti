import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

// Use getter functions to ensure env vars are read after dotenv loads
const getIssuer = () => process.env.COGNITO_ISSUER || "";
const getUserPoolId = () => process.env.COGNITO_USER_POOL_ID || "";
const getRegion = () => process.env.AWS_REGION || "us-east-1";

// Lazy-initialized JWKS client
let client: jwksClient.JwksClient | null = null;

function getJwksClient(): jwksClient.JwksClient {
  if (!client) {
    client = jwksClient({
      jwksUri: `https://cognito-idp.${getRegion()}.amazonaws.com/${getUserPoolId()}/.well-known/jwks.json`,
      cache: true,
      rateLimit: true,
    });
  }
  return client;
}

/**
 * Get signing key from Cognito JWKS
 */
function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  getJwksClient().getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

/**
 * Verify Cognito JWT token
 */
export async function verifyToken(token: string): Promise<jwt.JwtPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        issuer: getIssuer(),
        algorithms: ["RS256"],
      },
      (err, decoded) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(decoded as jwt.JwtPayload);
      }
    );
  });
}

/**
 * Extract user ID from Cognito token
 */
export function getUserIdFromToken(decoded: jwt.JwtPayload): string {
  return decoded.sub || decoded["cognito:username"] || "";
}

/**
 * Lambda authorizer helper - validates JWT and returns user context
 */
export async function authorizeRequest(authHeader: string | undefined): Promise<{
  isAuthorized: boolean;
  userId?: string;
  email?: string;
  error?: string;
}> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      isAuthorized: false,
      error: "Missing or invalid authorization header",
    };
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  try {
    const decoded = await verifyToken(token);
    const userId = getUserIdFromToken(decoded);
    const email = decoded.email as string;

    return {
      isAuthorized: true,
      userId,
      email,
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    return {
      isAuthorized: false,
      error: error instanceof Error ? error.message : "Invalid token",
    };
  }
}
