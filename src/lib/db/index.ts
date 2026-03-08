import { drizzle } from "drizzle-orm/d1";
import type { D1Database } from "@cloudflare/workers-types";
import * as schema from "./schema";

// D1 데이터베이스 연결
export function getDb(d1: D1Database) {
    return drizzle(d1, { schema });
}

export * from "./schema";
