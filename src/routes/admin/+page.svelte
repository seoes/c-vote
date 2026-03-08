<script lang="ts">
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
</script>

<svelte:head>
    <title>관리자 대시보드 - 노회 투표</title>
</svelte:head>

<div class="page-container page-container-wide">
    <div class="page-header">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="page-title">관리자 대시보드</h1>
                <p class="page-subtitle">회원 및 투표 관리</p>
            </div>
            <a href="/" class="btn btn-secondary btn-sm">홈으로</a>
        </div>
    </div>

    <!-- 요약 카드 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="card text-center animate-fadeIn">
            <div class="text-4xl font-bold text-primary-600">{data.approvedMembers.length}</div>
            <div class="text-gray-500 mt-1">승인된 회원</div>
        </div>
        <div class="card text-center animate-fadeIn" style="animation-delay: 0.05s;">
            <div class="text-4xl font-bold text-orange-500">{data.pendingMembers.length}</div>
            <div class="text-gray-500 mt-1">승인 대기</div>
        </div>
        <div class="card text-center animate-fadeIn" style="animation-delay: 0.1s;">
            <div class="text-4xl font-bold text-green-600">{data.activeVotes.length}</div>
            <div class="text-gray-500 mt-1">진행 중인 투표</div>
        </div>
        <div class="card text-center animate-fadeIn" style="animation-delay: 0.15s;">
            <div class="text-4xl font-bold text-gray-400">{data.endedVotes.length}</div>
            <div class="text-gray-500 mt-1">종료된 투표</div>
        </div>
    </div>

    <!-- 메뉴 카드 -->
    <div class="grid md:grid-cols-2 gap-6">
        <!-- 회원 관리 -->
        <a
            href="/admin/users"
            class="card card-lg hover:shadow-lg transition-shadow animate-fadeIn"
            style="animation-delay: 0.2s;"
        >
            <div class="flex items-center gap-4 mb-4">
                <div class="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center text-3xl">👥</div>
                <div>
                    <h2 class="text-xl font-bold text-gray-800">회원 관리</h2>
                    <p class="text-gray-500">회원 목록 조회 및 승인</p>
                </div>
            </div>
            {#if data.pendingMembers.length > 0}
                <div class="bg-orange-50 text-orange-700 px-4 py-2 rounded-lg font-medium">
                    ⚠️ {data.pendingMembers.length}명의 승인 대기 중인 회원이 있습니다
                </div>
            {:else}
                <div class="bg-green-50 text-green-700 px-4 py-2 rounded-lg">✅ 모든 회원이 승인되었습니다</div>
            {/if}
        </a>

        <!-- 투표 관리 -->
        <a
            href="/admin/votes"
            class="card card-lg hover:shadow-lg transition-shadow animate-fadeIn"
            style="animation-delay: 0.25s;"
        >
            <div class="flex items-center gap-4 mb-4">
                <div class="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-3xl">🗳️</div>
                <div>
                    <h2 class="text-xl font-bold text-gray-800">투표 관리</h2>
                    <p class="text-gray-500">투표 생성 및 관리</p>
                </div>
            </div>
            <div class="flex gap-4">
                <div class="flex-1 bg-green-50 text-green-700 px-4 py-2 rounded-lg text-center">
                    <span class="font-bold">{data.activeVotes.length}</span> 진행 중
                </div>
                <div class="flex-1 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-center">
                    <span class="font-bold">{data.endedVotes.length}</span> 종료
                </div>
            </div>
        </a>
    </div>

    <!-- 빠른 작업 -->
    <div class="mt-8">
        <h3 class="text-lg font-bold mb-4">빠른 작업</h3>
        <div class="flex flex-wrap gap-3">
            <a href="/admin/votes/create" class="btn btn-primary">➕ 새 투표 만들기</a>
            <a href="/admin/users?filter=pending" class="btn btn-secondary">👤 승인 대기 회원 보기</a>
            <a href="/" class="btn btn-secondary">🏠 메인으로</a>
        </div>
    </div>
</div>
