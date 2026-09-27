<script lang="ts">
    import type { PageData } from "./$types";
    import PresetForm from "$lib/components/PresetForm.svelte";

    let { data }: { data: PageData } = $props();
</script>

<svelte:head>
    <title>새 후보 프리셋 - 노회 투표</title>
</svelte:head>

<div class="page-container page-container-wide">
    <div class="page-header">
        <h1 class="page-title">새 후보 프리셋</h1>
        <p class="page-subtitle">후보 회원 목록을 저장합니다</p>
    </div>

    <div class="card card-lg">
        <PresetForm approvedMembers={data.approvedMembers} />
    </div>
</div>
