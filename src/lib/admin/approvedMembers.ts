/** 투표 후보·프리셋용 승인 회원 목록 (create/+page.server.ts와 동일) */
export function filterApprovedMembersForCandidates(members: any[]): any[] {
    return members.filter(
        (m) =>
            (m.status === "approved" && !m.isAdmin && m.canVote !== false) ||
            (m.status === "pending" && m.passwordHash === null),
    );
}
