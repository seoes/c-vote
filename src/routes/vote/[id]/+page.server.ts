import type { PageServerLoad } from "./$types";
import { redirect, error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals, params, fetch }) => {
    // 로그인 확인
    if (!locals.user) {
        throw redirect(302, "/login");
    }

    // 투표 상세 정보 가져오기
    const voteRes = await fetch(`/api/votes/${params.id}`);
    if (!voteRes.ok) {
        throw error(404, "투표를 찾을 수 없습니다");
    }
    const vote = await voteRes.json();

    // 이미 투표했으면 결과 페이지로 리다이렉트
    if (vote.userVoted) {
        throw redirect(302, `/vote/${params.id}/result`);
    }

    return {
        user: locals.user,
        vote,
    };
};
