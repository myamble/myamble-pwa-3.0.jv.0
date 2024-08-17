"use client";

import Link from "next/link";
import { useAuth } from "~/hooks/useAuth";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./button";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="supports-backdrop-blur:bg-background/60 sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">MyAmble</span>
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          {user ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/account">Account</Link>
              <Button onClick={logout} variant="ghost">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/sign-up">Sign Up</Link>
            </>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
