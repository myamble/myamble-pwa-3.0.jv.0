// src/server/api/routers/auth.ts

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { hash } from "bcryptjs";
import { users } from "~/server/db/schema";
import { sendPasswordResetEmail, sendVerificationEmail } from "~/server/email";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { generatePasswordResetToken } from "~/server/auth";

export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(8),
        role: z.enum(["SOCIAL_WORKER", "PARTICIPANT"]),
        contactNumber: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const hashedPassword = await hash(input.password, 10);

      const [user] = await ctx.db
        .insert(users)
        .values({
          name: input.name,
          email: input.email,
          hashedPassword: hashedPassword,
          role: input.role,
          contactNumber: input.contactNumber,
        })
        .returning();
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
        });
      }

      // In a real scenario, generate a unique token
      const verificationToken = user.email;

      await sendVerificationEmail(user.email, verificationToken);

      return { success: true };
    }),

  forgotPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (user) {
        const token = await generatePasswordResetToken(user.id);
        await sendPasswordResetEmail(user.email, token);
      }

      // Always return success to prevent email enumeration
      return { success: true };
    }),
});
