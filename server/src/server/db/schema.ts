import {
  timestamp,
  text,
  primaryKey,
  integer,
  pgTableCreator,
  bigint,
  varchar,
  pgEnum,
  PgColumn,
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
export const roleEnum = pgEnum('role', ["USER", "OWNER"])

export const users = pgTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  role: roleEnum('role').default("USER"),
  adminUser: text("adminUser").references(():PgColumn => users.id, { onDelete: "no action" }),
  responsibleForAccounts: text("responsibleForAccounts").references(():PgColumn => accounts.userId, { onDelete: "restrict" })
});
export const UserSelect = users.$inferSelect
export const UserInsert = users.$inferInsert

export const 

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
export const AccountSelect = accounts.$inferSelect
export const AccountInsert = accounts.$inferInsert

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});
export const SessionSelect = sessions.$inferSelect
export const SessionInsert = sessions.$inferInsert

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
export const VerificationTokenSelect = verificationTokens.$inferSelect
export const VerificationTokenInsert = verificationTokens.$inferInsert

