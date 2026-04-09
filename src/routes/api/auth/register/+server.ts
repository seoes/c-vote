import type { RequestHandler } from "./$types";
import { json, error } from "@sveltejs/kit";
import { members, getDb } from "$lib/db";
import { hashPassword } from "$lib/auth/jwt";
import { eq } from "drizzle-orm";
import { cuid2 } from "$lib/utils/cuid";

export const POST: RequestHandler = async ({ request, platform }) => {
    const env = platform?.env;
    if (!env) {
        throw new Error("Environment not available. Run with 'wrangler dev'");
    }

    const db = getDb(env.DB);

    const body = await request.json();

    const { name, phone, password, church, region, sigchal, position, securityAnswer } = body;

    // 유효성 검사
    if (!name?.trim() || !phone?.trim() || !password || !church?.trim() || !sigchal || !position) {
        throw error(400, "모든 필수 항목을 입력해주세요.");
    }

    if (!securityAnswer?.trim()) {
        throw error(400, "성경인물 답변을 입력해주세요.");
    }

    // 전화번호 형식 검증 (010-0000-0000)
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
        throw error(400, "전화번호 형식이 올바르지 않습니다. (010-0000-0000)");
    }

    // 중복 확인
    const existing = await db.select().from(members).where(eq(members.phone, phone)).limit(1);
    if (existing.length > 0) {
        throw error(409, "이미 등록된 전화번호입니다.");
    }

    // 회원 생성
    const memberId = cuid2();
    const passwordHash = hashPassword(password);

    try {
        await db.insert(members).values({
            id: memberId,
            name: name.trim(),
            phone,
            passwordHash,
            church: church.trim(),
            region,
            sigchal,
            position,
            securityAnswer: securityAnswer.trim(),
            status: "pending",
            isAdmin: false,
        });

        return json({ success: true, message: "회원가입 신청이 완료되었습니다. 관리자 승인 후 이용할 수 있습니다." });
    } catch (e) {
        console.error("Registration error:", e);
        throw error(500, "회원가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
};
