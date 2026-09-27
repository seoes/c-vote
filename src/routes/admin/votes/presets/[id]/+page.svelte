<script lang="ts">
    import type { PageData } from "./$types";
    import PresetForm from "$lib/components/PresetForm.svelte";

    let { data }: { data: PageData } = $props();
</script>

<svelte:head>
    <title>후보 프리셋 수정 - 노회 투표</title>
</svelte:head>

<div class="page-container page-container-wide">
    <div class="page-header">
        <h1 class="page-title">후보 프리셋 수정</h1>
        <p class="page-subtitle">{data.preset.name}</p>
    </div>

    <div class="card card-lg">
        <PresetForm
            approvedMembers={data.approvedMembers}
            presetId={data.preset.id}
            initialName={data.preset.name}
            initialMemberIds={data.preset.memberIds}
        />
    </div>
</div>
