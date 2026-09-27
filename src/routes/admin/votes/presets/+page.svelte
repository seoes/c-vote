<script lang="ts">
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    function formatDate(date: Date | string): string {
        const d = new Date(date);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
    }

    async function handleDelete(id: string, name: string) {
        if (!confirm(`"${name}" 프리셋을 삭제하시겠습니까?`)) return;
        try {
            const res = await fetch(`/api/candidate-presets/${id}`, { method: "DELETE" });
            if (res.ok) window.location.reload();
            else alert("삭제에 실패했습니다.");
        } catch {
            alert("서버 오류가 발생했습니다.");
        }
    }
</script>

<svelte:head>
    <title>후보 프리셋 - 노회 투표</title>
</svelte:head>

<div class="page-container page-container-wide">
    <div class="page-header">
        <h1 class="page-title">후보 프리셋</h1>
        <p class="page-subtitle">투표 생성 시 불러올 후보 목록을 미리 저장합니다</p>
    </div>

    <div class="mb-6 flex flex-wrap justify-between gap-2">
        <a href="/admin/votes/presets/create" class="btn btn-primary">➕ 새 프리셋 만들기</a>
        <a href="/admin/votes" class="btn btn-secondary">← 투표 관리로</a>
    </div>

    {#if data.presets.length === 0}
        <div class="card empty-state">
            <p class="empty-state-text">등록된 프리셋이 없습니다</p>
            <a href="/admin/votes/presets/create" class="btn btn-primary mt-4">새 프리셋 만들기</a>
        </div>
    {:else}
        <div class="card hidden md:block">
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>이름</th>
                            <th>인원</th>
                            <th>생성일</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each data.presets as preset}
                            <tr>
                                <td class="font-medium">{preset.name}</td>
                                <td>{preset.memberCount}명</td>
                                <td class="text-sm text-gray-500">{formatDate(preset.createdAt)}</td>
                                <td>
                                    <div class="flex gap-2">
                                        <a href="/admin/votes/presets/{preset.id}" class="btn btn-secondary btn-sm">
                                            수정
                                        </a>
                                        <button
                                            class="btn btn-danger btn-sm"
                                            onclick={() => handleDelete(preset.id, preset.name)}
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

        <div class="flex flex-col gap-4 md:hidden">
            {#each data.presets as preset}
                <div class="card">
                    <h3 class="font-bold text-lg mb-1">{preset.name}</h3>
                    <p class="text-gray-500 text-sm mb-3">{preset.memberCount}명 · {formatDate(preset.createdAt)}</p>
                    <div class="flex gap-2">
                        <a href="/admin/votes/presets/{preset.id}" class="btn btn-secondary btn-sm flex-1">수정</a>
                        <button
                            class="btn btn-danger btn-sm flex-1"
                            onclick={() => handleDelete(preset.id, preset.name)}
                        >
                            삭제
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
