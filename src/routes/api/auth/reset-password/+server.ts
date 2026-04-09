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
        throw error(400, "Token and new password are required");
    }

    if (newPassword.length < 4) {
        throw error(400, "Password must be at least 4 characters");
    }

    // 토큰 검증
    let payload;
    try {
        const secret = new TextEncoder().encode(env.JWT_SECRET);
        const result = await jwtVerify(token, secret);
        payload = result.payload;
    } catch {
        throw error(401, "Invalid or expired token");
    }

    // 토큰 타입 확인
    if (payload.type !== "password-reset") {
        throw error(401, "Invalid token type");
    }

    const memberId = payload.sub as string;

    // 사용자 확인
    const member = await db.select().from(members).where(eq(members.id, memberId)).limit(1);
    if (member.length === 0) {
        throw error(404, "User not found");
    }

    const user = member[0];

    // 승인된 회원만 비밀번호 재설정 가능
    if (user.status !== "approved") {
        throw error(403, "Account not approved");
    }

    // 비밀번호 업데이트
    const passwordHash = hashPassword(newPassword);

    try {
        await db.update(members).set({ passwordHash }).where(eq(members.id, memberId));

        return json({ success: true, message: "Password reset successful" });
    } catch (e) {
        console.error("Password reset error:", e);
        throw error(500, "Failed to reset password");
    }
};
