import type { RequestHandler } from "./$types";
import { json, error } from "@sveltejs/kit";
import { getDb, members } from "$lib/db";
import { eq } from "drizzle-orm";

export const POST: RequestHandler = async ({ request, platform }) => {
    const env = platform?.env;
    if (!env) {
        throw new Error("Environment not available. Run with 'wrangler dev'");
    }

    const db = getDb(env.DB);

    const body = await request.json();
    const { phone, name } = body;

    // 유효성 검사
    if (!phone?.trim()) {
        throw error(400, "전화번호를 입력해주세요.");
    }

    // 전화번호 형식 검증 (010-0000-0000)
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
        throw error(400, "전화번호 형식이 올바르지 않습니다. (010-0000-0000)");
    }

    // 전화번호로 회원 조회
    const existing = await db.select().from(members).where(eq(members.phone, phone)).limit(1);

    if (existing.length === 0) {
        // 신규 사용자
        return json({ status: "not_found" });
    }

    const member = existing[0];

    // 이미 정식 회원 (비밀번호 있음)
    if (member.passwordHash) {
        return json({ status: "member" });
    }

    // 후보자 계정 (비밀번호 없음) - 이름 확인
    if (name && member.name !== name.trim()) {
        throw error(400, "등록된 이름과 일치하지 않습니다.");
    }

    // 후보자 계정 정보 반환
    return json({
        status: "candidate",
        member: {
            id: member.id,
            name: member.name,
            church: member.church,
            sigchal: member.sigchal,
            position: member.position,
            region: member.region,
        },
    });
};
