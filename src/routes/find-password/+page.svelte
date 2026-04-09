<script lang="ts">
    import { goto } from "$app/navigation";

    // 2단계: 본인 확인 -> 비밀번호 재설정
    let step = $state(1);
    let name = $state("");
    let phone = $state("");
    let securityAnswer = $state("");
    let resetToken = $state("");
    let newPassword = $state("");
    let newPasswordConfirm = $state("");

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

    async function handleVerify(e: Event) {
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
        if (!securityAnswer.trim()) {
            error = "성경인물 답변을 입력해주세요.";
            loading = false;
            return;
        }

        try {
            const res = await fetch("/api/auth/find-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    phone,
                    securityAnswer: securityAnswer.trim(),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                error = data.message || "본인 확인에 실패했습니다.";
                loading = false;
                return;
            }

            // 성공 시 토큰 저장하고 2단계로
            resetToken = data.token;
            step = 2;
        } catch (e) {
            error = "서버 오류가 발생했습니다.";
        } finally {
            loading = false;
        }
    }

    async function handleReset(e: Event) {
        e.preventDefault();
        error = "";
        loading = true;

        // 유효성 검사
        if (!newPassword) {
            error = "새 비밀번호를 입력해주세요.";
            loading = false;
            return;
        }
        if (newPassword.length < 4) {
            error = "비밀번호는 4자리 이상이어야 합니다.";
            loading = false;
            return;
        }
        if (newPassword !== newPasswordConfirm) {
            error = "비밀번호가 일치하지 않습니다.";
            loading = false;
            return;
        }

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: resetToken,
                    newPassword,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                error = data.message || "비밀번호 재설정에 실패했습니다.";
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
        <h1 class="page-title">비밀번호 찾기</h1>
        <p class="page-subtitle">
            {#if step === 1}
                본인 확인을 위해 정보를 입력해주세요
            {:else}
                새 비밀번호를 설정해주세요
            {/if}
        </p>
    </div>

    {#if success}
        <div class="card card-lg animate-fadeIn">
            <div class="text-center">
                <div class="text-6xl mb-4">✅</div>
                <h2 class="text-xl font-bold text-primary-700 mb-2">비밀번호 변경 완료</h2>
                <p class="text-gray-600 mb-6">
                    새 비밀번호로 로그인해주세요.
                </p>
                <a href="/login" class="btn btn-primary btn-full">로그인 페이지로</a>
            </div>
        </div>
    {:else if step === 1}
        <form class="card card-lg animate-fadeIn" onsubmit={handleVerify}>
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
            </div>

            <div class="form-group">
                <label class="label" for="securityAnswer">가장 좋아하는 성경인물은? *</label>
                <input
                    type="text"
                    id="securityAnswer"
                    class="input input-lg"
                    placeholder="가입 시 입력한 답변"
                    bind:value={securityAnswer}
                />
                <p class="text-sm text-gray-500 mt-1">회원가입 시 입력한 답변을 입력해주세요</p>
            </div>

            <button type="submit" class="btn btn-primary btn-lg btn-full mt-6" disabled={loading}>
                {#if loading}
                    확인 중...
                {:else}
                    본인 확인
                {/if}
            </button>

            <div class="text-center mt-6">
                <a href="/login" class="text-gray-500 text-sm hover:text-primary-600 hover:underline">
                    로그인 페이지로 돌아가기
                </a>
            </div>
        </form>
    {:else}
        <form class="card card-lg animate-fadeIn" onsubmit={handleReset}>
            {#if error}
                <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            {/if}

            <div class="form-group">
                <label class="label" for="newPassword">새 비밀번호 *</label>
                <input
                    type="password"
                    id="newPassword"
                    class="input input-lg"
                    placeholder="새 비밀번호 (4자리 이상)"
                    bind:value={newPassword}
                    autocomplete="new-password"
                />
            </div>

            <div class="form-group">
                <label class="label" for="newPasswordConfirm">새 비밀번호 확인 *</label>
                <input
                    type="password"
                    id="newPasswordConfirm"
                    class="input input-lg"
                    placeholder="비밀번호 다시 입력"
                    bind:value={newPasswordConfirm}
                    autocomplete="new-password"
                />
            </div>

            <button type="submit" class="btn btn-primary btn-lg btn-full mt-6" disabled={loading}>
                {#if loading}
                    변경 중...
                {:else}
                    비밀번호 변경
                {/if}
            </button>

            <div class="text-center mt-6">
                <button
                    type="button"
                    class="text-gray-500 text-sm hover:text-primary-600 hover:underline"
                    onclick={() => {
                        step = 1;
                        resetToken = "";
                        error = "";
                    }}
                >
                    이전 단계로
                </button>
            </div>
        </form>
    {/if}
</div>
