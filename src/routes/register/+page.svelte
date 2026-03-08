<script lang="ts">
    import { SIGCHALS, POSITIONS, type Sigchal, type Position } from "$lib/types";
    import { goto } from "$app/navigation";

    let name = $state("");
    let phone = $state("");
    let church = $state("");
    let sigchal = $state<Sigchal>(SIGCHALS[0]);
    let position = $state<Position>(POSITIONS[0]);
    let password = $state("");
    let passwordConfirm = $state("");

    let error = $state("");
    let success = $state(false);
    let loading = $state(false);

    function formatPhone(value: string): string {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }

    function handlePhoneInput(e: Event) {
        const target = e.target as HTMLInputElement;
        phone = formatPhone(target.value);
    }

    async function handleSubmit(e: Event) {
        e.preventDefault();
        error = "";
        loading = true;

        // 유효성 검사
        if (!name.trim()) {
            error = "성명을 입력해주세요.";
            loading = false;
            return;
        }
        if (!phone.trim() || phone.replace(/-/g, "").length < 10) {
            error = "휴대폰번호를 정확히 입력해주세요.";
            loading = false;
            return;
        }
        if (!church.trim()) {
            error = "소속교회를 입력해주세요.";
            loading = false;
            return;
        }
        if (!password) {
            error = "비밀번호를 입력해주세요.";
            loading = false;
            return;
        }
        if (password.length < 4) {
            error = "비밀번호는 4자리 이상이어야 합니다.";
            loading = false;
            return;
        }
        if (password !== passwordConfirm) {
            error = "비밀번호가 일치하지 않습니다.";
            loading = false;
            return;
        }

        // API 호출
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    phone,
                    password,
                    church: church.trim(),
                    sigchal,
                    position,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                error = data.message || "회원가입에 실패했습니다.";
                loading = false;
                return;
            }

            success = true;
        } catch (e) {
            error = "서버 오류가 발생했습니다.";
        } finally {
            loading = false;
        }
    }
</script>

<div class="page-container">
    <div class="page-header">
        <h1 class="page-title">회원가입</h1>
        <p class="page-subtitle">노회 투표 시스템에 가입합니다</p>
    </div>

    {#if success}
        <div class="card card-lg animate-fadeIn">
            <div class="text-center">
                <div class="text-6xl mb-4">✅</div>
                <h2 class="text-xl font-bold text-primary-700 mb-2">가입 신청 완료</h2>
                <p class="text-gray-600 mb-6">
                    관리자 승인 후 로그인이 가능합니다.<br />
                    승인까지 잠시 기다려주세요.
                </p>
                <a href="/login" class="btn btn-primary btn-full">로그인 페이지로</a>
            </div>
        </div>
    {:else}
        <form class="card card-lg animate-fadeIn" onsubmit={handleSubmit}>
            {#if error}
                <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            {/if}

            <div class="form-group">
                <label class="label" for="name">성명 *</label>
                <input
                    type="text"
                    id="name"
                    class="input input-lg"
                    placeholder="홍길동"
                    bind:value={name}
                    autocomplete="name"
                />
            </div>

            <div class="form-group">
                <label class="label" for="phone">휴대폰번호 *</label>
                <input
                    type="tel"
                    id="phone"
                    class="input input-lg"
                    placeholder="010-0000-0000"
                    value={phone}
                    oninput={handlePhoneInput}
                    autocomplete="tel"
                />
                <p class="text-sm text-gray-500 mt-1">동명이인 구분용으로 사용됩니다</p>
            </div>

            <div class="form-group">
                <label class="label" for="church">소속교회 *</label>
                <input type="text" id="church" class="input input-lg" placeholder="OO교회" bind:value={church} />
            </div>

            <div class="form-group">
                <label class="label" for="sigchal">소속시찰 *</label>
                <select id="sigchal" class="select" bind:value={sigchal}>
                    {#each SIGCHALS as s}
                        <option value={s}>{s}</option>
                    {/each}
                </select>
            </div>

            <div class="form-group">
                <label class="label" for="position">직분 *</label>
                <select id="position" class="select" bind:value={position}>
                    {#each POSITIONS as p}
                        <option value={p}>{p}</option>
                    {/each}
                </select>
            </div>

            <div class="form-group">
                <label class="label" for="password">비밀번호 *</label>
                <input
                    type="password"
                    id="password"
                    class="input input-lg"
                    placeholder="비밀번호 (4자리 이상)"
                    bind:value={password}
                    autocomplete="new-password"
                />
            </div>

            <div class="form-group">
                <label class="label" for="passwordConfirm">비밀번호 확인 *</label>
                <input
                    type="password"
                    id="passwordConfirm"
                    class="input input-lg"
                    placeholder="비밀번호 다시 입력"
                    bind:value={passwordConfirm}
                    autocomplete="new-password"
                />
            </div>

            <button type="submit" class="btn btn-primary btn-lg btn-full mt-6" disabled={loading}>
                {#if loading}
                    가입 처리중...
                {:else}
                    가입 신청
                {/if}
            </button>

            <div class="text-center mt-6">
                <span class="text-gray-600">이미 계정이 있으신가요?</span>
                <a href="/login" class="text-primary-600 font-semibold ml-2 hover:underline">로그인</a>
            </div>
        </form>
    {/if}
</div>
