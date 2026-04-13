import type { RequestHandler } from "./$types";
import { json, error } from "@sveltejs/kit";
import { getDb, votes, voteRecords, members, candidates } from "$lib/db";
import { eq, or, and, desc } from "drizzle-orm";
import { cuid2 } from "$lib/utils/cuid";

export const GET: RequestHandler = async ({ url, platform, locals }) => {
    if (!locals.user) {
        throw error(401, "로그인이 필요합니다.");
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

            const candidateList = await db.select().from(candidates).where(eq(candidates.voteId, vote.id));
            const candidateCount = candidateList.length;

            // 사용자가 이미 투표했는지 확인
            const userVoted = records.some((r) => r.memberId === locals.user!.id);

            return {
                ...vote,
                participantCount,
                userVoted,
                candidateCount,
            };
        }),
    );

    return json(votesWithParticipants);
};

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

    const { title, description, voteType, maxSelections, resultDisplayCount, pin, endTime, candidateList } = body;

    // 유효성 검사
    if (!title?.trim() || !voteType || !pin || !endTime) {
        throw error(400, "필수 항목이 누락되었습니다. 제목, 투표 종류, PIN, 종료 시간을 확인해주세요.");
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        throw error(400, "PIN 번호는 4자리 숫자여야 합니다.");
    }

    if (!["pastor", "elder", "general"].includes(voteType)) {
        throw error(400, "올바르지 않은 투표 종류입니다.");
    }

    // 투표 생성
    const voteId = cuid2();

    await db.insert(votes).values({
        id: voteId,
        title: title.trim(),
        description: description?.trim() || null,
        voteType,
        maxSelections: maxSelections || 5,
        resultDisplayCount: resultDisplayCount || 10,
        pin,
        endTime: new Date(endTime),
        status: "active",
    });

    console.log(candidateList);

    // 후보 등록 (모든 투표 유형)
    if (candidateList?.length > 0) {
        const candidateValues = candidateList.map(
            (c: { id?: string; name: string; church?: string }, index: number) => ({
                id: cuid2(),
                voteId,
                memberId: c.id || null, // 목사/장로 선출 시 회원 ID 저장
                name: c.name,
                church: c.church || null,
                order: index,
            }),
        );
        const MAX_D1_PARAMS = 100;
        const PARAMS_PER_CANDIDATE = 6;
        const CHUNK_SIZE = Math.floor(MAX_D1_PARAMS / PARAMS_PER_CANDIDATE);

        for (let i = 0; i < candidateValues.length; i += CHUNK_SIZE) {
            const chunk = candidateValues.slice(i, i + CHUNK_SIZE);
            await db.insert(candidates).values(chunk);
            console.log("chunk", chunk);
        }
        console.log("candidateValues", candidateValues);
    }

    return json({ success: true, voteId });
};
