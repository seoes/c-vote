import type { RequestHandler } from "./$types";
import { json, error } from "@sveltejs/kit";
import { getDb, votes, voteRecords, voteSelections, members } from "$lib/db";
import { eq, and } from "drizzle-orm";
import { cuid2 } from "$lib/utils/cuid";

export const POST: RequestHandler = async ({ params, request, platform, locals }) => {
    if (!locals.user) {
        throw error(401, "로그인이 필요합니다.");
    }

    // 관리자는 투표할 수 없음
    if (locals.user.isAdmin) {
        throw error(403, "관리자는 투표에 참여할 수 없습니다.");
    }

    const env = platform?.env;
    if (!env) {
        throw new Error("Environment not available. Run with 'wrangler dev'");
    }

    const db = getDb(env.DB);
    const voteId = params.id;
    const body = await request.json();

    const { pin, selectedCandidateIds } = body;

    // 회원 정보 조회 - 투표 권한 확인
    const memberResult = await db.select().from(members).where(eq(members.id, locals.user.id)).limit(1);
    const member = memberResult[0];

    if (!member || member.canVote === false) {
        throw error(403, "현재 투표 권한이 없습니다. 관리자에게 문의해주세요.");
    }

    // 투표 정보 조회
    const voteResult = await db.select().from(votes).where(eq(votes.id, voteId)).limit(1);

    if (voteResult.length === 0) {
        throw error(404, "투표를 찾을 수 없습니다.");
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
        throw error(400, "이미 종료된 투표입니다.");
    }

    // PIN 확인
    if (pin !== vote.pin) {
        throw error(403, "투표 비밀번호가 올바르지 않습니다.");
    }

    // 이미 투표했는지 확인
    const existingRecord = await db
        .select()
        .from(voteRecords)
        .where(and(eq(voteRecords.voteId, voteId), eq(voteRecords.memberId, locals.user.id)))
        .limit(1);

    if (existingRecord.length > 0) {
        throw error(400, "이미 투표하셨습니다. 한 번 투표하면 다시 투표할 수 없습니다.");
    }

    // 선택 수 확인
    if (!selectedCandidateIds || selectedCandidateIds.length === 0) {
        throw error(400, "최소 1명 이상의 후보를 선택해주세요.");
    }

    if (selectedCandidateIds.length > vote.maxSelections) {
        throw error(400, `최대 ${vote.maxSelections}명까지 선택할 수 있습니다.`);
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
