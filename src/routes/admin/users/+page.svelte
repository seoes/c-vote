<script lang="ts">
    import type { PageData } from "./$types";
    import { page } from "$app/stores";
    import { SIGCHALS, POSITIONS, type Sigchal, type Position } from "$lib/types";
    import { REGIONS } from "$lib/region";

    let { data }: { data: PageData } = $props();

    // URL 파라미터로 필터 확인
    let activeTab = $state<"all" | "pending" | "approved" | "pre-registered">("all");

    $effect(() => {
        if (data.filter === "pending") {
            activeTab = "pending";
        }
    });

    // 검색어
    let searchQuery = $state("");

    // 회원 목록 (반응형)
    let membersList = $state(data.members);

    // 후보자 등록 모달 상태
    let showPreRegisterModal = $state(false);
    let preRegisterLoading = $state(false);
    let preRegisterError = $state("");
    let preRegisterForm = $state({
        name: "",
        phone: "",
        church: "",
        region: REGIONS[0],
        sigchal: SIGCHALS[0] as Sigchal,
        position: POSITIONS[0] as Position,
    });

    // 후보자 목록 (passwordHash가 null인 계정)
    const preRegisteredMembers = $derived(membersList.filter((m: any) => m.passwordHash === null && !m.isAdmin));

    // 정식 회원 목록 (passwordHash가 있는 계정)
    const regularMembers = $derived(membersList.filter((m: any) => m.passwordHash !== null && !m.isAdmin));

    // 필터링된 회원 목록
    const filteredMembers = $derived(() => {
        let list = membersList.filter((m: any) => !m.isAdmin);

        // 탭 필터
        if (activeTab === "pending") {
            list = list.filter((m: any) => m.status === "pending" && m.passwordHash !== null);
        } else if (activeTab === "approved") {
            list = list.filter((m: any) => m.status === "approved");
        } else if (activeTab === "pre-registered") {
            list = list.filter((m: any) => m.passwordHash === null);
        }

        // 검색 필터
        if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase();
            list = list.filter(
                (m: any) =>
                    m.name.toLowerCase().includes(query) ||
                    m.church.toLowerCase().includes(query) ||
                    m.phone.includes(query),
            );
        }

        return list;
    });

    // 통계
    const pendingMembers = $derived(membersList.filter((m: any) => m.status === "pending" && m.passwordHash !== null));
    const approvedMembers = $derived(membersList.filter((m: any) => m.status === "approved" && !m.isAdmin));

    function formatDate(date: Date | string): string {
        const d = new Date(date);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
    }

    function formatPhone(value: string): string {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }

    function handlePhoneInput(e: Event) {
        const target = e.target as HTMLInputElement;
        preRegisterForm.phone = formatPhone(target.value);
    }

    async function handleApprove(memberId: string) {
        try {
            const res = await fetch(`/api/members/${memberId}/approve`, { method: "PATCH" });
            if (res.ok) {
                window.location.reload();
            } else {
                alert("승인에 실패했습니다.");
            }
        } catch (e) {
            alert("서버 오류가 발생했습니다.");
        }
    }

    async function handleReject(memberId: string) {
        if (confirm("정말 이 회원의 가입을 거절하시겠습니까?")) {
            try {
                const res = await fetch(`/api/members/${memberId}/reject`, { method: "PATCH" });
                if (res.ok) {
                    window.location.reload();
                } else {
                    alert("거절에 실패했습니다.");
                }
            } catch (e) {
                alert("서버 오류가 발생했습니다.");
            }
        }
    }

    async function handleDelete(memberId: string, memberName: string) {
        if (confirm(`정말 '${memberName}' 회원을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
            try {
                const res = await fetch(`/api/members/${memberId}`, { method: "DELETE" });
                if (res.ok) {
                    window.location.reload();
                } else {
                    alert("삭제에 실패했습니다.");
                }
            } catch (e) {
                alert("서버 오류가 발생했습니다.");
            }
        }
    }

    async function toggleCanVote(memberId: string, currentValue: boolean) {
        try {
            const res = await fetch(`/api/members/${memberId}/can-vote`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ canVote: !currentValue }),
            });
            if (res.ok) {
                // 로컬 상태 업데이트
                membersList = membersList.map((m: any) => (m.id === memberId ? { ...m, canVote: !currentValue } : m));
            } else {
                alert("투표 권한 변경에 실패했습니다.");
            }
        } catch (e) {
            alert("서버 오류가 발생했습니다.");
        }
    }

    async function setAllCanVote(canVote: boolean) {
        const action = canVote ? "전체 투표 가능" : "전체 투표 불가";
        if (confirm(`정말 모든 승인된 회원을 '${action}'으로 설정하시겠습니까?`)) {
            try {
                // 승인된 회원들의 ID 목록
                const approvedIds = membersList
                    .filter((m: any) => m.status === "approved" && !m.isAdmin)
                    .map((m: any) => m.id);

                // 병렬로 요청
                const promises = approvedIds.map((id: string) =>
                    fetch(`/api/members/${id}/can-vote`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ canVote }),
                    }),
                );

                await Promise.all(promises);
                window.location.reload();
            } catch (e) {
                alert("일괄 설정에 실패했습니다.");
            }
        }
    }

    function openPreRegisterModal() {
        preRegisterForm = {
            name: "",
            phone: "",
            church: "",
            region: REGIONS[0],
            sigchal: SIGCHALS[0] as Sigchal,
            position: POSITIONS[0] as Position,
        };
        preRegisterError = "";
        showPreRegisterModal = true;
    }

    async function handlePreRegister(e: Event) {
        e.preventDefault();
        preRegisterError = "";
        preRegisterLoading = true;

        // 유효성 검사
        if (!preRegisterForm.name.trim()) {
            preRegisterError = "성명을 입력해주세요.";
            preRegisterLoading = false;
            return;
        }
        if (!preRegisterForm.phone.trim() || preRegisterForm.phone.replace(/-/g, "").length < 10) {
            preRegisterError = "전화번호를 정확히 입력해주세요.";
            preRegisterLoading = false;
            return;
        }
        if (!preRegisterForm.church.trim()) {
            preRegisterError = "소속교회를 입력해주세요.";
            preRegisterLoading = false;
            return;
        }

        try {
            const res = await fetch("/api/members/pre-register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(preRegisterForm),
            });

            const data = await res.json();

            if (!res.ok) {
                preRegisterError = data.message || "후보자 등록에 실패했습니다.";
                preRegisterLoading = false;
                return;
            }

            showPreRegisterModal = false;
            window.location.reload();
        } catch (e) {
            preRegisterError = "서버 오류가 발생했습니다.";
        } finally {
            preRegisterLoading = false;
        }
    }
</script>

<svelte:head>
    <title>회원 관리 - 노회 투표</title>
</svelte:head>

<div class="page-container page-container-wider">
    <div class="page-header">
        <h1 class="page-title">회원 관리</h1>
        <p class="page-subtitle">회원 목록 조회 및 승인</p>
    </div>

    <div class="mb-6 flex justify-end">
        <a href="/admin" class="btn btn-secondary">← 대시보드로</a>
    </div>

    <!-- 탭 -->
    <div class="tabs mb-6">
        <button class="tab" class:active={activeTab === "all"} onclick={() => (activeTab = "all")}>
            전체 ({data.members.filter((m: any) => !m.isAdmin).length})
        </button>
        <button class="tab" class:active={activeTab === "pending"} onclick={() => (activeTab = "pending")}>
            대기 ({pendingMembers.length})
        </button>
        <button class="tab" class:active={activeTab === "approved"} onclick={() => (activeTab = "approved")}>
            승인 ({approvedMembers.filter((m: any) => !m.isAdmin).length})
        </button>
        <button
            class="tab"
            class:active={activeTab === "pre-registered"}
            onclick={() => (activeTab = "pre-registered")}
        >
            후보자 ({preRegisteredMembers.length})
        </button>
    </div>

    <!-- 검색 & 후보자 등록 버튼 -->
    <div class="flex gap-3 mb-4 flex-wrap">
        <div class="flex-1 min-w-48">
            <input type="text" class="input" placeholder="🔍 이름, 교회, 전화번호로 검색..." bind:value={searchQuery} />
        </div>
        <button class="btn btn-primary" onclick={openPreRegisterModal}>+ 후보자 미리 등록</button>
    </div>

    <!-- 일괄 투표 권한 설정 버튼 -->
    {#if activeTab === "approved" || activeTab === "all"}
        <div class="flex gap-2 mb-4">
            <button class="btn btn-success btn-sm" onclick={() => setAllCanVote(true)}> 전체 투표 가능 </button>
            <button class="btn btn-secondary btn-sm" onclick={() => setAllCanVote(false)}> 전체 투표 불가 </button>
        </div>
    {/if}

    <!-- 회원 목록 -->
    {#if filteredMembers().length === 0}
        <div class="card empty-state">
            <div class="empty-state-icon">👥</div>
            <p class="empty-state-text">
                {#if searchQuery}
                    검색 결과가 없습니다
                {:else if activeTab === "pending"}
                    승인 대기 중인 회원이 없습니다
                {:else if activeTab === "pre-registered"}
                    등록된 후보자가 없습니다
                {:else}
                    회원이 없습니다
                {/if}
            </p>
        </div>
    {:else}
        <!-- 모바일용 카드 뷰 -->
        <div class="flex flex-col gap-3 md:hidden">
            {#each filteredMembers() as member, i}
                <div class="card animate-fadeIn" style="animation-delay: {i * 0.02}s;">
                    <div class="flex items-start justify-between mb-3">
                        <div>
                            <div class="font-bold text-lg">
                                {member.name}
                                {#if member.passwordHash === null}
                                    <span class="badge badge-info ml-2">후보자</span>
                                {/if}
                            </div>
                            <div class="text-gray-500 text-sm">{member.phone}</div>
                        </div>
                        {#if member.passwordHash !== null}
                            {#if member.status === "pending"}
                                <span class="badge badge-warning">대기</span>
                            {:else if member.status === "approved"}
                                <span class="badge badge-success">승인</span>
                            {:else}
                                <span class="badge badge-danger">거절</span>
                            {/if}
                        {:else}
                            <span class="badge badge-info">후보자</span>
                        {/if}
                    </div>
                    <div class="text-sm text-gray-600 mb-1">
                        <span class="font-medium">소속:</span>
                        {member.church}
                    </div>
                    <div class="text-sm text-gray-600 mb-1">
                        <span class="font-medium">시찰:</span>
                        {member.sigchal}
                    </div>
                    <div class="text-sm text-gray-600 mb-3">
                        <span class="font-medium">직분:</span>
                        {member.position || "-"}
                    </div>
                    {#if member.status === "approved" && member.passwordHash !== null}
                        <div class="text-sm text-gray-600 mb-3">
                            <span class="font-medium">투표권한:</span>
                            <button
                                class="btn btn-sm ml-2 {member.canVote !== false ? 'btn-success' : 'btn-secondary'}"
                                onclick={() => toggleCanVote(member.id, member.canVote !== false)}
                            >
                                {member.canVote !== false ? "가능" : "불가"}
                            </button>
                        </div>
                    {/if}
                    <div class="flex gap-2">
                        {#if member.status === "pending" && member.passwordHash !== null}
                            <button class="btn btn-success btn-sm flex-1" onclick={() => handleApprove(member.id)}>
                                ✓ 승인
                            </button>
                            <button class="btn btn-danger btn-sm flex-1" onclick={() => handleReject(member.id)}>
                                ✕ 거절
                            </button>
                        {/if}
                        <button class="btn btn-secondary btn-sm" onclick={() => handleDelete(member.id, member.name)}>
                            삭제
                        </button>
                    </div>
                </div>
            {/each}
        </div>

        <!-- 데스크톱용 테이블 뷰 -->
        <div class="card hidden md:block">
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>이름</th>
                            <th>전화번호</th>
                            <th>소속교회</th>
                            <th>시찰</th>
                            <th>직분</th>
                            <th>투표가능</th>
                            <th>가입일</th>
                            <th>상태</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each filteredMembers() as member, i (member.id)}
                            <tr class="animate-fadeIn" style="animation-delay: {i * 0.02}s;">
                                <td class="font-medium">
                                    {member.name}
                                    {#if member.passwordHash === null}
                                        <span class="text-xs text-blue-600 ml-1">(후보자)</span>
                                    {/if}
                                </td>
                                <td>{member.phone}</td>
                                <td>{member.church}</td>
                                <td class="text-sm">{member.sigchal}</td>
                                <td class="text-sm">{member.position || "-"}</td>
                                <td>
                                    {#if member.passwordHash !== null && member.status === "approved"}
                                        <button
                                            class="btn btn-sm {member.canVote !== false
                                                ? 'btn-success'
                                                : 'btn-secondary'}"
                                            onclick={() => toggleCanVote(member.id, member.canVote !== false)}
                                        >
                                            {member.canVote !== false ? "가능" : "불가"}
                                        </button>
                                    {:else}
                                        <span class="text-gray-400">-</span>
                                    {/if}
                                </td>
                                <td class="text-sm text-gray-500">{formatDate(member.createdAt)}</td>
                                <td>
                                    {#if member.passwordHash === null}
                                        <span class="badge badge-info">후보자</span>
                                    {:else if member.status === "pending"}
                                        <span class="badge badge-warning">대기</span>
                                    {:else if member.status === "approved"}
                                        <span class="badge badge-success">승인</span>
                                    {:else}
                                        <span class="badge badge-danger">거절</span>
                                    {/if}
                                </td>
                                <td>
                                    <div class="flex gap-2">
                                        {#if member.status === "pending" && member.passwordHash !== null}
                                            <button
                                                class="btn btn-success btn-sm"
                                                onclick={() => handleApprove(member.id)}
                                            >
                                                승인
                                            </button>
                                            <button
                                                class="btn btn-danger btn-sm"
                                                onclick={() => handleReject(member.id)}
                                            >
                                                거절
                                            </button>
                                        {/if}
                                        <button
                                            class="btn btn-secondary btn-sm"
                                            onclick={() => handleDelete(member.id, member.name)}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    {/if}

    <div class="mt-6">
        <a href="/admin" class="btn btn-secondary">← 대시보드로</a>
    </div>
</div>

<!-- 후보자 미리 등록 모달 -->
{#if showPreRegisterModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
        class="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4"
        onclick={(e) => {
            if (e.target === e.currentTarget) showPreRegisterModal = false;
        }}
        role="button"
        tabindex="-1"
    >
        <div class="card max-w-md w-full animate-fadeIn">
            <h2 class="text-xl font-bold mb-4">후보자 미리 등록</h2>
            <p class="text-gray-600 text-sm mb-4">
                미가입 목사/장로를 후보자로 미리 등록합니다. 당사자가 회원가입 시 정식 회원으로 전환됩니다.
            </p>

            {#if preRegisterError}
                <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {preRegisterError}
                </div>
            {/if}

            <form onsubmit={handlePreRegister}>
                <div class="form-group">
                    <label class="label" for="pre-name">성명 *</label>
                    <input
                        type="text"
                        id="pre-name"
                        class="input"
                        placeholder="홍길동"
                        bind:value={preRegisterForm.name}
                    />
                </div>

                <div class="form-group">
                    <label class="label" for="pre-phone">휴대폰번호 *</label>
                    <input
                        type="tel"
                        id="pre-phone"
                        class="input"
                        placeholder="010-0000-0000"
                        value={preRegisterForm.phone}
                        oninput={handlePhoneInput}
                    />
                </div>

                <div class="form-group">
                    <label class="label" for="pre-church">소속교회 *</label>
                    <input
                        type="text"
                        id="pre-church"
                        class="input"
                        placeholder="OO교회"
                        bind:value={preRegisterForm.church}
                    />
                </div>

                <div class="form-group">
                    <label class="label" for="pre-region">노회</label>
                    <select id="pre-region" class="select" bind:value={preRegisterForm.region}>
                        {#each REGIONS as r (r)}
                            <option value={r}>{r}</option>
                        {/each}
                    </select>
                </div>

                <div class="form-group">
                    <label class="label" for="pre-sigchal">소속시찰 *</label>
                    <select id="pre-sigchal" class="select" bind:value={preRegisterForm.sigchal}>
                        {#each SIGCHALS as s}
                            <option value={s}>{s}</option>
                        {/each}
                    </select>
                </div>

                <div class="form-group">
                    <label class="label" for="pre-position">직분 *</label>
                    <select id="pre-position" class="select" bind:value={preRegisterForm.position}>
                        {#each POSITIONS as p}
                            <option value={p}>{p}</option>
                        {/each}
                    </select>
                </div>

                <div class="flex gap-3 mt-6">
                    <button
                        type="button"
                        class="btn btn-secondary flex-1"
                        onclick={() => (showPreRegisterModal = false)}
                    >
                        취소
                    </button>
                    <button type="submit" class="btn btn-primary flex-1" disabled={preRegisterLoading}>
                        {#if preRegisterLoading}
                            등록 중...
                        {:else}
                            등록
                        {/if}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    .badge-info {
        background-color: #dbeafe;
        color: #1e40af;
    }
</style>
