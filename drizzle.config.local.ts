import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/lib/db/schema.ts",
    out: "./src/lib/db/migrations",
    dialect: "sqlite",
    dbCredentials: {
        url: "./.wrangler/state/v3/d1/miniflare-D1DatabaseObject/51b10e71865ce18d4c7ed42aee3cf28be2c1321d98cb91297b4218767f61895f.sqlite",
    },
});
