import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { surveyAssignment, surveySubmission, users } from "~/server/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const analyticsRouter = createTRPCRouter({
  getOverviewData: protectedProcedure.query(async ({ ctx }) => {
    if (
      ctx.session.user.role !== "ADMIN" &&
      ctx.session.user.role !== "SOCIAL_WORKER"
    ) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    // Fetch survey completion data
    const surveyCompletionData = await ctx.db
      .select({
        status: surveyAssignment.status,
        count: sql`count(*)`.as("count"),
      })
      .from(surveyAssignment)
      .groupBy(surveyAssignment.status);

    // Fetch participant engagement data
    const participantEngagementData = await ctx.db
      .select({
        userId: users.id,
        name: users.name,
        engagement: sql`count(*)`.as("engagement"),
      })
      .from(surveySubmission)
      .innerJoin(
        surveyAssignment,
        eq(surveySubmission.surveyAssignmentId, surveyAssignment.id),
      )
      .innerJoin(users, eq(surveyAssignment.userId, users.id))
      .groupBy(users.id, users.name)
      .orderBy(sql`engagement DESC`)
      .limit(10);

    // Fetch response trend data
    const responseTrendData = await ctx.db
      .select({
        date: sql`DATE(${surveySubmission.createdAt})`.as("date"),
        responses: sql`count(*)`.as("responses"),
      })
      .from(surveySubmission)
      .groupBy(sql`DATE(${surveySubmission.createdAt})`)
      .orderBy(sql`DATE(${surveySubmission.createdAt})`);

    return {
      surveyCompletionData,
      participantEngagementData,
      responseTrendData,
    };
  }),
});
