// src/server/api/routers/survey.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { survey } from "~/server/db/schema";

export const surveyRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        data: z.any(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newSurvey = await ctx.db
        .insert(survey)
        .values({
          name: input.title || "Untitled Survey",
          description: input.description || "",
          creatorId: ctx.session.user.id,
          data: input.data,
        })
        .returning();

      return newSurvey[0];
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const surveys = await ctx.db
      .select()
      .from(survey)
      .where(survey.creatorId, "=", ctx.session.user.id);
    return surveys;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const surveyData = await ctx.db
        .select()
        .from(survey)
        .where(survey.id, "=", input.id)
        .and(survey.creatorId, "=", ctx.session.user.id);
      return surveyData[0];
    }),
});
