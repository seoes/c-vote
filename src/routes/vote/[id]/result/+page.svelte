<script lang="ts">
    import type { PageData } from "./$types";

    interface MemberVoteStatus {
        id: string;
        name: string;
        church: string;
        sigchal: string;
        position: string | null;
        hasVoted: boolean;
        votedAt: Date | null;
    }

    let { data }: { data: PageData } = $props();

    // 상위 10명 결과
    const topResults = $derived(data.results?.results || []);

    // 전체 참여자 수
    const participantCount = $derived(data.results?.participantCount || 0);

    // 최대 득표수 (비율 계산용)
    const maxVotes = $derived(topResults.length > 0 ? topResults[0].count : 1);

    // 투표 종료 여부
    const isEnded = $derived(
        data.results?.vote?.status === "ended" || (data.results?.vote?.endTime && new Date(data.results.vote.endTime) <= new Date()),
    );

    // 관리자 여부
    const isAdmin = $derived(data.results?.isAdmin || false);

    // 회원별 투표 현황
    const memberVoteStatus = $derived((data.results?.memberVoteStatus || []) as MemberVoteStatus[]);

    // 탭 상태
    let activeTab = $state<"results" | "voters">("results");

    // 투표한 회원 / 안한 회원 필터
    const votedMembers = $derived(memberVoteStatus.filter((m) => m.hasVoted));
    const notVotedMembers = $derived(memberVoteStatus.filter((m) => !m.hasVoted));

    function formatDate(date: Date | string): string {
        const d = new Date(date);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }

    function refresh() {
        window.location.reload();
    }
</script>

<svelte:head>
    <title>{data.results?.vote?.title || "투표 결과"} - 노회 투표</title>
</svelte:head>

