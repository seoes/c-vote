import type { RequestHandler } from "./$types";
import { json, error } from "@sveltejs/kit";
import { getDb, members } from "$lib/db";
import { eq } from "drizzle-orm";

export const PATCH: RequestHandler = async ({ params, request, platform, locals }) => {
    // 관리자 권한 확인
    if (!locals.user?.isAdmin) {
        throw error(403, "관리자 권한이 필요합니다.");
    }

    const env = platform?.env;
    if (!env) {
        throw new Error("Environment not available. Run with 'wrangler dev'");
    }

    const db = getDb(env.DB);
    const memberId = params.id;
    const body = await request.json();

    const { canVote } = body;

    if (typeof canVote !== "boolean") {
        throw error(400, "canVote 값은 boolean이어야 합니다.");
    }

    // 회원 존재 확인
    const existingMember = await db.select().from(members).where(eq(members.id, memberId)).limit(1);

    if (existingMember.length === 0) {
        throw error(404, "회원을 찾을 수 없습니다.");
    }

    // 투표 권한 업데이트
    await db.update(members).set({ canVote }).where(eq(members.id, memberId));

    return json({ success: true, canVote });
};
