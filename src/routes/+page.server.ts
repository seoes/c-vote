import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, fetch }) => {
    // 로그인 확인
    if (!locals.user) {
        return {
            user: null,
            votes: [],
        };
    }

    // 사용자 상세 정보 가져오기
    const userRes = await fetch("/api/auth/me");
    const user = userRes.ok ? await userRes.json() : null;

    // 투표 목록 가져오기
    const votesRes = await fetch("/api/votes");
    const votes = votesRes.ok ? await votesRes.json() : [];

    return {
        user,
        votes,
    };
};
