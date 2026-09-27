import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { filterApprovedMembersForCandidates } from "$lib/admin/approvedMembers";

export const load: PageServerLoad = async ({ locals, fetch }) => {
    if (!locals.user?.isAdmin) {
        throw redirect(302, locals.user ? "/" : "/login");
    }

    const membersRes = await fetch("/api/members");
    const members = membersRes.ok ? await membersRes.json() : [];

    return {
        user: locals.user,
        approvedMembers: filterApprovedMembersForCandidates(members),
    };
};
