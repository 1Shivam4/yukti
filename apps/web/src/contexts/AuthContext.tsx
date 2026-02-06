"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  getCurrentUser,
  signIn,
  signOut,
  signUp,
  type SignInInput,
  type SignUpInput,
} from "aws-amplify/auth";
import { configureAmplify } from "@/lib/amplify-config";

configureAmplify();

interface User {
  userId: string;
  email: string;
  name?: string;
  plan?: "FREE" | "PRO";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (input: SignInInput) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const currentUser = await getCurrentUser();
      setUser({
        userId: currentUser.userId,
        email: currentUser.signInDetails?.loginId || "",
        name: currentUser.username,
      });
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  const handleSignIn = async (input: SignInInput) => {
    await signIn(input);
    await checkUser();
  };

  const handleSignUp = async (input: SignUpInput) => {
    await signUp(input);
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
