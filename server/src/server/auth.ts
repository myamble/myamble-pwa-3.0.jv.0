import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { sql } from "drizzle-orm";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
  type Session,
} from "next-auth";
import { type DefaultJWT, type JWT } from "next-auth/jwt";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

import { env } from "~/env.mjs";
import { db } from "~/server/db";
import { pgTable, UserRole, users } from "~/server/db/schema";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: number;
      role: UserRole;
      contactNumber?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    contactNumber?: string;
  }
}

declare module "next-auth/adapters" {
  export interface AdapterUser {
    role?: UserRole;
  }
}
declare module "next-auth/jwt" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */

  interface JWT extends DefaultJWT {
    id: string;
    role: UserRole;
    emailVerified: Date | null;
  }
}
/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user.id = parseInt(token.id);
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.image = token.picture; // replace 'image' with 'picture'
      }
      return session;
    },
    jwt: async ({ token }: { token: JWT }) => {
      const userCheck = await db
        .select()
        .from(users)
        .where(sql`${users.email} = ${token.email}`);

      const dbUser = userCheck[0];

      if (!dbUser) {
        console.log("No User");
        throw new Error("Unable to find user");
      }

      return {
        id: dbUser.id.toString(),
        role: dbUser.role as UserRole,
        email: dbUser.email,
        emailVerified: dbUser.emailVerified,
        name: dbUser.name,
        picture: dbUser.image,
        sub: token.sub,
      };
    },
    async signIn({ user, account, profile }) {
      console.log(user);
      console.log(account);
      console.log(profile);

      const isAllowedToSignIn = true; // You can add your own login logic here
      if (isAllowedToSignIn) {
        return `/`; // Redirect to a specific page after sign in
      } else {
        // Return false to display a default error message
        return false;
      }
    },
  },
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: env.NEXTAUTH_SECRET,
  },
  secret: env.NEXTAUTH_SECRET,
  providers: [
    GithubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    FacebookProvider({
      clientId: env.FACEBOOK_CLIENT_ID,
      clientSecret: env.FACEBOOK_CLIENT_SECRET,
    }),
  ],
  pages: {},
};

export const getServerAuthSession = () => getServerSession(authOptions);

// src/server/auth.ts
import { randomBytes } from "crypto";
import { passwordResetTokens } from "~/server/db/schema";

export async function generatePasswordResetToken(
  userId: number,
): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 3600000); // 1 hour from now

  await db.insert(passwordResetTokens).values({
    token,
    userId,
    expires,
  });

  return token;
}
