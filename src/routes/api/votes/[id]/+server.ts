import type { RequestHandler } from "./$types";
import { json, error } from "@sveltejs/kit";
import { getDb, votes, candidates, members, voteRecords } from "$lib/db";
import { eq, and } from "drizzle-orm";

export const GET: RequestHandler = async ({ params, platform, locals }) => {
    if (!locals.user) {
        throw error(401, "로그인이 필요합니다.");
    }

    const env = platform?.env;
    if (!env) {
        throw new Error("Environment not available. Run with 'wrangler dev'");
    }

    const db = getDb(env.DB);
    const voteId = params.id;

    // 투표 정보 조회
    const voteResult = await db.select().from(votes).where(eq(votes.id, voteId)).limit(1);

    if (voteResult.length === 0) {
        throw error(404, "투표를 찾을 수 없습니다.");
    }

    const vote = voteResult[0];

    // 후보 목록 조회 - 모든 투표 유형에서 candidates 테이블에서 조회
    const allCandidates = await db.select().from(candidates).where(eq(candidates.voteId, voteId));

    const candidateList = allCandidates.map((c) => ({
        id: c.memberId || c.id, // 목사/장로 선출은 memberId, 일반의제는 candidate id
        name: c.name,
        church: c.church,
    }));

    // 참여자 수
    const records = await db.select().from(voteRecords).where(eq(voteRecords.voteId, voteId));
    const participantCount = records.length;

    // 사용자가 이미 투표했는지 확인
    const userVoted = records.some((r) => r.memberId === locals.user!.id);

    return json({
        ...vote,
        candidates: candidateList,
        participantCount,
        userVoted,
    });
};
