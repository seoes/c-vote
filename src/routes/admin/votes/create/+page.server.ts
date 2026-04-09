import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals, fetch }) => {
    // 관리자 권한 확인
    if (!locals.user?.isAdmin) {
        throw redirect(302, locals.user ? "/" : "/login");
    }

    // 승인된 회원 목록 가져오기 (후보자용)
    const membersRes = await fetch("/api/members");
    const members = membersRes.ok ? await membersRes.json() : [];
    // 관리자 제외, 승인된 회원만, 투표 가능한 회원만
    const approvedMembers = members.filter(
        (m: any) => m.status === "approved" && !m.isAdmin && m.canVote !== false,
    );

    return {
        user: locals.user,
        approvedMembers,
    };
};
