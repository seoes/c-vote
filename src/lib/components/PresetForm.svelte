<script lang="ts">
    import { goto } from "$app/navigation";
    import MemberCandidatePicker from "$lib/components/MemberCandidatePicker.svelte";

    let {
        approvedMembers,
        presetId = null,
        initialName = "",
        initialMemberIds = [],
    }: {
        approvedMembers: any[];
        presetId?: string | null;
        initialName?: string;
        initialMemberIds?: string[];
    } = $props();

    let name = $state(initialName);
    let selectedMemberIds = $state<string[]>([...initialMemberIds]);
    let error = $state("");
    let loading = $state(false);

    async function handleSubmit() {
        error = "";
        if (!name.trim()) {
            error = "프리셋 이름을 입력해주세요.";
            return;
        }
        if (selectedMemberIds.length < 1) {
            error = "최소 1명 이상의 회원을 선택해주세요.";
            return;
        }

        loading = true;
        try {
            const url = presetId ? `/api/candidate-presets/${presetId}` : "/api/candidate-presets";
            const method = presetId ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim(), memberIds: selectedMemberIds }),
            });
            if (res.ok) {
                goto("/admin/votes/presets");
            } else {
                const result = await res.json();
                error = result.message || "저장에 실패했습니다.";
            }
        } catch {
            error = "서버 오류가 발생했습니다.";
        } finally {
            loading = false;
        }
    }
</script>

{#if error}
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
{/if}

<div class="form-group">
    <label class="label" for="presetName">프리셋 이름 *</label>
    <input
        type="text"
        id="presetName"
        class="input input-lg"
        placeholder="예: 2025 장로 후보 전체"
        bind:value={name}
    />
</div>

<MemberCandidatePicker members={approvedMembers} voteType="general" bind:selectedMemberIds />

<div class="flex gap-3 mt-8">
    <a href="/admin/votes/presets" class="btn btn-secondary flex-1">취소</a>
    <button type="button" class="btn btn-primary flex-1" onclick={handleSubmit} disabled={loading}>
        {loading ? "저장 중..." : presetId ? "수정 완료" : "프리셋 저장"}
    </button>
</div>
