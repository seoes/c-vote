import type { RequestHandler } from "./$types";
import { json, error } from "@sveltejs/kit";
import { getDb, votes, voteRecords, members, candidates } from "$lib/db";
import { eq, or, and, desc } from "drizzle-orm";
import { cuid2 } from "$lib/utils/cuid";

export const GET: RequestHandler = async ({ url, platform, locals }) => {
    if (!locals.user) {
        throw error(401, "Authentication required");
    }

    const env = platform?.env;
    if (!env) {
        throw new Error("Environment not available. Run with 'wrangler dev'");
    }

    const db = getDb(env.DB);
    const status = url.searchParams.get("status") as "active" | "ended" | null;

    const now = new Date();

    // 투표 목록 조회
    let allVotes = await db.select().from(votes).orderBy(desc(votes.createdAt));

    // 상태 필터링
    if (status === "active") {
        allVotes = allVotes.filter((v) => v.status === "active" && v.endTime > now);
    } else if (status === "ended") {
        allVotes = allVotes.filter((v) => v.status === "ended" || v.endTime <= now);
    }

    // 각 투표의 참여자 수 조회
    const votesWithParticipants = await Promise.all(
        allVotes.map(async (vote) => {
            const records = await db.select().from(voteRecords).where(eq(voteRecords.voteId, vote.id));
            const participantCount = records.length;

            // 사용자가 이미 투표했는지 확인
            const userVoted = records.some((r) => r.memberId === locals.user!.id);

            return {
                ...vote,
                participantCount,
                userVoted,
            };
        }),
    );

    return json(votesWithParticipants);
};

export const POST: RequestHandler = async ({ request, platform, locals }) => {
    // 관리자 권한 확인
    if (!locals.user?.isAdmin) {
        throw error(403, "Admin access required");
    }

    const env = platform?.env;
    if (!env) {
        throw new Error("Environment not available. Run with 'wrangler dev'");
    }

    const db = getDb(env.DB);
    const body = await request.json();

    const { title, description, voteType, maxSelections, pin, endTime, customCandidates } = body;

    // 유효성 검사
    if (!title?.trim() || !voteType || !pin || !endTime) {
        throw error(400, "Required fields missing");
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        throw error(400, "PIN must be 4 digits");
    }

    if (!["pastor", "elder", "general"].includes(voteType)) {
        throw error(400, "Invalid vote type");
    }

    // 투표 생성
    const voteId = cuid2();

    await db.insert(votes).values({
        id: voteId,
        title: title.trim(),
        description: description?.trim() || null,
        voteType,
        maxSelections: maxSelections || 5,
        pin,
        endTime: new Date(endTime),
        status: "active",
    });

    // 일반의제인 경우 커스텀 후보 등록
    if (voteType === "general" && customCandidates?.length > 0) {
        const candidateValues = customCandidates.map((c: { name: string; church?: string }, index: number) => ({
            id: cuid2(),
            voteId,
            name: c.name,
            church: c.church || null,
            order: index,
        }));

        await db.insert(candidates).values(candidateValues);
    }

    return json({ success: true, voteId });
};
