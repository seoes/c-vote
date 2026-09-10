import type { RequestHandler } from "./$types";
import { json, error } from "@sveltejs/kit";
import { getDb, members, SIGCHALS, POSITIONS } from "$lib/db";
import { eq, and, ne } from "drizzle-orm";
import { REGIONS } from "$lib/region";

export const PATCH: RequestHandler = async ({ params, request, platform, locals }) => {
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

    const { name, phone, church, region, sigchal, position } = body;

    if (!name?.trim() || !phone?.trim() || !church?.trim() || !region || !sigchal) {
        throw error(400, "모든 필수 항목을 입력해주세요.");
    }

    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
        throw error(400, "전화번호 형식이 올바르지 않습니다. (010-0000-0000)");
    }

    if (!(REGIONS as readonly string[]).includes(region)) {
        throw error(400, "올바르지 않은 노회입니다.");
    }

    if (!(SIGCHALS as readonly string[]).includes(sigchal)) {
        throw error(400, "올바르지 않은 시찰입니다.");
    }

    if (position && !(POSITIONS as readonly string[]).includes(position)) {
        throw error(400, "올바르지 않은 직분입니다.");
    }

    const existingMember = await db.select().from(members).where(eq(members.id, memberId)).limit(1);

    if (existingMember.length === 0) {
        throw error(404, "회원을 찾을 수 없습니다.");
    }

    const duplicatePhone = await db
        .select()
        .from(members)
        .where(and(eq(members.phone, phone), ne(members.id, memberId)))
        .limit(1);

    if (duplicatePhone.length > 0) {
        throw error(409, "이미 사용 중인 전화번호입니다.");
    }

    const [updated] = await db
        .update(members)
        .set({
            name: name.trim(),
            phone,
            church: church.trim(),
            region,
            sigchal,
            position: position || null,
        })
        .where(eq(members.id, memberId))
        .returning();

    return json({ success: true, member: updated });
};

export const DELETE: RequestHandler = async ({ params, platform, locals }) => {
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

    // 회원 삭제
    await db.delete(members).where(eq(members.id, memberId));

    return json({ success: true });
};
