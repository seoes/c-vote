import type { RequestHandler } from "./$types";
import { json, error } from "@sveltejs/kit";
import { getDb, votes, voteRecords, voteSelections, candidates, members } from "$lib/db";
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

    // 투표 진행 중인지 확인 (status === 'active' AND endTime > now)
    const now = new Date();
    const isActiveVoting = vote.status === "active" && vote.endTime > now;

    // 참여자 수
    const records = await db.select().from(voteRecords).where(eq(voteRecords.voteId, voteId));
    const participantCount = records.length;

    // 전체 유권자 수 (승인된 회원 중 관리자 제외, canVote가 true인 회원만)
    const allMembers = await db
        .select()
        .from(members)
        .where(
            and(eq(members.status, "approved"), eq(members.isAdmin, false), eq(members.canVote, true)),
        );
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

    // 후보 정보와 결합 - 모든 투표 유형에서 candidates 테이블에서 조회
    const allCandidates = await db.select().from(candidates).where(eq(candidates.voteId, voteId));

    // memberId가 있는 후보(목사/장로 선출)와 없는 후보(일반의제) 구분
    const candidateMap = new Map(allCandidates.map((c) => [c.memberId || c.id, c]));

    let results: { candidateId: string; candidateName: string; church: string | null; count: number }[] = [];

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
        const id = candidate.memberId || candidate.id;
        if (!voteCounts.has(id)) {
            results.push({
                candidateId: id,
                candidateName: candidate.name,
                church: candidate.church,
                count: 0,
            });
        }
    }

    // 득표수로 정렬
    results.sort((a, b) => b.count - a.count);

    // 회원별 투표 여부 (모든 회원에게 공개)
    // 투표한 회원 ID 집합
    const votedMemberIds = new Set(records.map((r) => r.memberId));
    const votedAtMap = new Map(records.map((r) => [r.memberId, r.votedAt]));

    // canVote가 true인 회원만 투표 여부 표시
    const memberVoteStatus = allMembers
        .map((m) => ({
            id: m.id,
            name: m.name,
            church: m.church,
            sigchal: m.sigchal,
            position: m.position,
            hasVoted: votedMemberIds.has(m.id),
            votedAt: locals.user!.isAdmin ? (votedAtMap.get(m.id) || null) : null, // votedAt은 관리자만
        }))
        .sort((a, b) => {
            // 투표한 사람 먼저, 그 다음 이름순
            if (a.hasVoted !== b.hasVoted) {
                return a.hasVoted ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
        });

    // 진행 중이고 관리자가 아니면 결과 숨김
    const displayResults = isActiveVoting && !locals.user!.isAdmin ? [] : results.slice(0, vote.resultDisplayCount || 10);

    return json({
        vote: {
            id: vote.id,
            title: vote.title,
            description: vote.description,
            voteType: vote.voteType,
            status: vote.status,
            endTime: vote.endTime,
            resultDisplayCount: vote.resultDisplayCount || 10,
        },
        participantCount,
        totalVoters,
        participationRate: totalVoters > 0 ? Math.round((participantCount / totalVoters) * 100) : 0,
        results: displayResults,
        memberVoteStatus,
        isAdmin: locals.user!.isAdmin,
        isActiveVoting,
    });
};
