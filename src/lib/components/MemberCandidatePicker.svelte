<script lang="ts">
    import type { VoteType } from "$lib/types";

    type MemberRow = { id: string; name: string; church: string; position?: string | null };

    let {
        members,
        voteType,
        selectedMemberIds = $bindable<string[]>([]),
    }: {
        members: MemberRow[];
        voteType: VoteType;
        selectedMemberIds?: string[];
    } = $props();

    let searchQuery = $state("");

    const filteredMembers = $derived(() => {
        if (!searchQuery.trim()) return members;
        const query = searchQuery.trim().toLowerCase();
        return members.filter(
            (m) => m.name.toLowerCase().includes(query) || m.church.toLowerCase().includes(query),
        );
    });

    function toggleMember(memberId: string) {
        if (selectedMemberIds.includes(memberId)) {
            selectedMemberIds = selectedMemberIds.filter((id) => id !== memberId);
        } else {
            selectedMemberIds = [...selectedMemberIds, memberId];
        }
    }

    function selectAllMembers() {
        selectedMemberIds = members.map((m) => m.id);
    }

    function deselectAllMembers() {
        selectedMemberIds = [];
    }
</script>

<div class="flex flex-wrap items-center justify-between gap-3 mb-4">
    <div>
        <span class="font-bold text-lg">후보 선택</span>
        <span class="ml-2 text-primary-600 font-bold"> ({selectedMemberIds.length}명 선택됨) </span>
    </div>
    <div class="flex gap-2">
        <button type="button" class="btn btn-primary btn-sm" onclick={selectAllMembers}> ✓ 전체 선택 </button>
        <button type="button" class="btn btn-secondary btn-sm" onclick={deselectAllMembers}> ✕ 전체 해제 </button>
    </div>
</div>

<p class="text-gray-500 mb-4">
    {#if voteType === "pastor"}
        목사 직분의 회원({members.length}명) 중에서 후보를 선택하세요.
    {:else if voteType === "elder"}
        장로 직분의 회원({members.length}명) 중에서 후보를 선택하세요.
    {:else}
        승인된 회원({members.length}명) 중에서 후보를 선택하세요.
    {/if}
</p>

<input type="text" class="input mb-4" placeholder="🔍 이름 또는 교회로 검색..." bind:value={searchQuery} />

<div class="max-h-96 overflow-y-auto border rounded-lg">
    {#each filteredMembers() as member}
        {@const isSelected = selectedMemberIds.includes(member.id)}
        <button
            type="button"
            class="w-full text-left px-4 py-3 flex items-center gap-3 border-b last:border-b-0 hover:bg-gray-50
                        {isSelected ? 'bg-primary-50' : ''}"
            onclick={() => toggleMember(member.id)}
        >
            <input
                type="checkbox"
                checked={isSelected}
                class="w-5 h-5 accent-primary-500"
                onclick={(e) => e.stopPropagation()}
                onchange={() => toggleMember(member.id)}
            />
            <div class="flex-1">
                <div class="font-medium">{member.name}</div>
                <div class="text-sm text-gray-500">{member.church} · {member.position}</div>
            </div>
        </button>
    {/each}
</div>

{#if filteredMembers().length === 0}
    <div class="text-center py-8 text-gray-500">
        {#if voteType === "pastor"}
            목사 직분의 회원이 없습니다
        {:else if voteType === "elder"}
            장로 직분의 회원이 없습니다
        {:else}
            검색 결과가 없습니다
        {/if}
    </div>
{/if}
