// components/SideMenu.tsx
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function SideMenu() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <aside className="w-64 bg-gray-100 p-6">
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
            <Link href="/myamble-ai" className="hover:underline">
              MyAmble AI
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
