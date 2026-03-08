import type { RequestHandler } from "./$types";
import { json, error } from "@sveltejs/kit";
import { getDb, members } from "$lib/db";
import { eq } from "drizzle-orm";

export const PATCH: RequestHandler = async ({ params, platform, locals }) => {
    // 관리자 권한 확인
    if (!locals.user?.isAdmin) {
        throw error(403, "Admin access required");
    }

    const env = platform?.env;
    if (!env) {
        throw new Error("Environment not available. Run with 'wrangler dev'");
    }

    const db = getDb(env.DB);
    const memberId = params.id;

    // 회원 상태 변경
    await db.update(members).set({ status: "approved" }).where(eq(members.id, memberId));

    return json({ success: true });
};
