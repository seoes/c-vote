import type { RequestHandler } from "./$types";
import { json, error } from "@sveltejs/kit";
import { getDb, votes } from "$lib/db";
import { eq } from "drizzle-orm";

export const PATCH: RequestHandler = async ({ params, platform, locals }) => {
    // 관리자 권한 확인
    if (!locals.user?.isAdmin) {
        throw error(403, "관리자 권한이 필요합니다.");
    }

    const env = platform?.env;
    if (!env) {
        throw new Error("Environment not available. Run with 'wrangler dev'");
    }

    const db = getDb(env.DB);
    const voteId = params.id;

    // 투표 상태 변경
    await db.update(votes).set({ status: "ended" }).where(eq(votes.id, voteId));

    return json({ success: true });
};
