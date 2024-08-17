// src/server/api/routers/survey.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/trpc/trpc";
import {
  survey,
  surveyAssignment,
  surveySubmission,
  users,
} from "~/server/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import * as XLSX from "xlsx";

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

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role === "PARTICIPANT") {
        const assignment = await ctx.db
          .select()
          .from(surveyAssignment)
          .where(
            and(
              eq(surveyAssignment.surveyId, input.id),
              eq(surveyAssignment.userId, ctx.session.user.id),
            ),
          )
          .limit(1);

        if (assignment.length === 0) {
          throw new Error("Survey not assigned to this participant");
        }
      }

      const surveyData = await ctx.db
        .select()
        .from(survey)
        .where(eq(survey.id, input.id))
        .limit(1);

      if (surveyData.length === 0) {
        throw new Error("Survey not found");
      }

      return surveyData[0];
    }),

  assignSurvey: protectedProcedure
    .input(
      z.object({
        surveyId: z.string(),
        userId: z.string(),
        occurrence: z.enum(["once", "daily", "weekly", "monthly"]),
        startDate: z.string(),
        endDate: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (
        ctx.session.user.role !== "ADMIN" &&
        ctx.session.user.role !== "SOCIAL_WORKER"
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const [assignment] = await ctx.db.transaction(async (trx) => {
        const [newAssignment] = await trx
          .insert(surveyAssignment)
          .values({
            surveyId: input.surveyId,
            userId: input.userId,
            occurrence: input.occurrence,
            startDate: new Date(input.startDate),
            endDate: input.endDate ? new Date(input.endDate) : null,
          })
          .returning();

        const surveyData = await trx
          .select({ name: survey.name })
          .from(survey)
          .where(eq(survey.id, input.surveyId))
          .limit(1);

        if (surveyData.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Survey not found",
          });
        }

        await trx.insert(notifications).values({
          userId: input.userId,
          type: "new_assignment",
          content: `You have been assigned a new survey: ${surveyData[0].name}`,
        });

        return [newAssignment];
      });

      return assignment;
    }),

  submitSurvey: protectedProcedure
    .input(
      z.object({
        surveyId: z.string(),
        data: z.any(),
        status: z.enum(["in_progress", "completed"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const assignment = await ctx.db
        .select({
          id: surveyAssignment.id,
          surveyId: surveyAssignment.surveyId,
          userId: surveyAssignment.userId,
        })
        .from(surveyAssignment)
        .where(
          and(
            eq(surveyAssignment.surveyId, input.surveyId),
            eq(surveyAssignment.userId, ctx.session.user.id),
          ),
        )
        .limit(1);

      if (assignment.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Survey assignment not found",
        });
      }

      const [submission] = await ctx.db.transaction(async (trx) => {
        const [newSubmission] = await trx
          .insert(surveySubmission)
          .values({
            surveyAssignmentId: assignment[0].id,
            data: input.data,
            status: input.status,
          })
          .returning();

        if (input.status === "completed") {
          const surveyData = await trx
            .select({ name: survey.name })
            .from(survey)
            .where(eq(survey.id, assignment[0].surveyId))
            .limit(1);

          if (surveyData.length === 0) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Survey not found",
            });
          }

          const adminUser = await trx
            .select({ id: users.id })
            .from(users)
            .where(eq(users.id, ctx.session.user.adminUserId))
            .limit(1);

          if (adminUser.length > 0) {
            await trx.insert(notifications).values({
              userId: adminUser[0].id,
              type: "survey_completed",
              content: `A participant has completed the survey: ${surveyData[0].name}`,
            });
          }
        }

        return [newSubmission];
      });

      return submission;
    }),

  getSurveyResults: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (
        ctx.session.user.role !== "ADMIN" &&
        ctx.session.user.role !== "SOCIAL_WORKER"
      ) {
        throw new Error("Unauthorized");
      }

      const result = await ctx.db
        .select({
          surveyName: survey.name,
          participantName: users.name,
          participantEmail: users.email,
          submissionDate: surveySubmission.createdAt,
          data: surveySubmission.data,
        })
        .from(surveySubmission)
        .innerJoin(
          surveyAssignment,
          eq(surveySubmission.surveyAssignmentId, surveyAssignment.id),
        )
        .innerJoin(survey, eq(surveyAssignment.surveyId, survey.id))
        .innerJoin(users, eq(surveyAssignment.userId, users.id))
        .where(eq(surveySubmission.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new Error("Survey result not found");
      }

      const surveyResult = result[0];
      const responses = Object.entries(surveyResult.data).map(
        ([question, answer]) => ({
          question,
          answer: String(answer), // Convert to string for consistent rendering
        }),
      );

      return {
        surveyName: surveyResult.surveyName,
        participantName: surveyResult.participantName,
        participantEmail: surveyResult.participantEmail,
        submissionDate: surveyResult.submissionDate,
        responses,
      };
    }),

  getSurveyAssignment: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (
        ctx.session.user.role !== "ADMIN" &&
        ctx.session.user.role !== "SOCIAL_WORKER"
      ) {
        throw new Error("Unauthorized");
      }

      const assignment = await ctx.db
        .select({
          id: surveyAssignment.id,
          occurrence: surveyAssignment.occurrence,
          startDate: surveyAssignment.startDate,
          endDate: surveyAssignment.endDate,
          survey: {
            id: survey.id,
            name: survey.name,
          },
          user: {
            id: users.id,
            name: users.name,
          },
        })
        .from(surveyAssignment)
        .innerJoin(survey, eq(surveyAssignment.surveyId, survey.id))
        .innerJoin(users, eq(surveyAssignment.userId, users.id))
        .where(eq(surveyAssignment.id, input.id))
        .limit(1);

      if (assignment.length === 0) {
        throw new Error("Survey assignment not found");
      }

      return assignment[0];
    }),

  updateSurveyAssignment: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        occurrence: z.enum(["once", "daily", "weekly", "monthly"]),
        startDate: z.string(),
        endDate: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (
        ctx.session.user.role !== "ADMIN" &&
        ctx.session.user.role !== "SOCIAL_WORKER"
      ) {
        throw new Error("Unauthorized");
      }

      const updatedAssignment = await ctx.db
        .update(surveyAssignment)
        .set({
          occurrence: input.occurrence,
          startDate: new Date(input.startDate),
          endDate: input.endDate ? new Date(input.endDate) : null,
        })
        .where(eq(surveyAssignment.id, input.id))
        .returning();

      return updatedAssignment[0];
    }),

  getAssignedSurveysForAdmin: protectedProcedure.query(async ({ ctx }) => {
    if (
      ctx.session.user.role !== "ADMIN" &&
      ctx.session.user.role !== "SOCIAL_WORKER"
    ) {
      throw new Error("Unauthorized");
    }

    const assignments = await ctx.db
      .select({
        id: surveyAssignment.id,
        createdAt: surveyAssignment.createdAt,
        status: surveyAssignment.status,
        survey: {
          id: survey.id,
          name: survey.name,
        },
        user: {
          id: users.id,
          name: users.name,
        },
      })
      .from(surveyAssignment)
      .innerJoin(survey, eq(surveyAssignment.surveyId, survey.id))
      .innerJoin(users, eq(surveyAssignment.userId, users.id))
      .where(
        ctx.session.user.role === "SOCIAL_WORKER"
          ? eq(users.adminUserId, ctx.session.user.id)
          : sql`1=1`,
      );

    return assignments;
  }),

  getCompletedSurveysForAdmin: protectedProcedure.query(async ({ ctx }) => {
    if (
      ctx.session.user.role !== "ADMIN" &&
      ctx.session.user.role !== "SOCIAL_WORKER"
    ) {
      throw new Error("Unauthorized");
    }

    const submissions = await ctx.db
      .select({
        id: surveySubmission.id,
        createdAt: surveySubmission.createdAt,
        survey: {
          id: survey.id,
          name: survey.name,
        },
        user: {
          id: users.id,
          name: users.name,
        },
      })
      .from(surveySubmission)
      .innerJoin(
        surveyAssignment,
        eq(surveySubmission.surveyAssignmentId, surveyAssignment.id),
      )
      .innerJoin(survey, eq(surveyAssignment.surveyId, survey.id))
      .innerJoin(users, eq(surveyAssignment.userId, users.id))
      .where(
        and(
          eq(surveySubmission.status, "completed"),
          ctx.session.user.role === "SOCIAL_WORKER"
            ? eq(users.adminUserId, ctx.session.user.id)
            : sql`1=1`,
        ),
      );

    return submissions;
  }),

  getSurveyResultsAggregated: protectedProcedure
    .input(z.object({ surveyId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (
        ctx.session.user.role !== "ADMIN" &&
        ctx.session.user.role !== "SOCIAL_WORKER"
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const surveyData = await ctx.db
        .select({
          id: survey.id,
          name: survey.name,
          description: survey.description,
          data: survey.data,
        })
        .from(survey)
        .where(eq(survey.id, input.surveyId))
        .limit(1);

      if (surveyData.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Survey not found" });
      }

      const submissions = await ctx.db
        .select({
          data: surveySubmission.data,
        })
        .from(surveySubmission)
        .innerJoin(
          surveyAssignment,
          eq(surveySubmission.surveyAssignmentId, surveyAssignment.id),
        )
        .where(eq(surveyAssignment.surveyId, input.surveyId));

      // Aggregate the results
      const aggregatedResults = {};
      submissions.forEach((submission) => {
        Object.entries(submission.data).forEach(([key, value]) => {
          if (!aggregatedResults[key]) {
            aggregatedResults[key] = {};
          }
          if (typeof value === "string" || typeof value === "number") {
            aggregatedResults[key][value] =
              (aggregatedResults[key][value] || 0) + 1;
          }
        });
      });

      return {
        survey: surveyData[0],
        aggregatedResults,
        totalResponses: submissions.length,
      };
    }),

  getAssignedSurveys: protectedProcedure.query(async ({ ctx }) => {
    const assignments = await ctx.db
      .select({
        id: surveyAssignment.id,
        name: survey.name,
        description: survey.description,
        status: surveyAssignment.status,
        dueDate: surveyAssignment.dueDate,
      })
      .from(surveyAssignment)
      .innerJoin(survey, eq(surveyAssignment.surveyId, survey.id))
      .where(eq(surveyAssignment.userId, ctx.session.user.id))
      .where(eq(surveyAssignment.status, "in_progress"));

    return assignments;
  }),

  exportSurveyResults: protectedProcedure
    .input(
      z.object({
        surveyId: z.string(),
        format: z.enum(["xlsx", "csv"]),
        columns: z.array(z.string()).optional(),
        strata: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (
        ctx.session.user.role !== "ADMIN" &&
        ctx.session.user.role !== "SOCIAL_WORKER"
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const surveyData = await ctx.db
        .select({
          id: survey.id,
          name: survey.name,
          data: survey.data,
        })
        .from(survey)
        .where(eq(survey.id, input.surveyId))
        .limit(1)
        .execute();

      if (!surveyData || surveyData.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Survey not found" });
      }

      const submissions = (await ctx.db
        .select({
          data: surveySubmission.data,
          userId: surveyAssignment.userId,
        })
        .from(surveySubmission)
        .innerJoin(
          surveyAssignment,
          eq(surveySubmission.surveyAssignmentId, surveyAssignment.id),
        )
        .where(eq(surveyAssignment.surveyId, input.surveyId))
        .execute()) as { data: any; userId: string }[];
      if (!submissions) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No submissions found for survey",
        });
      }

      // Fetch user data for strata if needed
      let userMap: { [key: string]: any } = {};
      if (input.strata && input.strata.length > 0) {
        const userIds = [...new Set(submissions.map((s) => s.userId))];
        const userData = await ctx.db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            // Add other user fields that might be used for strata
          })
          .from(users)
          .where(sql`${users.id} IN ${userIds}`);

        userMap = Object.fromEntries(userData.map((u) => [u.id, u]));
      }

      // Prepare data for export
      const exportData = submissions.map((submission) => {
        const row: any = {};
        if (input.columns) {
          input.columns.forEach((column) => {
            row[column] = submission.data[column] || "";
          });
        } else {
          Object.assign(row, submission.data);
        }
        if (input.strata) {
          input.strata.forEach((stratum) => {
            row[stratum] = userMap[submission.userId][stratum] || "";
          });
        }
        return row;
      });

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, "Survey Results");

      // Generate file
      const fileBuffer =
        input.format === "xlsx"
          ? XLSX.write(wb, { type: "buffer", bookType: "xlsx" })
          : XLSX.write(wb, { type: "binary", bookType: "csv" });

      // Convert buffer to base64
      const base64 = Buffer.from(fileBuffer).toString("base64");

      return {
        fileName: `${surveyData[0]!.name}_results.${input.format}`,
        fileContent: base64,
        contentType:
          input.format === "xlsx"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "text/csv",
      };
    }),
});
