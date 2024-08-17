// src/app/api/auth/reset-password/route.ts

import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  // In a real scenario, you'd verify the token against a stored token
  // For this example, we'll assume the token is the user's email
  const user = await db.query.users.findFirst({
    where: eq(users.email, token),
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.update(users).set({ hashedPassword }).where(eq(users.id, user.id));

  return NextResponse.json({ message: "Password reset successfully" });
}
