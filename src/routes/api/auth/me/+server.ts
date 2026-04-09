import type { RequestHandler } from "./$types";
import { json, error } from "@sveltejs/kit";
import { getDb, members } from "$lib/db";
import { eq } from "drizzle-orm";

export const GET: RequestHandler = async ({ platform, locals }) => {
    if (!locals.user) {
        throw error(401, "로그인이 필요합니다.");
    }

    const env = platform?.env;
    if (!env) {
        throw new Error("Environment not available. Run with 'wrangler dev'");
    }

    const db = getDb(env.DB);

    // 최신 사용자 정보 조회
    const result = await db.select().from(members).where(eq(members.id, locals.user.id)).limit(1);

    if (result.length === 0) {
        throw error(404, "사용자 정보를 찾을 수 없습니다.");
    }

    const member = result[0];

    return json({
        id: member.id,
        name: member.name,
        isAdmin: member.isAdmin,
        sigchal: member.sigchal,
        position: member.position,
        church: member.church,
        status: member.status,
    });
};
