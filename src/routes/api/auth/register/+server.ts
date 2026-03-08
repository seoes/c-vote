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

    const { name, phone, password, church, sigchal, position } = body;

    // 유효성 검사
    if (!name?.trim() || !phone?.trim() || !password || !church?.trim() || !sigchal || !position) {
        throw error(400, "All fields are required");
    }

    // 전화번호 형식 검증 (010-0000-0000)
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
        throw error(400, "Invalid phone number format");
    }

    // 중복 확인
    const existing = await db.select().from(members).where(eq(members.phone, phone)).limit(1);
    if (existing.length > 0) {
        throw error(409, "Phone number already registered");
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
            sigchal,
            position,
            status: "pending",
            isAdmin: false,
        });

        return json({ success: true, message: "Registration successful. Waiting for approval." });
    } catch (e) {
        console.error("Registration error:", e);
        throw error(500, "Failed to register");
    }
};
