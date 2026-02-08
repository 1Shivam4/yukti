/**
 * Uploads Lambda Handler
 * Generates pre-signed URLs for S3 uploads
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { authorizeRequest } from "../../utils/auth";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface PresignedUrlRequest {
  filename: string;
  contentType: string;
  fileSize: number;
}

function createResponse(statusCode: number, body: object): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
    body: JSON.stringify(body),
  };
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const { httpMethod, path } = event;

  // Handle CORS preflight
  if (httpMethod === "OPTIONS") {
    return createResponse(200, { ok: true });
  }

  // Authorize the request
  const authHeader = event.headers?.Authorization || event.headers?.authorization;
  const auth = await authorizeRequest(authHeader);

  if (!auth.isAuthorized || !auth.userId) {
    return createResponse(401, { error: "Unauthorized" });
  }

  // POST /uploads/presigned - Generate pre-signed URL
  if (httpMethod === "POST" && path.endsWith("/presigned")) {
    try {
      if (!BUCKET_NAME) {
        console.error("S3_BUCKET_NAME not configured");
        return createResponse(500, { error: "Storage not configured" });
      }

      const body: PresignedUrlRequest = JSON.parse(event.body || "{}");
      const { filename, contentType, fileSize } = body;

      // Validate content type
      if (!ALLOWED_TYPES.includes(contentType)) {
        return createResponse(400, {
          error: "InvalidFileType",
          message: `File type must be one of: ${ALLOWED_TYPES.join(", ")}`,
        });
      }

      // Validate file size
      if (fileSize > MAX_FILE_SIZE) {
        return createResponse(400, {
          error: "FileTooLarge",
          message: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        });
      }

      // Generate unique key for the file
      const ext = filename.split(".").pop() || "jpg";
      const key = `profile-photos/${auth.userId}/${uuidv4()}.${ext}`;

      // Create pre-signed URL
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
      });

      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 min
      const imageUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;

      return createResponse(200, {
        uploadUrl,
        imageUrl,
        key,
      });
    } catch (error) {
      console.error("Error generating presigned URL:", error);
      return createResponse(500, { error: "Failed to generate upload URL" });
    }
  }

  // DELETE /uploads/:key - Delete an uploaded file (optional, for cleanup)
  if (httpMethod === "DELETE") {
    // TODO: Implement delete functionality if needed
    return createResponse(501, { error: "Not implemented" });
  }

  return createResponse(404, { error: "Not found" });
}
