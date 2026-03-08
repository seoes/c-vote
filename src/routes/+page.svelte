<script lang="ts">
    import { goto } from "$app/navigation";
    import { currentUser } from "$lib/stores";
    import type { PageData } from "./$types";
    import { onMount } from "svelte";

    let { data }: { data: PageData } = $props();

    // 클라이언트 스토어 동기화
    onMount(() => {
        if (data.user) {
            currentUser.set(data.user);
        }
    });

    // 로그인 리다이렉트
    onMount(() => {
        if (!data.user) {
            goto("/login");
        }
    });

    let activeTab = $state<"active" | "ended">("active");

    const activeVotes = $derived(
        (data.votes || []).filter((v: any) => v.status === "active" && new Date(v.endTime) > new Date()),
    );
    const endedVotes = $derived(
        (data.votes || []).filter((v: any) => v.status === "ended" || new Date(v.endTime) <= new Date()),
    );

    function formatEndTime(date: Date | string): string {
        const d = new Date(date);
        const now = new Date();
        const diff = d.getTime() - now.getTime();

        if (diff <= 0) return "종료됨";

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}시간 ${minutes}분 후 종료`;
        }
        return `${minutes}분 후 종료`;
    }

    function formatDate(date: Date | string): string {
        const d = new Date(date);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        currentUser.set(null);
        goto("/login");
    }
</script>

{#if data.user}
    <div class="page-container page-container-wide">
        <div class="page-header">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="page-title">투표 목록</h1>
                    <p class="page-subtitle">{data.user.name}님, 환영합니다</p>
                </div>
                <div class="flex items-center gap-3">
                    {#if data.user.isAdmin}
                        <a href="/admin" class="btn btn-secondary btn-sm">관리자</a>
                    {/if}
                    <button class="btn btn-secondary btn-sm" onclick={handleLogout}>로그아웃</button>
                </div>
            </div>
        </div>

        <div class="tabs">
            <button class="tab" class:active={activeTab === "active"} onclick={() => (activeTab = "active")}>
                진행 중 ({activeVotes.length})
            </button>
            <button class="tab" class:active={activeTab === "ended"} onclick={() => (activeTab = "ended")}>
                종료됨 ({endedVotes.length})
            </button>
        </div>

        {#if activeTab === "active"}
            {#if activeVotes.length === 0}
                <div class="empty-state card">
                    <div class="empty-state-icon">📭</div>
                    <p class="empty-state-text">현재 진행 중인 투표가 없습니다</p>
                </div>
            {:else}
                <div class="flex flex-col gap-4">
                    {#each activeVotes as vote, i}
                        <a
                            href="/vote/{vote.id}"
                            class="vote-card animate-fadeIn"
                            style="animation-delay: {i * 0.05}s;"
                        >
                            <div class="flex items-start justify-between mb-2">
                                <h2 class="vote-card-title">{vote.title}</h2>
                                <span class="badge badge-success">진행 중</span>
                            </div>
                            <p class="vote-card-desc">{vote.description || ""}</p>
                            <div class="vote-card-meta">
                                <span class="flex items-center gap-1">
                                    <span>⏱️</span>
                                    <span class="status-active font-medium">{formatEndTime(vote.endTime)}</span>
                                </span>
                                <span class="flex items-center gap-1">
                                    <span>👥</span>
                                    <span>{vote.participantCount || 0}명 참여</span>
                                </span>
                                <span class="flex items-center gap-1">
                                    <span>✋</span>
                                    <span>최대 {vote.maxSelections}명 선택</span>
                                </span>
                            </div>
                        </a>
                    {/each}
                </div>
            {/if}
        {:else if endedVotes.length === 0}
            <div class="empty-state card">
                <div class="empty-state-icon">📭</div>
                <p class="empty-state-text">종료된 투표가 없습니다</p>
            </div>
        {:else}
            <div class="flex flex-col gap-4">
                {#each endedVotes as vote, i}
                    <a
                        href="/vote/{vote.id}/result"
                        class="vote-card animate-fadeIn"
                        style="animation-delay: {i * 0.05}s;"
                    >
                        <div class="flex items-start justify-between mb-2">
                            <h2 class="vote-card-title">{vote.title}</h2>
                            <span class="badge badge-warning">종료</span>
                        </div>
                        <p class="vote-card-desc">{vote.description || ""}</p>
                        <div class="vote-card-meta">
                            <span class="flex items-center gap-1">
                                <span>📅</span>
                                <span class="text-gray-500">{formatDate(vote.endTime)} 종료</span>
                            </span>
                            <span class="flex items-center gap-1">
                                <span>👥</span>
                                <span>{vote.participantCount || 0}명 참여</span>
                            </span>
                        </div>
                    </a>
                {/each}
            </div>
        {/if}
    </div>
{/if}
