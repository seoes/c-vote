<script lang="ts">
    import { SIGCHALS, POSITIONS, type Sigchal, type Position } from "$lib/types";
    import { goto } from "$app/navigation";
    import { REGIONS } from "$lib/region";

    // 2단계 플로우 상태
    let step = $state<"check" | "form" | "candidate">("check");
    let checking = $state(false);

    // 기본 정보 (1단계)
    let name = $state("");
    let phone = $state("");

    // 후보자 정보 (미리 채워짐)
    let candidateInfo = $state<{
        id: string;
        name: string;
        church: string;
        sigchal: Sigchal;
        position: Position;
        region: string;
    } | null>(null);

    // 추가 정보
    let church = $state("");
    let region = $state(REGIONS[0]);
    let sigchal = $state<Sigchal>(SIGCHALS[0]);
    let position = $state<Position>(POSITIONS[0]);
    let password = $state("");
    let passwordConfirm = $state("");
    let securityAnswer = $state("");

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

    // 1단계: 전화번호 확인
    async function handleCheck(e: Event) {
        e.preventDefault();
        error = "";
        checking = true;

        // 유효성 검사
        if (!name.trim()) {
            error = "성명을 입력해주세요.";
            checking = false;
            return;
        }
        if (!phone.trim() || phone.replace(/-/g, "").length < 10) {
            error = "휴대폰번호를 정확히 입력해주세요.";
            checking = false;
            return;
        }

        try {
            const res = await fetch("/api/auth/check-phone", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    phone,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                error = data.message || "전화번호 확인에 실패했습니다.";
                checking = false;
                return;
            }

            if (data.status === "member") {
                // 이미 가입된 회원
                error = "이미 가입된 전화번호입니다. 로그인해주세요.";
                checking = false;
                return;
            }

            if (data.status === "candidate") {
                // 후보자 계정 - 전환 플로우
                candidateInfo = data.member;
                step = "candidate";
                checking = false;
                return;
            }

            // 신규 사용자 - 회원가입 폼으로
            step = "form";
        } catch (e) {
            error = "서버 오류가 발생했습니다.";
        } finally {
            checking = false;
        }
    }

    // 2단계: 회원가입 (신규)
    async function handleSubmit(e: Event) {
        e.preventDefault();
        error = "";
        loading = true;

        // 유효성 검사
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
        if (!securityAnswer.trim()) {
            error = "성경인물 답변을 입력해주세요.";
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
                    region,
                    sigchal,
                    position,
                    securityAnswer: securityAnswer.trim(),
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

    // 2단계: 후보자 전환
    async function handleCandidateConvert(e: Event) {
        e.preventDefault();
        error = "";
        loading = true;

        // 유효성 검사
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
        if (!securityAnswer.trim()) {
            error = "성경인물 답변을 입력해주세요.";
            loading = false;
            return;
        }

        // API 호출 (후보자 전환)
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: candidateInfo!.name,
                    phone,
                    password,
                    church: candidateInfo!.church,
                    region: candidateInfo!.region,
                    sigchal: candidateInfo!.sigchal,
                    position: candidateInfo!.position,
                    securityAnswer: securityAnswer.trim(),
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

    function goBack() {
        step = "check";
        error = "";
        candidateInfo = null;
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
    {:else if step === "check"}
        <!-- 1단계: 이름/전화번호 확인 -->
        <form class="card card-lg animate-fadeIn" onsubmit={handleCheck}>
            {#if error}
                <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            {/if}

            <p class="text-gray-600 mb-4">
                먼저 이름과 전화번호를 입력해주세요.<br />
                <span class="text-sm">후보자로 미리 등록된 경우 기존 정보가 표시됩니다.</span>
            </p>

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

            <button type="submit" class="btn btn-primary btn-lg btn-full mt-6" disabled={checking}>
                {#if checking}
                    확인 중...
                {:else}
                    다음
                {/if}
            </button>

            <div class="text-center mt-6">
                <span class="text-gray-600">이미 계정이 있으신가요?</span>
                <a href="/login" class="text-primary-600 font-semibold ml-2 hover:underline">로그인</a>
            </div>
        </form>
    {:else if step === "candidate"}
        <!-- 2단계: 후보자 전환 -->
        <form class="card card-lg animate-fadeIn" onsubmit={handleCandidateConvert}>
            {#if error}
                <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            {/if}

            <div class="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4">
                <strong>후보자로 등록된 전화번호입니다.</strong><br />
                비밀번호를 설정하면 정식 회원으로 전환됩니다.
            </div>

            <!-- 후보자 정보 표시 -->
            <div class="bg-gray-50 rounded-lg p-4 mb-4">
                <div class="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <span class="text-gray-500">성명:</span>
                        <span class="font-medium ml-1">{candidateInfo?.name}</span>
                    </div>
                    <div>
                        <span class="text-gray-500">전화번호:</span>
                        <span class="font-medium ml-1">{phone}</span>
                    </div>
                    <div>
                        <span class="text-gray-500">소속교회:</span>
                        <span class="font-medium ml-1">{candidateInfo?.church}</span>
                    </div>
                    <div>
                        <span class="text-gray-500">소속시찰:</span>
                        <span class="font-medium ml-1">{candidateInfo?.sigchal}</span>
                    </div>
                    <div>
                        <span class="text-gray-500">직분:</span>
                        <span class="font-medium ml-1">{candidateInfo?.position}</span>
                    </div>
                    <div>
                        <span class="text-gray-500">노회:</span>
                        <span class="font-medium ml-1">{candidateInfo?.region}</span>
                    </div>
                </div>
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

            <div class="form-group">
                <label class="label" for="securityAnswer">가장 좋아하는 성경인물은? *</label>
                <input
                    type="text"
                    id="securityAnswer"
                    class="input input-lg"
                    placeholder="예: 다윗, 모세, 베드로"
                    bind:value={securityAnswer}
                />
                <p class="text-sm text-gray-500 mt-1">비밀번호 찾기 시 본인 확인용으로 사용됩니다</p>
            </div>

            <div class="flex gap-3 mt-6">
                <button type="button" class="btn btn-secondary btn-lg flex-1" onclick={goBack}>
                    이전
                </button>
                <button type="submit" class="btn btn-primary btn-lg flex-1" disabled={loading}>
                    {#if loading}
                        가입 처리중...
                    {:else}
                        가입 신청
                    {/if}
                </button>
            </div>
        </form>
    {:else}
        <!-- 2단계: 신규 회원가입 -->
        <form class="card card-lg animate-fadeIn" onsubmit={handleSubmit}>
            {#if error}
                <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            {/if}

            <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                신규 회원입니다. 가입 정보를 입력해주세요.
            </div>

            <!-- 기본 정보 (읽기 전용) -->
            <div class="bg-gray-50 rounded-lg p-4 mb-4">
                <div class="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <span class="text-gray-500">성명:</span>
                        <span class="font-medium ml-1">{name}</span>
                    </div>
                    <div>
                        <span class="text-gray-500">전화번호:</span>
                        <span class="font-medium ml-1">{phone}</span>
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label class="label" for="church">소속교회 *</label>
                <input type="text" id="church" class="input input-lg" placeholder="OO교회" bind:value={church} />
            </div>

            <div class="form-group">
                <label class="label" for="region">노회</label>
                <select id="region" class="select" bind:value={region}>
                    {#each REGIONS as r (r)}
                        <option value={r}>{r}</option>
                    {/each}
                </select>
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

            <div class="form-group">
                <label class="label" for="securityAnswer">가장 좋아하는 성경인물은? *</label>
                <input
                    type="text"
                    id="securityAnswer"
                    class="input input-lg"
                    placeholder="예: 다윗, 모세, 베드로"
                    bind:value={securityAnswer}
                />
                <p class="text-sm text-gray-500 mt-1">비밀번호 찾기 시 본인 확인용으로 사용됩니다</p>
            </div>

            <div class="flex gap-3 mt-6">
                <button type="button" class="btn btn-secondary btn-lg flex-1" onclick={goBack}>
                    이전
                </button>
                <button type="submit" class="btn btn-primary btn-lg flex-1" disabled={loading}>
                    {#if loading}
                        가입 처리중...
                    {:else}
                        가입 신청
                    {/if}
                </button>
            </div>
        </form>
    {/if}
</div>
