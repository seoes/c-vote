import type { RequestHandler } from "./$types";
import { json, error } from "@sveltejs/kit";
import { getDb, refreshTokens } from "$lib/db";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "$lib/auth/jwt";
import { eq } from "drizzle-orm";

export const POST: RequestHandler = async ({ platform, cookies, locals }) => {
    const env = platform?.env;
    if (!env?.DB) {
        throw error(500, "서버 설정 오류가 발생했습니다.");
    }

    const refreshToken = cookies.get(REFRESH_TOKEN_COOKIE);

    if (refreshToken) {
        const db = getDb(env.DB);
        // Refresh token 삭제
        try {
            await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));
        } catch (e) {
            // 무시
        }
    }

    // 쿠키 삭제
    cookies.delete(ACCESS_TOKEN_COOKIE, { path: "/" });
    cookies.delete(REFRESH_TOKEN_COOKIE, { path: "/" });

    return json({ success: true });
};