{#if !data.results}
    <div class="page-container">
        <div class="card text-center py-12">
            <div class="text-6xl mb-4">❌</div>
            <h2 class="text-xl font-bold mb-2">투표를 찾을 수 없습니다</h2>
            <a href="/" class="btn btn-primary mt-4">돌아가기</a>
        </div>
    </div>
{:else}
    <div class="page-container page-container-wide">
        <div class="page-header">
            <h1 class="page-title">{data.results.vote.title}</h1>
            <p class="page-subtitle">
                {#if isEnded}
                    최종 결과
                {:else}
                    실시간 현황 (상위 10명)
                {/if}
            </p>
        </div>

        <!-- 투표 정보 -->
        <div class="card mb-6">
            <div class="flex flex-wrap items-center justify-between gap-4">
                <div class="flex flex-wrap gap-4">
                    <div class="text-center">
                        <div class="text-3xl font-bold text-primary-600">{participantCount}</div>
                        <div class="text-sm text-gray-500">참여자</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-gray-400">{data.totalMembers}</div>
                        <div class="text-sm text-gray-500">전체 유권자</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-green-600">
                            {data.totalMembers > 0 ? Math.round((participantCount / data.totalMembers) * 100) : 0}%
                        </div>
                        <div class="text-sm text-gray-500">참여율</div>
                    </div>
                </div>
                {#if !isEnded}
                    <button class="btn btn-secondary" onclick={refresh}>🔄 새로고침</button>
                {/if}
            </div>
            <div class="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
                {#if isEnded}
                    <span>📅 {formatDate(data.results.vote.endTime)} 종료</span>
                {:else}
                    <span class="text-green-600 font-medium animate-pulse">● 투표 진행 중</span>
                    <span class="ml-3">종료 예정: {formatDate(data.results.vote.endTime)}</span>
                {/if}
            </div>
        </div>

        <!-- 결과 목록 -->
        {#if isAdmin}
            <div class="tabs mb-4">
                <button class="tab" class:active={activeTab === "results"} onclick={() => (activeTab = "results")}>
                    📊 득표 결과
                </button>
                <button class="tab" class:active={activeTab === "voters"} onclick={() => (activeTab = "voters")}>
                    👥 투표 현황 ({votedMembers.length}/{memberVoteStatus.length})
                </button>
            </div>
        {/if}

        {#if activeTab === "results"}
            <div class="card card-lg">
                <h2 class="text-xl font-bold mb-6">
                    {#if isEnded}
                        📊 최종 결과 (상위 10명)
                    {:else}
                        📊 현재 현황 (상위 10명)
                    {/if}
                </h2>

            {#if topResults.length === 0}
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <p class="empty-state-text">아직 투표 결과가 없습니다</p>
                </div>
            {:else}
                <div class="flex flex-col gap-4">
                    {#each topResults as result, i}
                        {@const percentage = maxVotes > 0 ? (result.count / maxVotes) * 100 : 0}
                        <div class="animate-fadeIn" style="animation-delay: {i * 0.05}s;">
                            <div class="flex items-center gap-4 mb-2">
                                <div
                                    class="flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg
									{i === 0 ? 'bg-yellow-400 text-yellow-900' : ''}
									{i === 1 ? 'bg-gray-300 text-gray-700' : ''}
									{i === 2 ? 'bg-orange-300 text-orange-800' : ''}
									{i > 2 ? 'bg-gray-100 text-gray-600' : ''}"
                                >
                                    {i + 1}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center justify-between mb-1">
                                        <div>
                                            <span class="font-semibold text-lg">{result.candidateName}</span>
                                            {#if result.church && result.church !== "-"}
                                                <span class="text-gray-500 ml-2">({result.church})</span>
                                            {/if}
                                        </div>
                                        <span class="font-bold text-primary-600 text-xl">{result.count}표</span>
                                    </div>
                                    <div class="result-bar">
                                        <div class="result-bar-fill" style="width: {percentage}%;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
            </div>
        {:else if activeTab === "voters"}
            <div class="card card-lg">
                <h2 class="text-xl font-bold mb-6">👥 회원별 투표 현황</h2>

                <!-- 요약 -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div class="text-center p-4 bg-green-50 rounded-lg">
                        <div class="text-2xl font-bold text-green-600">{votedMembers.length}</div>
                        <div class="text-sm text-gray-600">투표 완료</div>
                    </div>
                    <div class="text-center p-4 bg-red-50 rounded-lg">
                        <div class="text-2xl font-bold text-red-600">{notVotedMembers.length}</div>
                        <div class="text-sm text-gray-600">미투표</div>
                    </div>
                    <div class="text-center p-4 bg-gray-50 rounded-lg">
                        <div class="text-2xl font-bold text-gray-600">{memberVoteStatus.length}</div>
                        <div class="text-sm text-gray-600">전체 유권자</div>
                    </div>
                    <div class="text-center p-4 bg-primary-50 rounded-lg">
                        <div class="text-2xl font-bold text-primary-600">
                            {memberVoteStatus.length > 0 ? Math.round((votedMembers.length / memberVoteStatus.length) * 100) : 0}%
                        </div>
                        <div class="text-sm text-gray-600">참여율</div>
                    </div>
                </div>

                <!-- 투표한 회원 목록 -->
                <div class="mb-6">
                    <h3 class="font-bold text-lg mb-3 text-green-700">✅ 투표 완료 ({votedMembers.length}명)</h3>
                    {#if votedMembers.length === 0}
                        <p class="text-gray-500 text-sm">아직 투표한 회원이 없습니다.</p>
                    {:else}
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead>
                                    <tr class="border-b bg-gray-50">
                                        <th class="text-left p-3">이름</th>
                                        <th class="text-left p-3">교회</th>
                                        <th class="text-left p-3">시찰</th>
                                        <th class="text-left p-3">직분</th>
                                        <th class="text-left p-3">투표 시각</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each votedMembers as member, i}
                                        <tr class="border-b hover:bg-gray-50 animate-fadeIn" style="animation-delay: {i * 0.02}s;">
                                            <td class="p-3 font-medium">{member.name}</td>
                                            <td class="p-3">{member.church}</td>
                                            <td class="p-3">{member.sigchal}</td>
                                            <td class="p-3">{member.position || "-"}</td>
                                            <td class="p-3 text-gray-500">
                                                {#if member.votedAt}
                                                    {formatDate(member.votedAt)}
                                                {:else}
                                                    -
                                                {/if}
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    {/if}
                </div>

                <!-- 투표 안한 회원 목록 -->
                <div>
                    <h3 class="font-bold text-lg mb-3 text-red-700">❌ 미투표 ({notVotedMembers.length}명)</h3>
                    {#if notVotedMembers.length === 0}
                        <p class="text-gray-500 text-sm">모든 회원이 투표했습니다!</p>
                    {:else}
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead>
                                    <tr class="border-b bg-gray-50">
                                        <th class="text-left p-3">이름</th>
                                        <th class="text-left p-3">교회</th>
                                        <th class="text-left p-3">시찰</th>
                                        <th class="text-left p-3">직분</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each notVotedMembers as member, i}
                                        <tr class="border-b hover:bg-gray-50 animate-fadeIn" style="animation-delay: {i * 0.02}s;">
                                            <td class="p-3 font-medium">{member.name}</td>
                                            <td class="p-3">{member.church}</td>
                                            <td class="p-3">{member.sigchal}</td>
                                            <td class="p-3">{member.position || "-"}</td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    {/if}
                </div>
            </div>
        {/if}

        <div class="mt-6 flex gap-3">
            <a href="/" class="btn btn-secondary flex-1">목록으로</a>
            {#if !isEnded}
                <a href="/vote/{data.results.vote.id}" class="btn btn-primary flex-1">투표하기</a>
            {/if}
        </div>
    </div>
{/if}
