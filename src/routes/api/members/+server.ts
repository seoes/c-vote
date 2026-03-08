import type { RequestHandler } from "./$types";
import { json, error } from "@sveltejs/kit";
import { getDb, members } from "$lib/db";
import { eq, desc, or, and, like } from "drizzle-orm";

export const GET: RequestHandler = async ({ url, platform, locals }) => {
    // 관리자 권한 확인
    if (!locals.user?.isAdmin) {
        throw error(403, "Admin access required");
    }

    const env = platform?.env;
    if (!env) {
        throw new Error("Environment not available. Run with 'wrangler dev'");
    }

    const db = getDb(env.DB);

    const status = url.searchParams.get("status") as "pending" | "approved" | "rejected" | null;
    const search = url.searchParams.get("search");

    // 조건 빌드
    const conditions = [eq(members.isAdmin, false)];

    if (status) {
        conditions.push(eq(members.status, status));
    }

    if (search) {
        conditions.push(
            or(
                like(members.name, `%${search}%`),
                like(members.church, `%${search}%`),
                like(members.phone, `%${search}%`),
            )!,
        );
    }

    // 단일 쿼리 실행
    const result = await db
        .select()
        .from(members)
        .where(and(...conditions))
        .orderBy(desc(members.createdAt));

    return json(result);
};
