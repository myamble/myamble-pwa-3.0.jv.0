"use client";

import { useAuth } from "~/hooks/useAuth";
import { Button } from "~/components/shadcn/button";
import Link from "next/link";
import ParticipantDashboard from "~/components/dashboard/ParticipantDashboard";
import SocialWorkerDashboard from "~/components/dashboard/SocialWorkerDashboard";

export default function Home() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-2">
        <h1 className="mb-8 text-4xl font-bold">Welcome to MyAmble</h1>
        <p className="mb-8 max-w-2xl text-center text-xl">
          Empowering social work research through innovative surveys and data
          analysis. Join our platform to create, distribute, and analyze surveys
          with ease.
        </p>
        <div className="flex space-x-4">
          <Link href="/login">
            <Button>Login</Button>
          </Link>
          <Link href="/sign-up">
            <Button variant="outline">Sign Up</Button>
          </Link>
        </div>
      </div>
    );
  }

  switch (user.role) {
    case "PARTICIPANT":
      return <ParticipantDashboard />;
    case "SOCIAL_WORKER":
      return <SocialWorkerDashboard />;
    case "ADMIN":
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-4 text-2xl font-bold">Welcome, {user.name}</h1>
          <p>As an admin, you have access to all features of the platform.</p>
          <Link href="/dashboard">
            <Button className="mt-4">Go to Admin Dashboard</Button>
          </Link>
        </div>
      );
    default:
      return <div>Unknown user role</div>;
  }
}
