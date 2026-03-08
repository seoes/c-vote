import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals, fetch }) => {
    // 관리자 권한 확인
    if (!locals.user?.isAdmin) {
        throw redirect(302, locals.user ? "/" : "/login");
    }

    // 투표 목록 가져오기
    const votesRes = await fetch("/api/votes");
    const votes = votesRes.ok ? await votesRes.json() : [];

    // 구분
    const activeVotes = votes.filter((v: any) => v.status === "active" && new Date(v.endTime) > new Date());
    const endedVotes = votes.filter((v: any) => v.status === "ended" || new Date(v.endTime) <= new Date());

    return {
        user: locals.user,
        votes,
        activeVotes,
        endedVotes,
    };
};
