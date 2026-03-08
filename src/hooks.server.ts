import type { Handle } from "@sveltejs/kit";
import { verifyAccessToken, ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "$lib/auth/jwt";
import { getDb, members, refreshTokens } from "$lib/db";
import { eq } from "drizzle-orm";

export const handle: Handle = async ({ event, resolve }) => {
    const { cookies, locals, platform } = event;

    // Cloudflare Workers 환경에서 환경변수 가져오기
    // wrangler dev 실행 시 platform.env는 항상 존재
    const env = platform?.env;
    if (!env) {
        throw new Error("Environment not available. Run with 'wrangler dev'");
    }

    const jwtSecret = env.JWT_SECRET || "local-dev-secret-key-do-not-use-in-production";
    const db = getDb(env.DB);

    // DB 설정
    locals.db = db;

    // Access Token 확인
    const accessToken = cookies.get(ACCESS_TOKEN_COOKIE);
    if (accessToken) {
        const payload = await verifyAccessToken(accessToken, jwtSecret);
        if (payload) {
            locals.user = {
                id: payload.sub,
                name: payload.name,
                isAdmin: payload.isAdmin,
            };
            return resolve(event);
        }
    }

    // Access Token이 없거나 만료된 경우 Refresh Token으로 갱신 시도
    const refreshToken = cookies.get(REFRESH_TOKEN_COOKIE);
    if (refreshToken) {
        try {
            // DB에서 refresh token 확인
            const storedToken = await db
                .select()
                .from(refreshTokens)
                .where(eq(refreshTokens.token, refreshToken))
                .limit(1);

            if (storedToken.length > 0) {
                const token = storedToken[0];

                // 만료 확인
                if (token.expiresAt > new Date()) {
                    // 회원 정보 조회
                    const member = await db.select().from(members).where(eq(members.id, token.memberId)).limit(1);

                    if (member.length > 0 && member[0].status === "approved") {
                        const m = member[0];
                        locals.user = {
                            id: m.id,
                            name: m.name,
                            isAdmin: m.isAdmin,
                        };
                    }
                }
            }
        } catch (error) {
            console.error("Refresh token validation error:", error);
        }
    }

    return resolve(event);
};
