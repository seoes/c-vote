import type { PageServerLoad } from "./$types";
import { redirect, error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals, params, fetch }) => {
    // 로그인 확인
    if (!locals.user) {
        throw redirect(302, "/login");
    }

    // 투표 결과 가져오기
    const resultsRes = await fetch(`/api/votes/${params.id}/results`);
    if (!resultsRes.ok) {
        throw error(404, "투표를 찾을 수 없습니다");
    }
    const results = await resultsRes.json();

    return {
        user: locals.user,
        results,
        totalMembers: results.totalVoters,
    };
};
