// src/app/(pages)/(account)/account/page.tsx
"use client";

import { z } from "zod";
import { useAuth } from "~/hooks/useAuth";
import CustomForm from "~/app/_components/Form";
import { useState } from "react";
import { Alert, AlertDescription } from "~/components/ui/alert";

const accountSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

export default function Account() {
  const { user, updateUser } = useAuth();
  const [message, setMessage] = useState({ type: "", content: "" });

  const handleUpdateProfile = async (data) => {
    try {
      await updateUser(data);
      setMessage({ type: "success", content: "Profile updated successfully" });
    } catch (err) {
      setMessage({ type: "error", content: "Failed to update profile" });
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="mx-auto mt-8 max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Account Settings</h1>
      {message.content && (
        <Alert
          variant={message.type === "error" ? "destructive" : "default"}
          className="mb-4"
        >
          <AlertDescription>{message.content}</AlertDescription>
        </Alert>
      )}
      <CustomForm
        fields={[
          {
            name: "name",
            label: "Name",
            type: "text",
            defaultValue: user.name,
          },
          {
            name: "email",
            label: "Email",
            type: "email",
            defaultValue: user.email,
          },
        ]}
        onSubmit={handleUpdateProfile}
        validationSchema={accountSchema}
      />
    </div>
  );
}
