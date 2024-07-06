// src/app/api/auth/verify-email/route.ts

import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const { token } = await req.json();

  // In a real scenario, you'd verify the token against a stored token
  // For this example, we'll assume the token is the user's email
  const user = await db.query.users.findFirst({
    where: eq(users.email, token),
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  await db
    .update(users)
    .set({ emailVerified: new Date() })
    .where(eq(users.id, user.id));

  return NextResponse.json({ message: "Email verified successfully" });
}
