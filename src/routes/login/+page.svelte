<script lang="ts">
    import { goto } from "$app/navigation";
    import { currentUser } from "$lib/stores";

    let name = $state("");
    let phone = $state("");
    let password = $state("");
    let error = $state("");
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

        if (!name.trim()) {
            error = "성명을 입력해주세요.";
            loading = false;
            return;
        }
        if (!phone.trim()) {
            error = "휴대폰번호를 입력해주세요.";
            loading = false;
            return;
        }
        if (!password) {
            error = "비밀번호를 입력해주세요.";
            loading = false;
            return;
        }

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    phone,
                    password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                error = data.message || "로그인에 실패했습니다.";
                loading = false;
                return;
            }

            // 사용자 정보 저장
            currentUser.set(data.user);

            // 관리자면 관리자 페이지로, 아니면 메인으로
            if (data.user.isAdmin) {
                goto("/admin");
            } else {
                goto("/");
            }
        } catch (e) {
            error = "서버 오류가 발생했습니다.";
        } finally {
            loading = false;
        }
    }
</script>

<div class="page-container">
    <div class="page-header" style="margin-top: 3rem;">
        <div class="text-6xl mb-4">🗳️</div>
        <h1 class="page-title">노회 투표 시스템</h1>
        <p class="page-subtitle">로그인하여 투표에 참여하세요</p>
    </div>

    <form class="card card-lg animate-fadeIn" onsubmit={handleSubmit}>
        {#if error}
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
            </div>
        {/if}

        <div class="form-group">
            <label class="label" for="name">성명</label>
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
            <label class="label" for="phone">휴대폰번호</label>
            <input
                type="tel"
                id="phone"
                class="input input-lg"
                placeholder="010-0000-0000"
                value={phone}
                oninput={handlePhoneInput}
                autocomplete="tel"
            />
        </div>

        <div class="form-group">
            <label class="label" for="password">비밀번호</label>
            <input
                type="password"
                id="password"
                class="input input-lg"
                placeholder="비밀번호"
                bind:value={password}
                autocomplete="current-password"
            />
        </div>

        <button type="submit" class="btn btn-primary btn-lg btn-full mt-6" disabled={loading}>
            {#if loading}
                로그인 중...
            {:else}
                로그인
            {/if}
        </button>

        <div class="text-center mt-4">
            <a href="/find-password" class="text-gray-500 text-sm hover:text-primary-600 hover:underline">
                비밀번호를 잊으셨나요?
            </a>
        </div>

        <div class="text-center mt-6">
            <span class="text-gray-600">계정이 없으신가요?</span>
            <a href="/register" class="text-primary-600 font-semibold ml-2 hover:underline">회원가입</a>
        </div>
    </form>
</div>
