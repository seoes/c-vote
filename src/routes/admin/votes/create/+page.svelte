<script lang="ts">
    import type { PageData } from "./$types";
    import { goto } from "$app/navigation";
    import { VOTE_TYPES, VOTE_TYPE_LABELS, type VoteType } from "$lib/types";

    let { data }: { data: PageData } = $props();

    // 폼 상태
    let title = $state("");
    let description = $state("");
    let voteType = $state<VoteType>("general");
    let maxSelections = $state(5);
    let resultDisplayCount = $state(10);
    let pin = $state("");
    let endHours = $state(2);
    let selectedMemberIds = $state<string[]>([]);
    let searchQuery = $state("");

    let error = $state("");
    let loading = $state(false);
    let step = $state<1 | 2 | 3>(1);

    // 투표 유형에 따른 후보자 필터링
    const candidateMembers = $derived(() => {
        // canVote가 true인 회원만 후보 목록에 포함
        let list = data.approvedMembers.filter(
            (m: any) => m.canVote !== false || (m.status === "pending" && m.passwordHash === null),
        );

        if (voteType === "pastor") {
            // 목사 선출: 목사 직분인 회원만
            list = list.filter((m: any) => m.position === "목사");
        } else if (voteType === "elder") {
            // 장로 선출: 장로 직분인 회원만
            list = list.filter((m: any) => m.position === "장로");
        }
        // general: 모든 회원

        return list;
    });

    // 검색 필터링된 회원 목록
    const filteredMembers = $derived(() => {
        const candidates = candidateMembers();
        if (!searchQuery.trim()) return candidates;
        const query = searchQuery.trim().toLowerCase();
        return candidates.filter(
            (m: any) => m.name.toLowerCase().includes(query) || m.church.toLowerCase().includes(query),
        );
    });

    // 선택된 회원 목록
    const selectedMembers = $derived(candidateMembers().filter((m: any) => selectedMemberIds.includes(m.id)));

    // 투표 유형 변경 시 선택된 후보 초기화
    $effect(() => {
        if (voteType) {
            selectedMemberIds = [];
        }
    });

    function toggleMember(memberId: string) {
        if (selectedMemberIds.includes(memberId)) {
            selectedMemberIds = selectedMemberIds.filter((id) => id !== memberId);
        } else {
            selectedMemberIds = [...selectedMemberIds, memberId];
        }
    }

    function selectAllMembers() {
        selectedMemberIds = candidateMembers().map((m: any) => m.id);
    }

    function deselectAllMembers() {
        selectedMemberIds = [];
    }

    function goToStep2() {
        error = "";

        if (!title.trim()) {
            error = "투표 제목을 입력해주세요.";
            return;
        }
        if (!pin || pin.length !== 4) {
            error = "PIN 번호는 4자리 숫자여야 합니다.";
            return;
        }
        if (maxSelections < 1) {
            error = "최소 1명 이상 선택 가능해야 합니다.";
            return;
        }
        if (endHours < 0.5) {
            error = "투표 시간은 최소 30분 이상이어야 합니다.";
            return;
        }

        step = 2;
    }

    function goToStep3() {
        error = "";

        // 모든 투표 유형에서 후보 선택 필요
        if (selectedMemberIds.length === 0) {
            error = "최소 1명 이상의 후보를 선택해주세요.";
            return;
        }
        if (selectedMemberIds.length < maxSelections) {
            error = `최대 선택 가능 수(${maxSelections}명)보다 후보가 적습니다.`;
            return;
        }

        step = 3;
    }

    async function handleCreate() {
        loading = true;
        error = "";

        try {
            // 종료 시간 계산
            const endTime = new Date(Date.now() + endHours * 60 * 60 * 1000);

            const body: any = {
                title: title.trim(),
                description: description.trim(),
                voteType,
                maxSelections,
                resultDisplayCount,
                pin,
                endTime: endTime.toISOString(),
            };

            // 모든 투표 유형에서 후보자 목록 추가
            body.candidateList = selectedMembers.map((m: any) => ({
                id: m.id,
                name: m.name,
                church: m.church,
            }));

            const res = await fetch("/api/votes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                goto("/admin/votes");
            } else {
                const result = await res.json();
                error = result.message || "투표 생성에 실패했습니다.";
            }
        } catch (e) {
            error = "서버 오류가 발생했습니다.";
        } finally {
            loading = false;
        }
    }

    function getVoteTypeLabel(type: VoteType): string {
        return VOTE_TYPE_LABELS[type];
    }
</script>

<svelte:head>
    <title>새 투표 만들기 - 노회 투표</title>
