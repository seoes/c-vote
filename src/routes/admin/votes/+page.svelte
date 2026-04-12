<script lang="ts">
    import type { PageData } from "./$types";
    import { goto } from "$app/navigation";
    import { VOTE_TYPE_LABELS } from "$lib/types";

    let { data }: { data: PageData } = $props();

    let activeTab = $state<"active" | "ended">("active");

    function formatDate(date: Date | string): string {
        const d = new Date(date);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }

    async function handleEndVote(voteId: string, title: string) {
        if (confirm(`"${title}" 투표를 종료하시겠습니까?\n종료 후에는 더 이상 투표할 수 없습니다.`)) {
            try {
                const res = await fetch(`/api/votes/${voteId}/end`, { method: "PATCH" });
                if (res.ok) {
                    window.location.reload();
                } else {
                    alert("투표 종료에 실패했습니다.");
                }
            } catch (e) {
                alert("서버 오류가 발생했습니다.");
                console.error(e);
            }
        }
    }

    async function handleDeleteVote(voteId: string, title: string) {
        if (confirm(`"${title}" 투표를 삭제하시겠습니까?\n삭제 후에는 더 이상 투표할 수 없습니다.`)) {
            try {
                const res = await fetch(`/api/votes/${voteId}`, { method: "DELETE" });
                if (res.ok) {
                    window.location.reload();
                }
            } catch (e) {
                alert("서버 오류가 발생했습니다.");
                console.error(e);
            }
        }
    }

    function formatEndTime(date: Date | string): string {
        const d = new Date(date);
        const now = new Date();
        const diff = d.getTime() - now.getTime();

        if (diff <= 0) return "종료됨";

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}시간 ${minutes}분 남음`;
        }
        return `${minutes}분 남음`;
    }

    function getVoteTypeLabel(type: string): string {
        return VOTE_TYPE_LABELS[type as keyof typeof VOTE_TYPE_LABELS] || "일반";
    }
</script>

<svelte:head>
    <title>투표 관리 - 노회 투표</title>
</svelte:head>

<div class="page-container page-container-wide">
    <div class="page-header">
        <h1 class="page-title">투표 관리</h1>
        <p class="page-subtitle">투표 목록 조회 및 관리</p>
    </div>

    <!-- 새 투표 만들기 버튼 -->
    <div class="mb-6 flex justify-between gap-2">
        <a href="/admin/votes/create" class="btn btn-primary btn-lg">➕ 새 투표 만들기</a>
        <a href="/admin" class="btn btn-secondary">← 대시보드로</a>
    </div>

    <!-- 탭 -->
    <div class="tabs">
        <button class="tab" class:active={activeTab === "active"} onclick={() => (activeTab = "active")}>
            진행 중 ({data.activeVotes.length})
        </button>
        <button class="tab" class:active={activeTab === "ended"} onclick={() => (activeTab = "ended")}>
            종료 ({data.endedVotes.length})
        </button>
    </div>

    <!-- 투표 목록 -->
    {#if activeTab === "active"}
        {#if data.activeVotes.length === 0}
            <div class="card empty-state">
                <div class="empty-state-icon">🗳️</div>
                <p class="empty-state-text">진행 중인 투표가 없습니다</p>
                <a href="/admin/votes/create" class="btn btn-primary mt-4">새 투표 만들기</a>
            </div>
        {:else}
            <div class="flex flex-col gap-4">
                {#each data.activeVotes as vote, i (vote.id)}
                    <div class="card animate-fadeIn" style="animation-delay: {i * 0.05}s;">
                        <div class="flex items-start justify-between mb-3">
                            <div>
                                <h3 class="text-xl font-bold">{vote.title}</h3>
                                <p class="text-gray-500">{vote.description}</p>
                            </div>
                            <span class="badge badge-success">진행 중</span>
                        </div>

                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                            <div>
                                <div class="text-gray-500">참여자</div>
                                <div class="font-bold text-lg">{vote.participantCount || 0}명</div>
                            </div>
                            <div>
                                <div class="text-gray-500">후보 수</div>
                                <div class="font-bold text-lg">{vote.candidateCount || 0}명</div>
                            </div>
                            <div>
                                <div class="text-gray-500">최대 선택</div>
                                <div class="font-bold text-lg">{vote.maxSelections}명</div>
                            </div>
                            <div>
                                <div class="text-gray-500">남은 시간</div>
                                <div class="font-bold text-lg text-green-600">{formatEndTime(vote.endTime)}</div>
                            </div>
                        </div>

                        <div class="flex flex-wrap gap-2 mb-4">
                            <span class="badge badge-info">{getVoteTypeLabel(vote.voteType)}</span>
                            <span class="text-sm text-gray-500">
                                PIN: <span class="font-mono font-bold text-primary-600">{vote.pin}</span>
                            </span>
                        </div>

                        <div class="flex flex-wrap gap-2">
                            <a href="/vote/{vote.id}/result" class="btn btn-secondary btn-sm">📊 현황 보기</a>
                            <button class="btn btn-danger btn-sm" onclick={() => handleEndVote(vote.id, vote.title)}>
                                ⏹️ 투표 종료
                            </button>
                            <button class="btn btn-danger btn-sm" onclick={() => handleDeleteVote(vote.id, vote.title)}>
                                ❌ 투표 삭제
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    {:else if data.endedVotes.length === 0}
        <div class="card empty-state">
            <div class="empty-state-icon">📭</div>
            <p class="empty-state-text">종료된 투표가 없습니다</p>
        </div>
    {:else}
        <div class="flex flex-col gap-4">
            {#each data.endedVotes as vote, i (vote.id)}
                <div class="card animate-fadeIn" style="animation-delay: {i * 0.05}s;">
                    <div class="flex items-start justify-between mb-3">
                        <div>
                            <h3 class="text-xl font-bold">{vote.title}</h3>
                            <p class="text-gray-500">{vote.description}</p>
                        </div>
                        <span class="badge badge-warning">종료</span>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
                        <div>
                            <div class="text-gray-500">총 참여자</div>
                            <div class="font-bold text-lg">{vote.participantCount || 0}명</div>
                        </div>
                        <div>
                            <div class="text-gray-500">후보 수</div>
                            <div class="font-bold text-lg">{vote.candidateCount || 0}명</div>
                        </div>
                        <div>
                            <div class="text-gray-500">종료일</div>
                            <div class="font-bold">{formatDate(vote.endTime)}</div>
                        </div>
                    </div>

                    <a href="/vote/{vote.id}/result" class="btn btn-primary btn-sm">📊 결과 보기</a>
                    <button class="btn btn-danger btn-sm" onclick={() => handleDeleteVote(vote.id, vote.title)}>
                        ❌ 투표 삭제
                    </button>
                </div>
            {/each}
        </div>
    {/if}

    <div class="mt-6">
        <a href="/admin" class="btn btn-secondary">← 대시보드로</a>
    </div>
</div>
