<script lang="ts">
    import { currentVoteList } from "$lib/currentVoteList";
    import type { PageProps } from "./$types";

    let { params }: PageProps = $props();

    const currentVote = currentVoteList[Number(params.id)];

    if (!currentVote) {
        throw new Error("투표가 존재하지 않습니다.");
    }

    const { title, description, option } = currentVote;

    let currentOptionList = $state(option);

    let selectedOptionId = $state<number | null>(null);

    function handleClick(id: number) {
        if (selectedOptionId === id) {
            selectedOptionId = null;
        } else {
            selectedOptionId = id;
        }
    }

    function setOptionInOrder() {
        currentOptionList = option;
    }

    function shuffle() {
        currentOptionList = [...currentOptionList].sort(() => Math.random() - 0.5);
    }
</script>

<!-- <div>{title}</div> -->
<!-- <div>{description}</div> -->
{#each currentOptionList as o, index}
    <div>
        <button
            type="button"
            class="{selectedOptionId === o.id ? 'bg-amber-200' : 'bg-none'} cursor-pointer"
            onclick={() => handleClick(o.id)}
        >
            {index + 1}. {o.optionText}
        </button>
    </div>
{/each}
<div>
    <button class="cursor-pointer" onclick={setOptionInOrder}>원래대로</button>
</div>
<div>
    <button class="cursor-pointer" onclick={shuffle}>랜덤</button>
</div>
{#if selectedOptionId}
    <div>투표</div>
{/if}