</svelte:head>

<div class="page-container page-container-wide">
    <div class="page-header">
        <h1 class="page-title">새 투표 만들기</h1>
        <p class="page-subtitle">
            {#if step === 1}
                1단계: 기본 정보 입력
            {:else if step === 2}
                2단계: 후보 선택
            {:else}
                3단계: 확인
            {/if}
        </p>
    </div>

    <!-- 진행 표시 -->
    <div class="flex items-center justify-center gap-2 mb-8">
        {#each [1, 2, 3] as s}
            <div
                class="w-10 h-10 rounded-full flex items-center justify-center font-bold
				{step >= s ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'}"
            >
                {s}
            </div>
            {#if s < 3}
                <div class="w-12 h-1 {step > s ? 'bg-primary-500' : 'bg-gray-200'}"></div>
            {/if}
        {/each}
    </div>

    {#if error}
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
        </div>
    {/if}

    {#if step === 1}
        <!-- 1단계: 기본 정보 -->
        <div class="card card-lg animate-fadeIn">
            <div class="form-group">
                <label class="label" for="title">투표 제목 *</label>
                <input
                    type="text"
                    id="title"
                    class="input input-lg"
                    placeholder="예: 제42대 노회장 선출"
                    bind:value={title}
                />
            </div>

            <div class="form-group">
                <label class="label" for="description">투표 설명</label>
                <input
                    type="text"
                    id="description"
                    class="input"
                    placeholder="예: 2025년도 노회장을 선출합니다."
                    bind:value={description}
                />
            </div>

            <div class="form-group">
                <label class="label" for="voteType">투표 종류 *</label>
                <select id="voteType" class="select" bind:value={voteType}>
                    {#each VOTE_TYPES as type}
                        <option value={type}>{getVoteTypeLabel(type)}</option>
                    {/each}
                </select>
                <p class="text-sm text-gray-500 mt-1">
                    {#if voteType === "pastor"}
                        목사선출: 목사 직분의 회원 중에서 후보를 선택합니다
                    {:else if voteType === "elder"}
                        장로선출: 장로 직분의 회원 중에서 후보를 선택합니다
                    {:else}
                        일반의제: 모든 회원 중에서 후보를 선택합니다
                    {/if}
                </p>
            </div>

            <div class="form-group">
                <label class="label" for="maxSelections">최대 선택 가능 수 (1인 N표) *</label>
                <div class="flex items-center gap-4">
                    <input
                        type="number"
                        id="maxSelections"
                        class="input"
                        style="max-width: 120px;"
                        min="1"
                        max="10"
                        bind:value={maxSelections}
                    />
                    <span class="text-gray-500">명까지 선택 가능</span>
                </div>
                <p class="text-sm text-gray-500 mt-1">선출할 인원 수를 설정하세요</p>
            </div>

            <div class="form-group">
                <label class="label" for="resultDisplayCount">결과 표시 수 *</label>
                <div class="flex items-center gap-4">
                    <input
                        type="number"
                        id="resultDisplayCount"
                        class="input"
                        style="max-width: 120px;"
                        min="1"
                        max="100"
                        bind:value={resultDisplayCount}
                    />
                    <span class="text-gray-500">명까지 결과 공개</span>
                </div>
                <p class="text-sm text-gray-500 mt-1">투표 종료 후 공개할 순위 수입니다</p>
            </div>

            <div class="form-group">
                <label class="label" for="pin">투표 비밀번호 (4자리 PIN) *</label>
                <input
                    type="text"
                    id="pin"
                    class="input font-mono text-xl tracking-widest"
                    style="max-width: 200px;"
                    maxlength="4"
                    placeholder="1234"
                    bind:value={pin}
                    oninput={(e) => {
                        const target = e.target as HTMLInputElement;
                        target.value = target.value.replace(/\D/g, "").slice(0, 4);
                        pin = target.value;
                    }}
                />
                <p class="text-sm text-gray-500 mt-1">투표 참여 시 입력해야 하는 비밀번호입니다</p>
            </div>

            <div class="form-group">
                <label class="label" for="endHours">투표 진행 시간</label>
                <div class="flex items-center gap-4">
                    <input
                        type="number"
                        id="endHours"
                        class="input"
                        style="max-width: 120px;"
                        min="0.5"
                        max="48"
                        step="0.5"
                        bind:value={endHours}
                    />
                    <span class="text-gray-500">시간 후 자동 종료</span>
                </div>
            </div>

            <div class="flex gap-3 mt-8">
                <a href="/admin/votes" class="btn btn-secondary flex-1">취소</a>
                <button class="btn btn-primary flex-1" onclick={goToStep2}> 다음 → </button>
            </div>
        </div>
    {:else if step === 2}
        <!-- 2단계: 후보 선택 -->
        <div class="card card-lg animate-fadeIn">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                    <span class="font-bold text-lg">후보 선택</span>
                    <span class="ml-2 text-primary-600 font-bold">
                        ({selectedMemberIds.length}명 선택됨)
                    </span>
                </div>
                <div class="flex gap-2">
                    <button class="btn btn-primary btn-sm" onclick={selectAllMembers}> ✓ 전체 선택 </button>
                    <button class="btn btn-secondary btn-sm" onclick={deselectAllMembers}> ✕ 전체 해제 </button>
                </div>
            </div>

            <p class="text-gray-500 mb-4">
                {#if voteType === "pastor"}
                    목사 직분의 회원({candidateMembers().length}명) 중에서 후보를 선택하세요.
                {:else if voteType === "elder"}
                    장로 직분의 회원({candidateMembers().length}명) 중에서 후보를 선택하세요.
                {:else}
                    승인된 회원({candidateMembers().length}명) 중에서 후보를 선택하세요.
                {/if}
            </p>

            <!-- 검색 -->
            <input type="text" class="input mb-4" placeholder="🔍 이름 또는 교회로 검색..." bind:value={searchQuery} />

            <!-- 회원 목록 -->
            <div class="max-h-96 overflow-y-auto border rounded-lg">
                {#each filteredMembers() as member, i}
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

            <div class="flex gap-3 mt-8">
                <button class="btn btn-secondary flex-1" onclick={() => (step = 1)}> ← 이전 </button>
                <button class="btn btn-primary flex-1" onclick={goToStep3}> 다음 → </button>
            </div>
        </div>
    {:else}
        <!-- 3단계: 확인 -->
        <div class="card card-lg animate-fadeIn">
            <h2 class="text-xl font-bold mb-6">투표 정보 확인</h2>

            <div class="space-y-4 mb-6">
                <div class="flex justify-between py-3 border-b">
                    <span class="text-gray-500">제목</span>
                    <span class="font-medium">{title}</span>
                </div>
                {#if description}
                    <div class="flex justify-between py-3 border-b">
                        <span class="text-gray-500">설명</span>
                        <span class="font-medium">{description}</span>
                    </div>
                {/if}
                <div class="flex justify-between py-3 border-b">
                    <span class="text-gray-500">투표 종류</span>
                    <span class="font-medium">{getVoteTypeLabel(voteType)}</span>
                </div>
                <div class="flex justify-between py-3 border-b">
                    <span class="text-gray-500">최대 선택 가능</span>
                    <span class="font-medium">{maxSelections}명</span>
                </div>
                <div class="flex justify-between py-3 border-b">
                    <span class="text-gray-500">결과 표시 수</span>
                    <span class="font-medium">{resultDisplayCount}명</span>
                </div>
                <div class="flex justify-between py-3 border-b">
                    <span class="text-gray-500">PIN 번호</span>
                    <span class="font-mono font-bold text-primary-600">{pin}</span>
                </div>
                <div class="flex justify-between py-3 border-b">
                    <span class="text-gray-500">진행 시간</span>
                    <span class="font-medium">{endHours}시간</span>
                </div>
                <div class="flex justify-between py-3 border-b">
                    <span class="text-gray-500">후보 수</span>
                    <span class="font-medium">
                        {selectedMemberIds.length}명
                    </span>
                </div>
            </div>

            {#if selectedMemberIds.length > 0}
                <div class="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 class="font-bold mb-3">선택된 후보 목록</h3>
                    <div class="max-h-48 overflow-y-auto">
                        <div class="flex flex-wrap gap-2">
                            {#each selectedMembers as member, i}
                                <span class="bg-white px-3 py-1 rounded-full border text-sm">
                                    {i + 1}. {member.name} ({member.church})
                                </span>
                            {/each}
                        </div>
                    </div>
                </div>
            {/if}

            <div class="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
                ⚠️ 투표가 생성되면 바로 시작됩니다. 정보를 다시 확인해주세요.
            </div>

            <div class="flex gap-3">
                <button class="btn btn-secondary flex-1" onclick={() => (step = 2)}> ← 이전 </button>
                <button class="btn btn-success flex-1" onclick={handleCreate} disabled={loading}>
                    {#if loading}
                        생성 중...
                    {:else}
                        ✓ 투표 생성
                    {/if}
                </button>
            </div>
        </div>
    {/if}
</div>
