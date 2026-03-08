import type { RequestHandler } from "./$types";
import { json, error } from "@sveltejs/kit";
import { getDb, votes, voteRecords, voteSelections, members } from "$lib/db";
import { eq, and } from "drizzle-orm";
import { cuid2 } from "$lib/utils/cuid";

export const POST: RequestHandler = async ({ params, request, platform, locals }) => {
    if (!locals.user) {
        throw error(401, "Authentication required");
    }

    // 관리자는 투표할 수 없음
    if (locals.user.isAdmin) {
        throw error(403, "Administrators cannot vote");
    }

    const env = platform?.env;
    if (!env) {
        throw new Error("Environment not available. Run with 'wrangler dev'");
    }

    const db = getDb(env.DB);
    const voteId = params.id;
    const body = await request.json();

    const { pin, selectedCandidateIds } = body;

    // 투표 정보 조회
    const voteResult = await db.select().from(votes).where(eq(votes.id, voteId)).limit(1);

    if (voteResult.length === 0) {
        throw error(404, "Vote not found");
    }

    const vote = voteResult[0];

    console.log(body);
    console.log(vote);
    console.log(pin);
    console.log(vote.pin);
    console.log(vote.status);
    console.log(vote.endTime);
    console.log(vote.maxSelections);
    console.log(vote.maxSelections);

    // 투표 상태 확인
    const now = new Date();
    if (vote.status === "ended" || vote.endTime <= now) {
        throw error(400, "Vote has ended");
    }

    // PIN 확인
    if (pin !== vote.pin) {
        throw error(403, "Invalid PIN");
    }

    // 이미 투표했는지 확인
    const existingRecord = await db
        .select()
        .from(voteRecords)
        .where(and(eq(voteRecords.voteId, voteId), eq(voteRecords.memberId, locals.user.id)))
        .limit(1);

    if (existingRecord.length > 0) {
        throw error(400, "Already voted");
    }

    // 선택 수 확인
    if (!selectedCandidateIds || selectedCandidateIds.length === 0) {
        throw error(400, "No candidates selected");
    }

    if (selectedCandidateIds.length > vote.maxSelections) {
        throw error(400, `Maximum ${vote.maxSelections} selections allowed`);
    }

    // 투표 기록 생성
    const recordId = cuid2();
    const votedAt = new Date();

    // 투표 선택 저장 (감사용)
    const selectionValues = selectedCandidateIds.map((candidateId: string) => ({
        id: cuid2(),
        recordId,
        candidateId,
    }));

    // D1과 SQLite 모두 batch 지원 - 원자성 보장
    await db.batch([
        db.insert(voteRecords).values({
            id: recordId,
            voteId,
            memberId: locals.user.id,
            votedAt,
        }),
        db.insert(voteSelections).values(selectionValues),
    ]);

    return json({ success: true });
};
