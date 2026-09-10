<script lang="ts">
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    // 관리자 여부
    const isAdmin = $derived(data.user?.isAdmin ?? false);

    // 상태
    let selectedCandidates = $state<string[]>([]);
    let showConfirmModal = $state(false);
    let showAbstainModal = $state(false);
    let voteCompleted = $state(false);
    let shuffled = $state(false);
    let displayCandidates = $state<any[]>([]);

    // 후보자 목록 초기화
    $effect(() => {
        if (data.vote?.candidates) {
            displayCandidates = [...data.vote.candidates];
        }
    });

    // 이미 투표했는지 확인
    const alreadyVoted = $derived(data.vote?.hasVoted ?? false);

    // 투표 진행 중인지 확인
    const isActive = $derived(data.vote?.status === "active" && new Date(data.vote.endTime) > new Date());

    function toggleCandidate(candidateId: string) {
        if (!data.vote) return;

        if (selectedCandidates.includes(candidateId)) {
            selectedCandidates = selectedCandidates.filter((id) => id !== candidateId);
        } else {
            if (selectedCandidates.length >= data.vote.maxSelections) {
                // 최대 선택 수에 도달하면 가장 먼저 선택한 것 제거
                selectedCandidates = [...selectedCandidates.slice(1), candidateId];
            } else {
                selectedCandidates = [...selectedCandidates, candidateId];
            }
        }
    }

    function shuffleCandidates() {
        displayCandidates = [...displayCandidates].sort(() => Math.random() - 0.5);
        shuffled = true;
    }

    function resetOrder() {
        if (data.vote) {
            displayCandidates = [...data.vote.candidates];
            shuffled = false;
        }
    }

    function confirmVote() {
        if (selectedCandidates.length === 0) return;
        showConfirmModal = true;
    }

    function confirmAbstain() {
        showAbstainModal = true;
    }

    async function executeVote(isAbstain = false) {
        if (!data.vote) return;

        try {
            const res = await fetch(`/api/votes/${data.vote.id}/vote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    isAbstain,
                    selectedCandidateIds: isAbstain ? [] : selectedCandidates,
                }),
            });

            const result = await res.json();

            if (res.ok) {
                showConfirmModal = false;
                showAbstainModal = false;
                voteCompleted = true;
            } else {
                alert(result.message || "투표에 실패했습니다.");
            }
        } catch (e) {
            alert("서버 오류가 발생했습니다.");
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
</script>

<svelte:head>
    <title>{data.vote?.title || "투표"} - 노회 투표</title>
</svelte:head>

{#if !data.vote}
    <div class="page-container">
        <div class="card text-center py-12">
            <div class="text-6xl mb-4">❌</div>
            <h2 class="text-xl font-bold mb-2">투표를 찾을 수 없습니다</h2>
            <a href="/" class="btn btn-primary mt-4">돌아가기</a>
        </div>
    </div>
{:else if voteCompleted}
    <div class="page-container">
        <div class="card card-lg text-center animate-fadeIn">
            <div class="text-6xl mb-4">✅</div>
            <h2 class="text-2xl font-bold text-primary-700 mb-2">투표 완료</h2>
            <p class="text-gray-600 mb-6">투표해 주셔서 감사합니다.</p>
            <div class="flex flex-col gap-3">
                <a href="/vote/{data.vote.id}/result" class="btn btn-primary btn-lg">결과 보기</a>
                <a href="/" class="btn btn-secondary">목록으로</a>
            </div>
        </div>
    </div>
{:else if isAdmin}
    <div class="page-container">
        <div class="card card-lg text-center animate-fadeIn">
            <div class="text-6xl mb-4">🚫</div>
            <h2 class="text-2xl font-bold text-gray-700 mb-2">관리자는 투표할 수 없습니다</h2>
            <p class="text-gray-600 mb-6">관리자 계정은 투표에서 제외됩니다.</p>
            <div class="flex flex-col gap-3">
                <a href="/vote/{data.vote.id}/result" class="btn btn-primary btn-lg">현황 보기</a>
                <a href="/" class="btn btn-secondary">목록으로</a>
            </div>
        </div>
    </div>
{:else if alreadyVoted}
    <div class="page-container">
        <div class="card card-lg text-center animate-fadeIn">
            <div class="text-6xl mb-4">📋</div>
            <h2 class="text-2xl font-bold text-primary-700 mb-2">이미 투표하셨습니다</h2>
            <p class="text-gray-600 mb-6">이 투표에는 이미 참여하셨습니다.</p>
            <div class="flex flex-col gap-3">
                <a href="/vote/{data.vote.id}/result" class="btn btn-primary btn-lg">결과 보기</a>
                <a href="/" class="btn btn-secondary">목록으로</a>
            </div>
        </div>
    </div>
{:else if !isActive}
    <div class="page-container">
        <div class="card card-lg text-center animate-fadeIn">
            <div class="text-6xl mb-4">⏰</div>
            <h2 class="text-2xl font-bold text-gray-700 mb-2">투표가 종료되었습니다</h2>
            <p class="text-gray-600 mb-6">이 투표는 이미 종료되었습니다.</p>
            <div class="flex flex-col gap-3">
                <a href="/vote/{data.vote.id}/result" class="btn btn-primary btn-lg">결과 보기</a>
                <a href="/" class="btn btn-secondary">목록으로</a>
            </div>
        </div>
    </div>
{:else}
    <!-- 투표 화면 -->
    <div class="page-container page-container-wide">
        <div class="page-header">
            <h1 class="page-title">{data.vote.title}</h1>
            <div class="flex items-center justify-center gap-4 mt-2">
                <span class="badge badge-success">⏱️ {formatEndTime(data.vote.endTime)}</span>
                <span class="badge badge-info">👥 {data.vote.participantCount || 0}명 참여</span>
            </div>
        </div>

        <div class="card mb-4">
            <div class="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <span class="text-lg font-semibold">
                        {#if data.vote.maxSelections === 1}
                            1명을 선택하세요
                        {:else}
                            최대 {data.vote.maxSelections}명까지 선택 가능
                        {/if}
                    </span>
                    <span class="ml-2 text-primary-600 font-bold">
                        ({selectedCandidates.length}/{data.vote.maxSelections}명 선택됨)
                    </span>
                </div>
                <div class="flex gap-2">
                    <button class="btn btn-sm {shuffled ? 'btn-secondary' : 'btn-primary'}" onclick={shuffleCandidates}>
                        🔀 랜덤 배치
                    </button>
                    {#if shuffled}
                        <button class="btn btn-sm btn-secondary" onclick={resetOrder}>↩️ 원래대로</button>
                    {/if}
                </div>
            </div>
        </div>

        <div class="flex flex-col gap-3 mb-6">
            {#each displayCandidates as candidate, i}
                {@const isSelected = selectedCandidates.includes(candidate.id)}
                {@const selectionIndex = selectedCandidates.indexOf(candidate.id)}
                <button
                    type="button"
                    class="candidate-card text-left animate-fadeIn"
                    class:selected={isSelected}
                    style="animation-delay: {i * 0.02}s;"
                    onclick={() => toggleCandidate(candidate.id)}
                >
                    <div class="candidate-number">
                        {#if isSelected}
                            ✓
                        {:else}
                            {i + 1}
                        {/if}
                    </div>
                    <div class="candidate-info">
                        <div class="candidate-name">{candidate.name}</div>
                        <div class="candidate-church">{candidate.church}</div>
                    </div>
                    {#if isSelected && data.vote.maxSelections > 1}
                        <span class="badge badge-info">{selectionIndex + 1}번째</span>
                    {/if}
                </button>
            {/each}
        </div>

        <div class="sticky bottom-4 flex flex-col gap-2">
            <button
                class="btn btn-primary btn-lg btn-full shadow-lg"
                onclick={confirmVote}
                disabled={selectedCandidates.length === 0}
            >
                {#if selectedCandidates.length === 0}
                    후보를 선택하세요
                {:else}
                    투표하기 ({selectedCandidates.length}명 선택)
                {/if}
            </button>
            <button class="btn btn-secondary btn-lg btn-full" onclick={confirmAbstain}>기권하기</button>
        </div>
    </div>

    <!-- 투표 확인 모달 -->
    {#if showConfirmModal}
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
        <div
            class="modal-overlay"
            onclick={() => (showConfirmModal = false)}
            onkeydown={(e) => e.key === "Escape" && (showConfirmModal = false)}
            role="button"
            tabindex="-1"
        >
            <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
            <div
                class="modal animate-fadeIn"
                onclick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                tabindex="-1"
            >
                <div class="modal-header">
                    <h3 class="modal-title">투표 확인</h3>
                </div>
                <div class="modal-body">
                    <p class="text-gray-600 mb-4">다음 후보에게 투표하시겠습니까?</p>
                    <div class="flex flex-col gap-2">
                        {#each selectedCandidates as candidateId, i}
                            {@const candidate = data.vote.candidates.find((c: any) => c.id === candidateId)}
                            {#if candidate}
                                <div class="flex items-center gap-3 p-3 bg-primary-50 rounded-lg">
                                    <span class="font-bold text-primary-600">{i + 1}</span>
                                    <span class="font-medium">{candidate.name}</span>
                                    <span class="text-gray-500 text-sm">({candidate.church})</span>
                                </div>
                            {/if}
                        {/each}
                    </div>
                    <p class="text-red-600 font-medium mt-4 text-center">⚠️ 투표 후에는 수정할 수 없습니다</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick={() => (showConfirmModal = false)}>취소</button>
                    <button class="btn btn-primary" onclick={() => executeVote(false)}>투표하기</button>
                </div>
            </div>
        </div>
    {/if}

    <!-- 기권 확인 모달 -->
    {#if showAbstainModal}
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
        <div
            class="modal-overlay"
            onclick={() => (showAbstainModal = false)}
            onkeydown={(e) => e.key === "Escape" && (showAbstainModal = false)}
            role="button"
            tabindex="-1"
        >
            <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
            <div
                class="modal animate-fadeIn"
                onclick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                tabindex="-1"
            >
                <div class="modal-header">
                    <h3 class="modal-title">기권 확인</h3>
                </div>
                <div class="modal-body">
                    <p class="text-gray-600 mb-4">이 투표에서 기권하시겠습니까?</p>
                    <p class="text-red-600 font-medium text-center">⚠️ 기권은 참여로 기록되며, 이후 수정할 수 없습니다</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick={() => (showAbstainModal = false)}>취소</button>
                    <button class="btn btn-primary" onclick={() => executeVote(true)}>기권하기</button>
                </div>
            </div>
        </div>
    {/if}
{/if}
