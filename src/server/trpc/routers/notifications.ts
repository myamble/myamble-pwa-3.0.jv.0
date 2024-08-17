// src/server/api/routers/notifications.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/trpc/trpc";
import { notifications } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

export const notificationsRouter = createTRPCRouter({
  getUnreadNotifications: protectedProcedure.query(async ({ ctx }) => {
    const unreadNotifications = await ctx.db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, ctx.session.user.id),
          eq(notifications.isRead, false),
        ),
      )
      .orderBy(notifications.createdAt);

    return unreadNotifications;
  }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.id, input.id),
            eq(notifications.userId, ctx.session.user.id),
          ),
        );

      return { success: true };
    }),

  createNotification: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        type: z.enum(["new_assignment", "survey_completed"]),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [newNotification] = await ctx.db
        .insert(notifications)
        .values({
          userId: input.userId,
          type: input.type,
          content: input.content,
        })
        .returning();

      return newNotification;
    }),
});
