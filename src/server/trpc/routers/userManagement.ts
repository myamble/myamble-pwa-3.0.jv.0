// src/server/api/routers/userManagement.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/trpc/trpc";
import { surveyAssignment, surveySubmission, users } from "~/server/db/schema";
import { eq, and, not } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const userManagementRouter = createTRPCRouter({
  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== "ADMIN") {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const allUsers = await ctx.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        adminUserId: users.adminUserId,
      })
      .from(users)
      .where(not(eq(users.id, ctx.session.user.id)));

    return allUsers;
  }),

  updateUserRole: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        newRole: z.enum(["ADMIN", "SOCIAL_WORKER", "PARTICIPANT"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const [updatedUser] = await ctx.db
        .update(users)
        .set({ role: input.newRole })
        .where(eq(users.id, input.userId))
        .returning();

      return updatedUser;
    }),

  assignSocialWorker: protectedProcedure
    .input(
      z.object({
        participantId: z.string(),
        socialWorkerId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const socialWorker = await ctx.db
        .select()
        .from(users)
        .where(
          and(
            eq(users.id, input.socialWorkerId),
            eq(users.role, "SOCIAL_WORKER"),
          ),
        )
        .limit(1);

      if (socialWorker.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid social worker ID",
        });
      }

      const [updatedParticipant] = await ctx.db
        .update(users)
        .set({ adminUserId: input.socialWorkerId })
        .where(
          and(eq(users.id, input.participantId), eq(users.role, "PARTICIPANT")),
        )
        .returning();

      return updatedParticipant;
    }),

  removeUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      await ctx.db.delete(users).where(eq(users.id, input.userId));

      return { success: true };
    }),

  getAssignedParticipants: protectedProcedure.query(async ({ ctx }) => {
    const participants = await ctx.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        totalAssignedSurveys: count(surveyAssignment.id).as(
          "totalAssignedSurveys",
        ),
        completedSurveys: count(surveySubmission.id).as("completedSurveys"),
      })
      .from(users)
      .leftJoin(surveyAssignment, eq(users.id, surveyAssignment.userId))
      .leftJoin(
        surveySubmission,
        eq(surveyAssignment.id, surveySubmission.surveyAssignmentId),
      )
      .where(
        and(
          eq(users.role, "PARTICIPANT"),
          eq(users.adminUserId, ctx.session.user.id),
        ),
      )
      .groupBy(users.id);

    return participants.map((participant) => ({
      ...participant,
      hasOverdueSurveys:
        participant.totalAssignedSurveys > participant.completedSurveys,
    }));
  }),
});
