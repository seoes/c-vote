<script lang="ts">
    import type { PageData } from "./$types";
    import { page } from "$app/stores";

    let { data }: { data: PageData } = $props();

    // URL 파라미터로 필터 확인
    let activeTab = $state<"all" | "pending" | "approved">("all");

    $effect(() => {
        if (data.filter === "pending") {
            activeTab = "pending";
        }
    });

    // 검색어
    let searchQuery = $state("");

    // 필터링된 회원 목록
    const filteredMembers = $derived(() => {
        let list = data.members.filter((m: any) => !m.isAdmin);

        // 탭 필터
        if (activeTab === "pending") {
            list = list.filter((m: any) => m.status === "pending");
        } else if (activeTab === "approved") {
            list = list.filter((m: any) => m.status === "approved");
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
    const pendingMembers = $derived(data.members.filter((m: any) => m.status === "pending"));
    const approvedMembers = $derived(data.members.filter((m: any) => m.status === "approved"));

    function formatDate(date: Date | string): string {
        const d = new Date(date);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
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
</script>

<svelte:head>
    <title>회원 관리 - 노회 투표</title>
</svelte:head>

<div class="page-container page-container-wide">
    <div class="page-header">
        <h1 class="page-title">회원 관리</h1>
        <p class="page-subtitle">회원 목록 조회 및 승인</p>
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
    </div>

    <!-- 검색 -->
    <div class="card mb-4">
        <input type="text" class="input" placeholder="🔍 이름, 교회, 전화번호로 검색..." bind:value={searchQuery} />
    </div>

    <!-- 회원 목록 -->
    {#if filteredMembers().length === 0}
        <div class="card empty-state">
            <div class="empty-state-icon">👥</div>
            <p class="empty-state-text">
                {#if searchQuery}
                    검색 결과가 없습니다
                {:else if activeTab === "pending"}
                    승인 대기 중인 회원이 없습니다
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
                            <div class="font-bold text-lg">{member.name}</div>
                            <div class="text-gray-500 text-sm">{member.phone}</div>
                        </div>
                        {#if member.status === "pending"}
                            <span class="badge badge-warning">대기</span>
                        {:else if member.status === "approved"}
                            <span class="badge badge-success">승인</span>
                        {:else}
                            <span class="badge badge-danger">거절</span>
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
                        {member.position || '-'}
                    </div>
                    {#if member.status === "pending"}
                        <div class="flex gap-2">
                            <button class="btn btn-success btn-sm flex-1" onclick={() => handleApprove(member.id)}>
                                ✓ 승인
                            </button>
                            <button class="btn btn-danger btn-sm flex-1" onclick={() => handleReject(member.id)}>
                                ✕ 거절
                            </button>
                        </div>
                    {/if}
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
                            <th>가입일</th>
                            <th>상태</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each filteredMembers() as member, i}
                            <tr class="animate-fadeIn" style="animation-delay: {i * 0.02}s;">
                                <td class="font-medium">{member.name}</td>
                                <td>{member.phone}</td>
                                <td>{member.church}</td>
                                <td class="text-sm">{member.sigchal}</td>
                                <td class="text-sm">{member.position || '-'}</td>
                                <td class="text-sm text-gray-500">{formatDate(member.createdAt)}</td>
                                <td>
                                    {#if member.status === "pending"}
                                        <span class="badge badge-warning">대기</span>
                                    {:else if member.status === "approved"}
                                        <span class="badge badge-success">승인</span>
                                    {:else}
                                        <span class="badge badge-danger">거절</span>
                                    {/if}
                                </td>
                                <td>
                                    {#if member.status === "pending"}
                                        <div class="flex gap-2">
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
                                        </div>
                                    {:else}
                                        <span class="text-gray-400">-</span>
                                    {/if}
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
