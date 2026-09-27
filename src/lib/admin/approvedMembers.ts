/** 투표 후보·프리셋용 회원. 투표 권한(canVote)과 무관하다. */
export function filterApprovedMembersForCandidates(members: any[]): any[] {
    return members.filter(
        (m) =>
            (m.status === "approved" && !m.isAdmin) ||
            (m.status === "pending" && m.passwordHash === null),
    );
}
