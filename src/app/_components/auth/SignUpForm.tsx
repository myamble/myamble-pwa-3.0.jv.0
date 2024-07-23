import { useAuth } from "~/app/_hooks/useAuth";
import CustomForm from "~/app/_components/Form";
import { useState } from "react";
import { Alert, AlertDescription } from "~/app/_components/ui/alert";
import { z } from "zod";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["SOCIAL_WORKER", "PARTICIPANT"], {
    required_error: "Please select a role",
  }),
});

export default function SignUpForm() {
  const { signUp } = useAuth();
  const [error, setError] = useState("");

  const handleSignUp = async (data) => {
    try {
      await signUp(data);
    } catch (err) {
      setError("An error occurred during sign up. Please try again.");
    }
  };

  return (
    <div className="mx-auto mt-8 max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Sign Up</h1>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <CustomForm
        fields={[
          { name: "name", label: "Name", type: "text" },
          { name: "email", label: "Email", type: "email" },
          { name: "password", label: "Password", type: "password" },
          {
            name: "role",
            label: "Role",
            type: "select",
            options: [
              { value: "SOCIAL_WORKER", label: "Social Worker" },
              { value: "PARTICIPANT", label: "Participant" },
            ],
          },
        ]}
        onSubmit={handleSignUp}
        validationSchema={signUpSchema}
      />
    </div>
  );
}
