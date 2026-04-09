import type { RequestHandler } from "./$types";
import { json, error } from "@sveltejs/kit";
import { getDb, members } from "$lib/db";
import { eq } from "drizzle-orm";
import { cuid2 } from "$lib/utils/cuid";
import { REGIONS } from "$lib/region";
import { SIGCHALS, POSITIONS } from "$lib/db/schema";

export const POST: RequestHandler = async ({ request, platform, locals }) => {
    // 관리자 권한 확인
    if (!locals.user?.isAdmin) {
        throw error(403, "관리자 권한이 필요합니다.");
    }

    const env = platform?.env;
    if (!env) {
        throw new Error("Environment not available. Run with 'wrangler dev'");
    }

    const db = getDb(env.DB);

    const body = await request.json();
    const { name, phone, church, region, sigchal, position } = body;

    // 유효성 검사
    if (!name?.trim()) {
        throw error(400, "성명을 입력해주세요.");
    }
    if (!phone?.trim()) {
        throw error(400, "전화번호를 입력해주세요.");
    }
    if (!church?.trim()) {
        throw error(400, "소속교회를 입력해주세요.");
    }
    if (!sigchal) {
        throw error(400, "소속시찰을 선택해주세요.");
    }
    if (!position) {
        throw error(400, "직분을 선택해주세요.");
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

    // 후보자 계정 생성 (passwordHash = null, canVote = false, status = 'pending')
    const memberId = cuid2();

    try {
        await db.insert(members).values({
            id: memberId,
            name: name.trim(),
            phone,
            passwordHash: null, // 비밀번호 없음 - 후보자 계정
            church: church.trim(),
            region: region || REGIONS[0],
            sigchal: sigchal as typeof SIGCHALS[number],
            position: position as typeof POSITIONS[number],
            securityAnswer: null,
            status: "pending",
            isAdmin: false,
            canVote: false, // 투표 권한 없음
        });

        return json({ success: true, message: "후보자가 등록되었습니다." });
    } catch (e) {
        console.error("Pre-registration error:", e);
        throw error(500, "후보자 등록 중 오류가 발생했습니다.");
    }
};
