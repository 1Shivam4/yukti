import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load environment variables from root .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, "../../..", ".env") });

import express, { Request, Response } from "express";
import cors from "cors";
import { handler as authHandler } from "./functions/auth/index";
import { handler as resumesHandler } from "./functions/resumes/index";
import { handler as aiHandler } from "./functions/ai/index";
import { handler as renderHandler } from "./functions/render/index";
import { handler as uploadsHandler } from "./functions/uploads/index";
import type { APIGatewayProxyEvent } from "aws-lambda";

const app = express();

// CORS middleware - allow all origins in development
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Device-Id",
      "X-Device-Name",
      "X-Device-Type",
    ],
  })
);

app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "yukti-api" });
});

/**
 * Extract path parameters from URL path
 * Handles patterns like /resumes/:id, /ai/:action, etc.
 */
function extractPathParams(path: string): Record<string, string> | null {
  const params: Record<string, string> = {};

  // Match /resumes/:id pattern
  const resumeMatch = path.match(/^\/resumes\/([^/]+)$/);
  if (resumeMatch) {
    params.id = resumeMatch[1];
    return params;
  }

  // Match /ai/:action pattern
  const aiMatch = path.match(/^\/ai\/([^/]+)$/);
  if (aiMatch) {
    params.action = aiMatch[1];
    return params;
  }

  // Match /render/:format pattern
  const renderMatch = path.match(/^\/render\/([^/]+)$/);
  if (renderMatch) {
    params.format = renderMatch[1];
    return params;
  }

  // Match /auth/social/:provider pattern
  const socialMatch = path.match(/^\/auth\/social\/([^/]+)$/);
  if (socialMatch) {
    params.provider = socialMatch[1];
    return params;
  }

  return Object.keys(params).length > 0 ? params : null;
}

/**
 * Convert Express request to Lambda event format
 */
function createLambdaEvent(req: Request): APIGatewayProxyEvent {
  return {
    httpMethod: req.method,
    path: req.path,
    headers: req.headers as Record<string, string>,
    queryStringParameters: req.query as Record<string, string>,
    body: JSON.stringify(req.body),
    isBase64Encoded: false,
    pathParameters: extractPathParams(req.path),
    stageVariables: null,
    resource: req.path,
    requestContext: {
      accountId: "",
      apiId: "",
      authorizer: {},
      httpMethod: req.method,
      identity: {
        sourceIp: req.ip || "",
        userAgent: req.headers["user-agent"] || "",
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        clientCert: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        user: null,
        userArn: null,
      },
      path: req.path,
      protocol: "HTTP/1.1",
      requestId: "",
      requestTimeEpoch: Date.now(),
      resourceId: "",
      resourcePath: req.path,
      stage: "dev",
    },
    multiValueHeaders: {},
    multiValueQueryStringParameters: null,
  };
}

/**
 * Route handler wrapper for Lambda handlers
 */
function lambdaWrapper(
  handler: (
    event: APIGatewayProxyEvent
  ) => Promise<{ statusCode: number; headers?: Record<string, unknown>; body: string }>
) {
  return async (req: Request, res: Response) => {
    try {
      const event = createLambdaEvent(req);
      const result = await handler(event);

      // Set headers from Lambda response (excluding CORS - already handled by middleware)
      if (result.headers) {
        Object.entries(result.headers).forEach(([key, value]) => {
          if (!key.toLowerCase().startsWith("access-control") && typeof value === "string") {
            res.setHeader(key, value);
          }
        });
      }

      res.status(result.statusCode).send(result.body);
    } catch (error) {
      console.error("Handler error:", error);
      res.status(500).json({
        error: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}

// Auth routes
app.all("/auth/*", lambdaWrapper(authHandler));

// Resume routes
app.all("/resumes/*", lambdaWrapper(resumesHandler));
app.all("/resumes", lambdaWrapper(resumesHandler));

// AI routes
app.all("/ai/*", lambdaWrapper(aiHandler));

// Render routes
app.all("/render/*", lambdaWrapper(renderHandler));

// Upload routes
app.all("/uploads/*", lambdaWrapper(uploadsHandler));

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
  console.log(`🚀 API server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Auth:   http://localhost:${PORT}/auth/*`);
});

export default app;
