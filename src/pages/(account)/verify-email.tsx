// src/app/(pages)/(account)/verify-email/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "~/components/shadcn/alert";
import { Button } from "~/components/shadcn/button";

export default function VerifyEmail() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        return;
      }

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Error verifying email:", error);
        setStatus("error");
      }
    };

    verifyEmail();
  }, [token]);

  const resendVerification = async () => {
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });

      if (response.ok) {
        alert("Verification email sent. Please check your inbox.");
      } else {
        throw new Error("Failed to resend verification email");
      }
    } catch (error) {
      console.error("Error resending verification:", error);
      alert("Failed to resend verification email. Please try again later.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Email Verification</h1>
      {status === "loading" && <p>Verifying your email...</p>}
      {status === "success" && (
        <Alert>
          <AlertDescription>
            Your email has been successfully verified. You can now log in to
            your account.
          </AlertDescription>
        </Alert>
      )}
      {status === "error" && (
        <div>
          <Alert variant="destructive">
            <AlertDescription>
              Failed to verify your email. The verification link may be invalid
              or expired.
            </AlertDescription>
          </Alert>
          <Button onClick={resendVerification} className="mt-4">
            Resend Verification Email
          </Button>
        </div>
      )}
    </div>
  );
}
