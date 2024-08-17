import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import CustomForm from "~/components/Form";
import { Alert, AlertDescription } from "~/components/shadcn/alert";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function ResetPasswordForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleResetPassword = async (data) => {
    if (!token) {
      setStatus("error");
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });

      if (response.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setStatus("error");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Reset Password</h1>
      {status === "idle" && (
        <CustomForm
          fields={[
            { name: "password", label: "New Password", type: "password" },
            {
              name: "confirmPassword",
              label: "Confirm New Password",
              type: "password",
            },
          ]}
          onSubmit={handleResetPassword}
          validationSchema={resetPasswordSchema}
        />
      )}
      {status === "success" && (
        <Alert>
          <AlertDescription>
            Your password has been successfully reset. You can now log in with
            your new password.
          </AlertDescription>
        </Alert>
      )}
      {status === "error" && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to reset your password. The reset link may be invalid or
            expired. Please request a new password reset.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
