import {
  timestamp,
  text,
  primaryKey,
  integer,
  pgTableCreator,
  pgEnum,
  PgColumn,
  jsonb,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "@auth/core/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */

export const pgTable = pgTableCreator((name) => `myamble_${name}`);

// application level tables
export const USER_ROLES = ["ADMIN", "SOCIAL_WORKER", "PARTICIPANT"];
export type UserRole = (typeof USER_ROLES)[number];
export enum UserRoleEnum {
  ADMIN = "ADMIN",
  SOCIAL_WORKER = "SOCIAL_WORKER",
  PARTICIPANT = "PARTICIPANT",
}
export const roleEnum = pgEnum(
  "user_role",
  USER_ROLES as [string, ...string[]],
);

export const users = pgTable("user", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  contactNumber: text("contact_number"),
  image: text("image"),
  role: roleEnum("role").default(UserRoleEnum.PARTICIPANT),
  adminUserId: text("adminUserId").references((): PgColumn => users.id, {
    onDelete: "no action",
  }),
  hashedPassword: text("hashedPassword"),
});
export const UserSelect = users.$inferSelect;
export const UserInsert = users.$inferInsert;

export const survey = pgTable("survey", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
  creatorId: text("creatorId").references((): PgColumn => users.id, {
    onDelete: "cascade",
  }),
  data: jsonb("data"),
});
export const SurveySelect = survey.$inferSelect;
export const SurveyInsert = survey.$inferInsert;

export const surveyAssignment = pgTable("survey_assignment", {
  id: text("id").notNull().primaryKey(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
  surveyId: text("surveyId").references((): PgColumn => survey.id, {
    onDelete: "cascade",
  }),
  userId: text("userId").references((): PgColumn => users.id, {
    onDelete: "cascade",
  }),
  occurrence: text("occurrence")
    .$type<"once" | "daily" | "weekly" | "monthly">()
    .notNull(),
  startDate: timestamp("startDate", { mode: "date" }).notNull(),
  endDate: timestamp("endDate", { mode: "date" }),
  assignedBy: text("assignedBy").references((): PgColumn => users.id, {
    onDelete: "set null",
  }),
  status: text("status")
    .$type<"not_started" | "in_progress" | "completed">()
    .notNull()
    .default("not_started"),
  dueDate: timestamp("dueDate", { mode: "date" }),
});
export const SurveyAssignmentSelect = surveyAssignment.$inferSelect;
export const SurveyAssignmentInsert = surveyAssignment.$inferInsert;

export const surveySubmission = pgTable("survey_submission", {
  id: text("id").notNull().primaryKey(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
  surveyAssignmentId: text("surveyAssignmentId").references(
    (): PgColumn => surveyAssignment.id,
    {
      onDelete: "cascade",
    },
  ),
  data: jsonb("data"),
});
export const SurveySubmissionSelect = surveySubmission.$inferSelect;
export const SurveySubmissionInsert = surveySubmission.$inferInsert;

export const notificationTypeEnum = pgEnum("notification_type", [
  "new_assignment",
  "survey_completed",
]);

export const notifications = pgTable("notifications", {
  id: text("id").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export const conversation = pgTable("conversation", {
  id: text("id").notNull().primaryKey(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
});
export const ConversationSelect = conversation.$inferSelect;
export const ConversationInsert = conversation.$inferInsert;

export const conversationParticipant = pgTable(
  "conversation_participant",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    conversationId: text("conversationId")
      .notNull()
      .references(() => conversation.id, {
        onDelete: "cascade",
      }),
  },
  (userConversation: any) => ({
    primaryKey: primaryKey(
      userConversation.userId,
      userConversation.conversationId,
    ),
  }),
);
export const ConversationParticipantSelect =
  conversationParticipant.$inferSelect;
export const ConversationParticipantInsert =
  conversationParticipant.$inferInsert;

export const message = pgTable("message", {
  id: text("id").notNull().primaryKey(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
  content: text("content"),
  conversationId: text("conversationId").references(
    (): PgColumn => conversation.id,
    {
      onDelete: "cascade",
    },
  ),
});
export const MessageSelect = message.$inferSelect;
export const MessageInsert = message.$inferInsert;

// src/server/db/schema.ts
export const passwordResetTokens = pgTable("password_reset_token", {
  id: text("id").notNull().primaryKey(),
  token: text("token").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// system stuff
export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    refresh_token_expires_in: integer("refresh_token_expires_in"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account: any) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
  }),
);
export const AccountSelect = accounts.$inferSelect;
export const AccountInsert = accounts.$inferInsert;

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});
export const SessionSelect = sessions.$inferSelect;
export const SessionInsert = sessions.$inferInsert;

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt: any) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  }),
);
export const VerificationTokenSelect = verificationTokens.$inferSelect;
export const VerificationTokenInsert = verificationTokens.$inferInsert;

// Add a new table for survey questions
export const surveyQuestion = pgTable("survey_question", {
  id: text("id").notNull().primaryKey(),
  surveyId: text("surveyId").references((): PgColumn => survey.id, {
    onDelete: "cascade",
  }),
  text: text("text").notNull(),
  type: text("type").$type<"multiple_choice" | "text" | "rating">().notNull(),
  options: jsonb("options"),
});

// Add a new table for survey responses
export const surveyResponse = pgTable("survey_response", {
  id: text("id").notNull().primaryKey(),
  surveySubmissionId: text("surveySubmissionId").references(
    (): PgColumn => surveySubmission.id,
    {
      onDelete: "cascade",
    },
  ),
  questionId: text("questionId").references((): PgColumn => surveyQuestion.id, {
    onDelete: "cascade",
  }),
  response: jsonb("response").notNull(),
});
