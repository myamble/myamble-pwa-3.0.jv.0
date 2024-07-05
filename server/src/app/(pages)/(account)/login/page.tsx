// src/app/(pages)/(account)/login/page.tsx
"use client";

import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import CustomForm from "@/components/Form";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function Login() {
  const { login } = useAuth();
  const [error, setError] = useState("");

  const handleLogin = async (data) => {
    try {
      await login(data);
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="mx-auto mt-8 max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Login</h1>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <CustomForm
        fields={[
          { name: "email", label: "Email", type: "email" },
          { name: "password", label: "Password", type: "password" },
        ]}
        onSubmit={handleLogin}
        validationSchema={loginSchema}
      />
    </div>
  );
}
