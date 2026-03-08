import type { RequestHandler } from "./$types";
import { json, error } from "@sveltejs/kit";
import { getDb, votes, voteRecords, voteSelections, candidates, members } from "$lib/db";
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

    // 참여자 수
    const records = await db.select().from(voteRecords).where(eq(voteRecords.voteId, voteId));
    const participantCount = records.length;

    // 전체 유권자 수 (승인된 회원 중 관리자 제외)
    const allMembers = await db
        .select()
        .from(members)
        .where(and(eq(members.status, "approved"), eq(members.isAdmin, false)));
    const totalVoters = allMembers.length;

    // 득표 결과 집계
    // vote_selections에서 candidate_id별 count
    const selections = await db.select().from(voteSelections);

    // recordId로 voteId 필터링
    const recordIds = records.map((r) => r.id);
    const filteredSelections = selections.filter((s) => recordIds.includes(s.recordId));

    // 후보별 득표수 집계
    const voteCounts = new Map<string, number>();
    for (const selection of filteredSelections) {
        const count = voteCounts.get(selection.candidateId) || 0;
        voteCounts.set(selection.candidateId, count + 1);
    }

    // 후보 정보와 결합
    let results: { candidateId: string; candidateName: string; church: string | null; count: number }[] = [];

    if (vote.voteType === "pastor" || vote.voteType === "elder") {
        // 회원 ID로 매핑
        const memberMap = new Map(allMembers.map((m) => [m.id, m]));

        results = Array.from(voteCounts.entries())
            .map(([candidateId, count]) => {
                const member = memberMap.get(candidateId);
                if (!member) return null;
                return {
                    candidateId,
                    candidateName: member.name,
                    church: member.church,
                    count,
                };
            })
            .filter((r): r is NonNullable<typeof r> => r !== null)
            .sort((a, b) => b.count - a.count);

        // 0표 후보도 포함
        for (const member of allMembers) {
            if (!voteCounts.has(member.id)) {
                results.push({
                    candidateId: member.id,
                    candidateName: member.name,
                    church: member.church,
                    count: 0,
                });
            }
        }
    } else {
        // 일반의제: candidates 테이블에서 조회
        const allCandidates = await db.select().from(candidates).where(eq(candidates.voteId, voteId));

        const candidateMap = new Map(allCandidates.map((c) => [c.id, c]));

        results = Array.from(voteCounts.entries())
            .map(([candidateId, count]) => {
                const candidate = candidateMap.get(candidateId);
                if (!candidate) return null;
                return {
                    candidateId,
                    candidateName: candidate.name,
                    church: candidate.church,
                    count,
                };
            })
            .filter((r): r is NonNullable<typeof r> => r !== null)
            .sort((a, b) => b.count - a.count);

        // 0표 후보도 포함
        for (const candidate of allCandidates) {
            if (!voteCounts.has(candidate.id)) {
                results.push({
                    candidateId: candidate.id,
                    candidateName: candidate.name,
                    church: candidate.church,
                    count: 0,
                });
            }
        }
    }

    // 득표수로 정렬
    results.sort((a, b) => b.count - a.count);

    // 관리자용: 회원별 투표 여부
    let memberVoteStatus: {
        id: string;
        name: string;
        church: string;
        sigchal: string;
        position: string | null;
        hasVoted: boolean;
        votedAt: Date | null;
    }[] = [];

    if (locals.user.isAdmin) {
        // 투표한 회원 ID 집합
        const votedMemberIds = new Set(records.map((r) => r.memberId));
        const votedAtMap = new Map(records.map((r) => [r.memberId, r.votedAt]));

        memberVoteStatus = allMembers
            .map((m) => ({
                id: m.id,
                name: m.name,
                church: m.church,
                sigchal: m.sigchal,
                position: m.position,
                hasVoted: votedMemberIds.has(m.id),
                votedAt: votedAtMap.get(m.id) || null,
            }))
            .sort((a, b) => {
                // 투표한 사람 먼저, 그 다음 이름순
                if (a.hasVoted !== b.hasVoted) {
                    return a.hasVoted ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
            });
    }

    return json({
        vote: {
            id: vote.id,
            title: vote.title,
            description: vote.description,
            voteType: vote.voteType,
            status: vote.status,
            endTime: vote.endTime,
        },
        participantCount,
        totalVoters,
        participationRate: totalVoters > 0 ? Math.round((participantCount / totalVoters) * 100) : 0,
        results: results.slice(0, 10), // 상위 10명만
        memberVoteStatus, // 관리자용 회원별 투표 여부
        isAdmin: locals.user.isAdmin,
    });
};
