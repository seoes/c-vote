<script lang="ts">
    import { currentVoteList } from "$lib/currentVoteList";
</script>

<div class="home">
    <div class="border-b">
        <a href="/login">로그인</a>
    </div>
    <p>진행중인 투표 목록</p>
    {#each currentVoteList as currentVote, index}
        <div class="mt-10">
            <a href="/vote/{currentVote.id}">
                <div>{index + 1}. {currentVote.title}</div>
                <div class="text-sm opacity-60">{currentVote.description}</div>
                <div class="flex flex-col gap-2 mt-4"></div>
            </a>
        </div>
    {/each}
</div>
