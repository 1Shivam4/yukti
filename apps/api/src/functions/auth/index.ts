import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { prisma } from "@yukti/database";

const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || "us-east-1",
});

/**
 * Webhook handler for Cognito post-confirmation trigger
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
        body: JSON.stringify({ error: "Missing required fields: cognitoId, email" }),
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
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "User created successfully",
        userId: user.id,
      }),
    };
  } catch (error) {
    console.error("Error creating user:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
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
  console.log("Auth function called:", event.path);

  // Route based on path
  if (event.path.includes("/cognito-webhook") && event.httpMethod === "POST") {
    return cognitoWebhook(event);
  }

  // Default response
  return {
    statusCode: 404,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      error: "Not found",
      path: event.path,
    }),
  };
};
