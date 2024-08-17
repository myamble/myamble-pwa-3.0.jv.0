"use client";
// hooks/useAuth.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { User } from "next-auth";
// import { getServerAuthSession } from "~/server/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const userData = (await response.json()) as User;
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setUser(null);
      }
    };

    checkAuth().catch((error) => console.error("Error in checkAuth:", error));
  }, []);

  // Ensure all router usages are guarded by a client-side check
  const login = async (credentials: { email: string; password: string }) => {
    if (!router) return;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const userData = (await response.json()) as User;
        setUser(userData);
        router.push("/dashboard");
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    if (!router) return;

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const signUp = async (userData: { email: string; password: string }) => {
    if (!router) return;

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const newUser = (await response.json()) as User;
        setUser(newUser);
        router.push("/dashboard");
      } else {
        throw new Error("Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const updateUser = async (userData: { email: string; password: string }) => {
    if (!router) return;

    try {
      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const updatedUser = (await response.json()) as User;
        setUser(updatedUser);
      } else {
        throw new Error("User update failed");
      }
    } catch (error) {
      console.error("User update error:", error);
      throw error;
    }
  };

  return { user, login, logout, signUp, updateUser };
}
