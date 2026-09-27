import type { PageServerLoad } from "./$types";
import { redirect, error } from "@sveltejs/kit";
import { filterApprovedMembersForCandidates } from "$lib/admin/approvedMembers";

export const load: PageServerLoad = async ({ locals, fetch, params }) => {
    if (!locals.user?.isAdmin) {
        throw redirect(302, locals.user ? "/" : "/login");
    }

    const presetRes = await fetch(`/api/candidate-presets/${params.id}`);
    if (!presetRes.ok) {
        throw error(404, "프리셋을 찾을 수 없습니다.");
    }
    const preset = await presetRes.json();

    const membersRes = await fetch("/api/members");
    const members = membersRes.ok ? await membersRes.json() : [];

    return {
        user: locals.user,
        approvedMembers: filterApprovedMembersForCandidates(members),
        preset,
    };
};
