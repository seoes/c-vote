import type { RequestHandler } from "./$types";
import { json, error } from "@sveltejs/kit";
import { members, getDb, refreshTokens } from "$lib/db";
import {
    verifyPassword,
    createAccessToken,
    generateRefreshToken,
    hashRefreshToken,
    ACCESS_TOKEN_COOKIE,
    REFRESH_TOKEN_COOKIE,
    getAccessTokenCookieOptions,
    getRefreshTokenCookieOptions,
    REFRESH_TOKEN_EXPIRY,
} from "$lib/auth/jwt";
import { eq } from "drizzle-orm";
import { cuid2 } from "$lib/utils/cuid";

export const POST: RequestHandler = async ({ request, platform, cookies }) => {
    const env = platform?.env;
    if (!env) {
        throw new Error("Environment not available. Run with 'wrangler dev'");
    }

    const jwtSecret = env.JWT_SECRET || "local-dev-secret-key-do-not-use-in-production";
    const db = getDb(env.DB);

    const body = await request.json();

    const { name, phone, password } = body;

    // 유효성 검사
    if (!name?.trim() || !phone?.trim() || !password) {
        throw error(400, "모든 항목을 입력해주세요.");
    }

    // 회원 찾기
    const result = await db.select().from(members).where(eq(members.phone, phone)).limit(1);

    if (result.length === 0) {
        throw error(401, "등록되지 않은 전화번호입니다.");
    }

    const member = result[0];

    // 이름 확인
    if (member.name !== name.trim()) {
        throw error(401, "이름이 일치하지 않습니다.");
    }

    // 비밀번호 확인 (후보자 계정은 비밀번호 없음)
    if (!member.passwordHash) {
        throw error(401, "후보자로 등록된 계정입니다. 회원가입을 진행해주세요.");
    }

    if (!verifyPassword(password, member.passwordHash)) {
        throw error(401, "비밀번호가 올바르지 않습니다.");
    }

    // 상태 확인
    if (member.status === "pending") {
        throw error(403, "관리자 승인 대기 중입니다. 승인 후 로그인할 수 있습니다.");
    }

    if (member.status === "rejected") {
        throw error(403, "가입 신청이 거절되었습니다. 관리자에게 문의해주세요.");
    }

    // 토큰 생성
    const accessToken = await createAccessToken(
        {
            sub: member.id,
            name: member.name,
            isAdmin: member.isAdmin,
        },
        jwtSecret,
    );

    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);

    // 기존 refresh token 삭제 (선택적 - 한 기기만 로그인 허용)
    // await db.delete(refreshTokens).where(eq(refreshTokens.memberId, member.id));

    // 새 refresh token 저장
    await db.insert(refreshTokens).values({
        id: cuid2(),
        memberId: member.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
    });

    // 쿠키 설정
    const isProduction = env?.ENVIRONMENT === "production";
    const accessOptions = { ...getAccessTokenCookieOptions(), secure: isProduction };
    const refreshOptions = { ...getRefreshTokenCookieOptions(), secure: isProduction };

    cookies.set(ACCESS_TOKEN_COOKIE, accessToken, accessOptions);
    cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, refreshOptions);

    return json({
        success: true,
        user: {
            id: member.id,
            name: member.name,
            isAdmin: member.isAdmin,
            sigchal: member.sigchal,
            position: member.position,
            church: member.church,
        },
    });
};
