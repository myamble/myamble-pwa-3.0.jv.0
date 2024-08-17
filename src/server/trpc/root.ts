import { createTRPCRouter } from "~/server/trpc/trpc";
import { surveyRouter } from "~/server/trpc/routers/survey";
import { notificationsRouter } from "~/server/trpc/routers/notifications";
import { userManagementRouter } from "~/server/trpc/routers/userManagement";
import { aiAnalysisRouter } from "~/server/trpc/routers/aiAnalysis";
import { analyticsRouter } from "~/server/trpc/routers/analytics";

export const appRouter = createTRPCRouter({
  survey: surveyRouter,
  notifications: notificationsRouter,
  userManagement: userManagementRouter,
  aiAnalysis: aiAnalysisRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
