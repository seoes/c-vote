import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/lib/db/schema.ts",
    out: "./src/lib/db/migrations",
    dialect: "sqlite",
    dbCredentials: {
        url: "./.wrangler/state/v3/d1/miniflare-D1DatabaseObject/c79b15f44f7d862afc27d5b6fc41f5747a91a3eb2a03d6bf10ee4daa8774a1fe.sqlite",
    },
});
