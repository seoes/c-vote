import type { RequestHandler } from "./$types";
import { json, error } from "@sveltejs/kit";
import { getDb, candidatePresets, candidatePresetMembers, members } from "$lib/db";
import { eq, asc, desc, inArray } from "drizzle-orm";
import { cuid2 } from "$lib/utils/cuid";

const CHUNK_SIZE = 50;

async function assertValidMemberIds(db: ReturnType<typeof getDb>, memberIds: string[]) {
    const unique = [...new Set(memberIds)];
    if (unique.length === 0) return unique;

    const found = await db.select({ id: members.id }).from(members).where(inArray(members.id, unique));
    if (found.length !== unique.length) {
        throw error(400, "존재하지 않는 회원이 포함되어 있습니다.");
    }
    return unique;
}

async function insertPresetMembers(
    db: ReturnType<typeof getDb>,
    presetId: string,
    memberIds: string[],
) {
    const values = memberIds.map((memberId, index) => ({
        presetId,
        memberId,
        order: index,
    }));
    for (let i = 0; i < values.length; i += CHUNK_SIZE) {
        await db.insert(candidatePresetMembers).values(values.slice(i, i + CHUNK_SIZE));
    }
}

export const GET: RequestHandler = async ({ platform, locals }) => {
    if (!locals.user?.isAdmin) {
        throw error(403, "관리자 권한이 필요합니다.");
    }

    const env = platform?.env;
    if (!env) {
        throw new Error("Environment not available. Run with 'wrangler dev'");
    }

    const db = getDb(env.DB);
    const presets = await db.select().from(candidatePresets).orderBy(desc(candidatePresets.createdAt));

    const list = await Promise.all(
        presets.map(async (preset) => {
            const rows = await db
                .select({ memberId: candidatePresetMembers.memberId })
                .from(candidatePresetMembers)
                .where(eq(candidatePresetMembers.presetId, preset.id))
                .orderBy(asc(candidatePresetMembers.order));
            return {
                ...preset,
                memberCount: rows.length,
                memberIds: rows.map((r) => r.memberId),
            };
        }),
    );

    return json(list);
};

export const POST: RequestHandler = async ({ request, platform, locals }) => {
    if (!locals.user?.isAdmin) {
        throw error(403, "관리자 권한이 필요합니다.");
    }

    const env = platform?.env;
    if (!env) {
        throw new Error("Environment not available. Run with 'wrangler dev'");
    }

    const body = await request.json();
    const name = body.name?.trim();
    const memberIds: string[] = body.memberIds;

    if (!name) {
        throw error(400, "프리셋 이름을 입력해주세요.");
    }
    if (!Array.isArray(memberIds) || memberIds.length < 1) {
        throw error(400, "최소 1명 이상의 회원을 선택해주세요.");
    }

    const db = getDb(env.DB);
    const uniqueMemberIds = await assertValidMemberIds(db, memberIds);

    const presetId = cuid2();
    await db.insert(candidatePresets).values({ id: presetId, name });
    await insertPresetMembers(db, presetId, uniqueMemberIds);

    return json({ success: true, id: presetId });
};
