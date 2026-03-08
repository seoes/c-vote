// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { LoggedInUser } from "$lib/auth";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "$lib/db/schema";

declare global {
    namespace App {
        interface Error {
            message: string;
            status?: number;
        }
        interface Locals {
            user: LoggedInUser | undefined;
            db: DrizzleD1Database<typeof schema> | undefined;
        }
        interface PageData {}
        interface PageState {}
        interface Platform {
            env: {
                DB: import("@cloudflare/workers-types").D1Database;
                JWT_SECRET: string;
                ENVIRONMENT?: string;
            };
        }
    }
}

export {};
