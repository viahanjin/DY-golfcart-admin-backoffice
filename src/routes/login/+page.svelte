<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import myLogo from '$lib/assets/logo.svg';
	import { Eye, EyeOff, LogIn } from 'lucide-svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { onMount } from 'svelte';

	// 상수 정의
	const MIN_PASSWORD_LENGTH = 6;

	let showPassword = false;
	let isLoading = false;
	let formElement: HTMLFormElement;

	// 폼 데이터
	let formData = {
		user_id: '',
		password: ''
	};

	// 클라이언트 측 밸리데이션 에러
	let clientErrors = {
		user_id: '',
		password: ''
	};

	// 인증 스토어 상태
	$: authState = $authStore;

	// 에러 메시지 관리
	let serverError = '';
	$: serverEmail = $page.form?.email || '';

	// 서버에서 이메일 값이 있으면 폼에 반영
	$: if (serverEmail && !formData.user_id) {
		formData.user_id = serverEmail;
	}

	// 이미 로그인된 경우 대시보드로 리다이렉트
	onMount(() => {
		if (authState.isAuthenticated) {
			goto('/dashboard');
		}
	});

	// 클라이언트 밸리데이션 함수들
	const validateEmail = (email: string): string => {
		if (!email) return '이메일을 입력해주세요';
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) return '올바른 이메일 형식이 아닙니다';
		return '';
	};

	const validatePassword = (password: string): string => {
		if (!password) return '비밀번호를 입력해주세요';
		if (password.length < MIN_PASSWORD_LENGTH)
			return `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다`;
		return '';
	};

	// 실시간 클라이언트 밸리데이션 (타이핑 중에는 너무 aggressive하지 않게)
	let emailTouched = false;
	let passwordTouched = false;

	$: if (emailTouched) clientErrors.user_id = validateEmail(formData.user_id);
	$: if (passwordTouched) clientErrors.password = validatePassword(formData.password);

	// 폼 제출 가능 여부 (인증 스토어의 로딩 상태도 고려)
	$: isFormValid =
		!!formData.user_id && !!formData.password && !clientErrors.user_id && !clientErrors.password;
	$: isFormLoading = isLoading || authState.isLoading;

	// API 로그인 처리
	const handleApiLogin = async () => {
		if (!isFormValid || isFormLoading) return;

		isLoading = true;
		const result = await authStore.login(formData.user_id, formData.password);

		if (result.success) {
			goto('/dashboard');
		} else {
			serverError = result.error || '로그인에 실패했습니다.';
		}
		isLoading = false;
	};

	// 엔터키 처리
	const handleKeydown = (event: KeyboardEvent): void => {
		if (event.key === 'Enter' && isFormValid && !isFormLoading) {
			handleApiLogin();
		}
	};

	// 입력 필드 포커스 아웃 처리
	const handleEmailBlur = (): void => {
		emailTouched = true;
		clientErrors.user_id = validateEmail(formData.user_id);
	};

	const handlePasswordBlur = (): void => {
		passwordTouched = true;
		clientErrors.password = validatePassword(formData.password);
	};

	// 개발환경 자동 입력
	const fillTestCredentials = (): void => {
		formData.user_id = 'admin@dy.com';
		formData.password = 'SystemAdminPassword123';
		// 입력 후 터치 상태도 업데이트
		emailTouched = true;
		passwordTouched = true;
	};

	// 비밀번호 표시/숨김 토글
	const togglePasswordVisibility = (): void => {
		showPassword = !showPassword;
	};
</script>

<svelte:head>
	<title>로그인 - 골프카트 관제 시스템</title>
	<meta name="description" content="골프카트 자율주행 관제 시스템 관리자 로그인" />
</svelte:head>

