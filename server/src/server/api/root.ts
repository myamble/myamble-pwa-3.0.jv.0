// src/server/api/root.ts
import { createTRPCRouter } from "~/server/api/trpc";
import { surveyRouter } from "~/server/api/routers/survey";

export const appRouter = createTRPCRouter({
  survey: surveyRouter,
});

export type AppRouter = typeof appRouter;
