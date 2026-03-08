import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals, fetch, url }) => {
    // 관리자 권한 확인
    if (!locals.user?.isAdmin) {
        throw redirect(302, locals.user ? "/" : "/login");
    }

    // 회원 목록 가져오기
    const membersRes = await fetch("/api/members");
    const members = membersRes.ok ? await membersRes.json() : [];

    // URL 파라미터에서 필터 확인
    const filter = url.searchParams.get("filter");

    return {
        user: locals.user,
        members,
        filter,
    };
};
