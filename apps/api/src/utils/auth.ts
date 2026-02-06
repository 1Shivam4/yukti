import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const COGNITO_ISSUER = process.env.COGNITO_ISSUER || "";
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || "";
const AWS_REGION = process.env.AWS_REGION || "us-east-1";

// JWKS client to fetch Cognito public keys
const client = jwksClient({
  jwksUri: `https://cognito-idp.${AWS_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
});

/**
 * Get signing key from Cognito JWKS
 */
function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  client.getSigningKey(header.kid, (err, key) => {
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
        issuer: COGNITO_ISSUER,
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
