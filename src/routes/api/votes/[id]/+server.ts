import type { RequestHandler } from "./$types";
import { json, error } from "@sveltejs/kit";
import { getDb, votes, candidates, members, voteRecords } from "$lib/db";
import { eq, and } from "drizzle-orm";

export const GET: RequestHandler = async ({ params, platform, locals }) => {
    if (!locals.user) {
        throw error(401, "Authentication required");
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
        throw error(404, "Vote not found");
    }

    const vote = voteResult[0];

    // 후보 목록 조회 (목사/장로 선출은 관리자 제외한 승인 회원, 일반의제는 candidates 테이블)
    let candidateList: { id: string; name: string; church: string | null }[] = [];

    if (vote.voteType === "pastor" || vote.voteType === "elder") {
        // 승인된 회원 중 관리자 제외
        const allMembers = await db
            .select({
                id: members.id,
                name: members.name,
                church: members.church,
            })
            .from(members)
            .where(and(eq(members.status, "approved"), eq(members.isAdmin, false)));

        candidateList = allMembers;
    } else {
        // 일반의제: candidates 테이블에서 조회
        const allCandidates = await db.select().from(candidates).where(eq(candidates.voteId, voteId));

        candidateList = allCandidates.map((c) => ({
            id: c.id,
            name: c.name,
            church: c.church,
        }));
    }

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
