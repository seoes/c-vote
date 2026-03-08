import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals, fetch }) => {
    // 관리자 권한 확인
    if (!locals.user?.isAdmin) {
        throw redirect(302, locals.user ? "/" : "/login");
    }

    // 회원 목록 가져오기
    const membersRes = await fetch("/api/members");
    const members = membersRes.ok ? await membersRes.json() : [];

    // 투표 목록 가져오기
    const votesRes = await fetch("/api/votes");
    const votes = votesRes.ok ? await votesRes.json() : [];

    // 통계 계산
    const pendingMembers = members.filter((m: any) => m.status === "pending");
    const approvedMembers = members.filter((m: any) => m.status === "approved");
    const activeVotes = votes.filter((v: any) => v.status === "active" && new Date(v.endTime) > new Date());
    const endedVotes = votes.filter((v: any) => v.status === "ended" || new Date(v.endTime) <= new Date());

    return {
        user: locals.user,
        members,
        votes,
        pendingMembers,
        approvedMembers,
        activeVotes,
        endedVotes,
    };
};
