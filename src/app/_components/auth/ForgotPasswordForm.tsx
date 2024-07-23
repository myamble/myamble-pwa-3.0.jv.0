import { useState } from "react";
import { z } from "zod";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Alert, AlertDescription } from "~/app/_components/ui/alert";
import { api } from "~/trpc/react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const forgotPasswordMutation = api.auth.forgotPassword.useMutation({
    onSuccess: () => setStatus("success"),
    onError: () => setStatus("error"),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setStatus("error");
      return;
    }
    forgotPasswordMutation.mutate({ email });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Forgot Password</h1>
      {status === "idle" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit">Reset Password</Button>
        </form>
      )}
      {status === "success" && (
        <Alert>
          <AlertDescription>
            If an account exists for that email, we have sent password reset
            instructions.
          </AlertDescription>
        </Alert>
      )}
      {status === "error" && (
        <Alert variant="destructive">
          <AlertDescription>
            An error occurred. Please try again later.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
