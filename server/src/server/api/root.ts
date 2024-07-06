import { createTRPCRouter } from "~/server/api/trpc";
import { surveyRouter } from "~/server/api/routers/survey";
import { notificationsRouter } from "~/server/api/routers/notifications";
import { userManagementRouter } from "~/server/api/routers/userManagement";
import { aiAnalysisRouter } from "~/server/api/routers/aiAnalysis";

export const appRouter = createTRPCRouter({
  survey: surveyRouter,
  notifications: notificationsRouter,
  userManagement: userManagementRouter,
  aiAnalysis: aiAnalysisRouter,
});

export type AppRouter = typeof appRouter;
