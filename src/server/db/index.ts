import { drizzle, PgliteDatabase } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";

import { env } from "~/server/env.mjs";
import * as schema from "./schema";

const client = new PGlite();
export const db = drizzle(client, { schema });