<!-- 다크 그라데이션 배경 - 관제실 느낌 -->
<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 p-4"
>
	<div class="w-full max-w-md">
		<!-- 로고 및 타이틀 영역 -->
		<div class="mb-8 text-center">
			<div class="mx-auto flex h-15 w-22 items-center justify-center rounded-full shadow-lg">
				<img src={myLogo} alt="회사 로고" class="h-22 w-22" />
			</div>
			<h1 class="mb-2 text-3xl font-bold text-white">골프카트 관제 시스템</h1>
			<p class="text-slate-400">실시간 모니터링 및 제어 플랫폼</p>
		</div>

		<!-- 로그인 폼 카드 - 다크 테마 -->
		<div class="rounded-2xl border border-gray-700 bg-gray-800/90 p-8 shadow-2xl backdrop-blur-sm">
			<form
				bind:this={formElement}
				method="POST"
				use:enhance={() => {
					isLoading = true;
					return async ({ result, update }) => {
						isLoading = false;

						if (result.type === 'failure') {
							await update(); // 에러 메시지 업데이트
						} else if (result.type === 'success') {
							console.log('로그인 성공');

							// ✅ 성공 시 SvelteKit의 goto를 사용한 안전한 리다이렉트
							if (typeof result.data?.redirectTo === 'string' && result.data.redirectTo) {
								await goto(result.data.redirectTo, { replaceState: true });
								return; // update() 호출하지 않음
							}
						}

						await update();
					};
				}}
				class="space-y-6"
			>
				<!-- 서버 에러 메시지 (폼 상단에 표시) -->
				{#if serverError}
					<div class="rounded-lg border border-red-500/50 bg-red-900/50 p-4" role="alert">
						<p class="text-sm text-red-300">{serverError}</p>
					</div>
				{/if}

				<!-- 이메일 입력 -->
				<div>
					<label for="email" class="mb-2 block text-sm font-medium text-gray-300">
						관리자 이메일
					</label>
					<input
						id="email"
						name="email"
						type="email"
						autocomplete="email"
						required
						bind:value={formData.user_id}
						on:keydown={handleKeydown}
						on:blur={handleEmailBlur}
						disabled={isLoading}
						class="w-full rounded-lg border border-gray-600 bg-gray-700/50 px-4 py-3 text-white transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:bg-gray-800/50"
						class:border-red-500={clientErrors.user_id}
						class:focus:ring-red-500={clientErrors.user_id}
						class:focus:border-red-500={clientErrors.user_id}
						placeholder="admin@golfcart.com"
						aria-describedby={clientErrors.user_id ? 'email-error' : undefined}
					/>
					{#if clientErrors.user_id}
						<p id="email-error" class="mt-1 text-sm text-red-400" role="alert">
							{clientErrors.user_id}
						</p>
					{/if}
				</div>

				<!-- 비밀번호 입력 -->
				<div>
					<label for="password" class="mb-2 block text-sm font-medium text-gray-300">
						비밀번호
					</label>
					<div class="relative">
						<input
							id="password"
							name="password"
							type={showPassword ? 'text' : 'password'}
							autocomplete="current-password"
							required
							bind:value={formData.password}
							on:keydown={handleKeydown}
							on:blur={handlePasswordBlur}
							disabled={isLoading}
							class="w-full rounded-lg border border-gray-600 bg-gray-700/50 px-4 py-3 pr-12 text-white transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:bg-gray-800/50"
							class:border-red-500={clientErrors.password}
							class:focus:ring-red-500={clientErrors.password}
							class:focus:border-red-500={clientErrors.password}
							placeholder="••••••••"
							aria-describedby={clientErrors.password ? 'password-error' : undefined}
						/>
						<button
							type="button"
							on:click={togglePasswordVisibility}
							disabled={isLoading}
							class="absolute top-1/2 right-3 -translate-y-1/2 rounded text-gray-400 transition-colors duration-200 hover:text-gray-300 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none disabled:cursor-not-allowed"
							aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
						>
							{#if showPassword}
								<EyeOff class="h-5 w-5" />
							{:else}
								<Eye class="h-5 w-5" />
							{/if}
						</button>
					</div>
					{#if clientErrors.password}
						<p id="password-error" class="mt-1 text-sm text-red-400" role="alert">
							{clientErrors.password}
						</p>
					{/if}
				</div>

				<!-- 로그인 유지 체크박스 -->
				<div class="flex items-center">
					<input
						id="remember"
						name="remember"
						type="checkbox"
						disabled={isLoading}
						class="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500/30 focus:ring-offset-gray-800 disabled:cursor-not-allowed"
					/>
					<label for="remember" class="ml-2 block text-sm text-gray-300"> 로그인 상태 유지 </label>
				</div>

				<!-- 로그인 버튼 - 관제시스템 스타일 -->
				<button
					type="button"
					on:click={handleApiLogin}
					disabled={!isFormValid || isFormLoading}
					class="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none disabled:cursor-not-allowed disabled:border-gray-600 disabled:from-gray-600 disabled:to-gray-700"
				>
					{#if isFormLoading}
						<div
							class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
							aria-hidden="true"
						></div>
						시스템 접속 중...
					{:else}
						<LogIn class="h-4 w-4" />
						관제 시스템 접속
					{/if}
				</button>
			</form>
		</div>

		<!-- 개발 환경 테스트 정보 - 다크 테마 -->
		{#if import.meta.env.DEV}
			<div class="mt-6 rounded-lg border border-amber-500/30 bg-amber-900/20 p-4">
				<h3 class="mb-2 text-sm font-medium text-amber-300">개발 환경 테스트 계정</h3>
				<div class="space-y-1 text-xs text-amber-400/80">
					<p><strong>이메일:</strong> admin@dy.com</p>
					<p><strong>비밀번호:</strong> SystemAdminPassword123</p>
				</div>
				<button
					type="button"
					on:click={fillTestCredentials}
					class="mt-2 rounded text-xs text-amber-300 underline transition-colors hover:text-amber-200 focus:ring-2 focus:ring-amber-500/30 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"
				>
					자동 입력
				</button>
			</div>
		{/if}

		<!-- 시스템 상태 표시 -->
		<div class="mt-4 text-center">
			<div class="inline-flex items-center gap-2 text-xs text-gray-400">
				<div class="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
				시스템 정상 운영 중
			</div>
		</div>
	</div>
</div>

<style>
	/* 커스텀 애니메이션 */
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes glow {
		0%,
		100% {
			box-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
		}
		50% {
			box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
		}
	}

	/* 폼 카드 애니메이션 */
	.bg-gray-800\/90 {
		animation: fadeIn 0.6s ease-out;
	}

	/* 포커스 시 부드러운 전환 */
	input:focus {
		transform: scale(1.005);
	}

	/* 버튼 호버 효과 - 관제시스템 특화 */
	button:not(:disabled):hover {
		transform: translateY(-1px);
	}

	/* 로그인 버튼 특별 효과 */
	button[type='submit']:not(:disabled):hover {
		animation: glow 2s infinite;
	}

	/* 로딩 상태 글로우 */
	button[type='submit']:disabled {
		animation: glow 1.5s infinite;
	}

	/* 모션 민감 사용자를 위한 설정 */
	@media (prefers-reduced-motion: reduce) {
		.animate-spin,
		.animate-pulse {
			animation: none;
		}

		input:focus {
			transform: none;
		}

		button:hover {
			transform: none;
		}

		button[type='submit']:hover,
		button[type='submit']:disabled {
			animation: none;
		}
	}

	/* 다크 테마 최적화 */
	::placeholder {
		opacity: 0.7;
	}

	/* 체크박스 커스텀 스타일링 */
	input[type='checkbox']:checked {
		background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l7.146-7.147a.5.5 0 0 1 .708.708z'/%3e%3c/svg%3e");
	}
</style>
