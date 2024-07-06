import React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuth } from "~/hooks/useAuth";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Moon, Sun } from "lucide-react";

export default function SideMenu() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <aside className="flex h-screen w-64 flex-col justify-between bg-gray-100 p-6">
      <nav>
        <ul className="space-y-2">
          <li>
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
          </li>
          {user.role === "SOCIAL_WORKER" && (
            <>
              <li>
                <Link href="/survey-builder" className="hover:underline">
                  Survey Builder
                </Link>
              </li>
              <li>
                <Link href="/user-management" className="hover:underline">
                  User Management
                </Link>
              </li>
            </>
          )}
          <li>
            <Link href="/messenger" className="hover:underline">
              Messenger
            </Link>
          </li>
          <li>
            <Link href="/ai-analysis" className="hover:underline">
              AI Analysis
            </Link>
          </li>
        </ul>
      </nav>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
