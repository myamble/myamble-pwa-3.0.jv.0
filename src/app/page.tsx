// src/app/page.tsx
import Link from "next/link";
import { Button } from "~/app/_components/ui/button";

export default function Home() {
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
