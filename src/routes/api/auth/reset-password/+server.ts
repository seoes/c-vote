import type { RequestHandler } from "./$types";
import { json, error } from "@sveltejs/kit";
import { members, getDb } from "$lib/db";
import { eq } from "drizzle-orm";
import { jwtVerify } from "jose";
import { hashPassword } from "$lib/auth/jwt";

export const POST: RequestHandler = async ({ request, platform }) => {
    const env = platform?.env;
    if (!env) {
        throw new Error("Environment not available. Run with 'wrangler dev'");
    }

    const db = getDb(env.DB);

    const body = await request.json();
    const { token, newPassword } = body;

    // 유효성 검사
    if (!token || !newPassword) {
        throw error(400, "필수 정보가 누락되었습니다.");
    }

    if (newPassword.length < 4) {
        throw error(400, "비밀번호는 4자리 이상이어야 합니다.");
    }

    // 토큰 검증
    let payload;
    try {
        const secret = new TextEncoder().encode(env.JWT_SECRET);
        const result = await jwtVerify(token, secret);
        payload = result.payload;
    } catch {
        throw error(401, "인증 토큰이 만료되었거나 올바르지 않습니다. 처음부터 다시 시도해주세요.");
    }

    // 토큰 타입 확인
    if (payload.type !== "password-reset") {
        throw error(401, "잘못된 인증 토큰입니다.");
    }

    const memberId = payload.sub as string;

    // 사용자 확인
    const member = await db.select().from(members).where(eq(members.id, memberId)).limit(1);
    if (member.length === 0) {
        throw error(404, "사용자를 찾을 수 없습니다.");
    }

    const user = member[0];

    // 승인된 회원만 비밀번호 재설정 가능
    if (user.status === "pending") {
        throw error(403, "관리자 승인 대기 중입니다.");
    }

    if (user.status === "rejected") {
        throw error(403, "가입 신청이 거절된 계정입니다.");
    }

    // 비밀번호 업데이트
    const passwordHash = hashPassword(newPassword);

    try {
        await db.update(members).set({ passwordHash }).where(eq(members.id, memberId));

        return json({ success: true, message: "비밀번호가 변경되었습니다." });
    } catch (e) {
        console.error("Password reset error:", e);
        throw error(500, "비밀번호 변경 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
};
