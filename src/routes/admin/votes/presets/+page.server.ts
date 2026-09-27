import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals, fetch }) => {
    if (!locals.user?.isAdmin) {
        throw redirect(302, locals.user ? "/" : "/login");
    }

    const presetsRes = await fetch("/api/candidate-presets");
    const presets = presetsRes.ok ? await presetsRes.json() : [];

    return { user: locals.user, presets };
};
