import type { RequestHandler } from "./$types";
import { json, error } from "@sveltejs/kit";
import { members, getDb } from "$lib/db";
import { eq, and } from "drizzle-orm";
import { SignJWT } from "jose";

export const POST: RequestHandler = async ({ request, platform }) => {
    const env = platform?.env;
    if (!env) {
        throw new Error("Environment not available. Run with 'wrangler dev'");
    }

    const db = getDb(env.DB);

    const body = await request.json();
    const { name, phone, securityAnswer } = body;

    // 유효성 검사
    if (!name?.trim() || !phone?.trim() || !securityAnswer?.trim()) {
        throw error(400, "모든 항목을 입력해주세요.");
    }

    // 사용자 찾기 (이름, 전화번호, 보안답변 일치)
    const member = await db
        .select()
        .from(members)
        .where(
            and(
                eq(members.name, name.trim()),
                eq(members.phone, phone),
                eq(members.securityAnswer, securityAnswer.trim())
            )
        )
        .limit(1);

    if (member.length === 0) {
        throw error(401, "입력하신 정보가 일치하지 않습니다. 이름, 전화번호, 성경인물 답변을 확인해주세요.");
    }

    const user = member[0];

    // 승인된 회원만 비밀번호 재설정 가능
    if (user.status === "pending") {
        throw error(403, "관리자 승인 대기 중입니다. 승인 후 비밀번호를 재설정할 수 있습니다.");
    }

    if (user.status === "rejected") {
        throw error(403, "가입 신청이 거절된 계정입니다.");
    }

    // 재설정용 토큰 생성 (10분 유효)
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const token = await new SignJWT({
        sub: user.id,
        type: "password-reset",
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("10m")
        .sign(secret);

    return json({ success: true, token });
};
