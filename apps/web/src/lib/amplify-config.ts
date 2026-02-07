import { Amplify } from "aws-amplify";

export const configureAmplify = () => {
  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "";
  const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "";
  const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || "";
  const redirectUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : "http://localhost:3000/auth/callback";

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        signUpVerificationMethod: "code",
        loginWith: {
          email: true,
          // OAuth configuration for social logins
          oauth: cognitoDomain
            ? {
                domain: cognitoDomain,
                scopes: ["email", "openid", "profile"],
                redirectSignIn: [redirectUrl],
                redirectSignOut: [
                  typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
                ],
                responseType: "code",
                providers: ["Google", "Facebook"] as const,
              }
            : undefined,
        },
      },
    },
  });
};

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
