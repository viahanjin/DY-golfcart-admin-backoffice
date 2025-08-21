<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { MapPin, Search, Loader2 } from 'lucide-svelte';

	// Props
	export let placeholder = '주소를 검색하세요';
	export let disabled = false;
	export let required = false;

	// Event dispatcher
	const dispatch = createEventDispatcher<{
		select: {
			address: string;
			zonecode: string;
			roadAddress?: string;
			jibunAddress?: string;
			latitude?: number;
			longitude?: number;
		};
	}>();

	// State
	let searchInput: HTMLInputElement;
	let isScriptLoaded = false;
	let loading = false;
	let error = '';

	// 카카오 주소검색 API 로드
	function loadKakaoScript(): Promise<void> {
		return new Promise((resolve, reject) => {
			// 이미 로드된 경우
			if ((window as any).daum && (window as any).daum.Postcode) {
				isScriptLoaded = true;
				resolve();
				return;
			}

			// 스크립트 로드
			const script = document.createElement('script');
			script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
			script.async = true;
			
			script.onload = () => {
				isScriptLoaded = true;
				resolve();
			};
			
			script.onerror = () => {
				error = '카카오 주소 검색 API 로드에 실패했습니다.';
				reject(new Error(error));
			};

			document.head.appendChild(script);
		});
	}

	// 주소 검색 팝업 열기
	async function openAddressSearch() {
		try {
			loading = true;
			error = '';

			if (!isScriptLoaded) {
				await loadKakaoScript();
			}

			// 카카오 주소 검색 팝업 열기
			new (window as any).daum.Postcode({
				oncomplete: function(data: any) {
					console.log('카카오 주소 데이터:', data); // 디버깅용
					
					// 선택된 주소 정보
					const addressData = {
						address: data.address, // 기본 주소
						zonecode: data.zonecode, // 우편번호
						roadAddress: data.roadAddress || '', // 도로명 주소
						jibunAddress: data.jibunAddress || '', // 지번 주소
						latitude: undefined as number | undefined,
						longitude: undefined as number | undefined
					};

					// 카카오 주소 API에서 제공하는 좌표 정보 사용
					if (data.y && data.x) {
						addressData.latitude = parseFloat(data.y);
						addressData.longitude = parseFloat(data.x);
						console.log('카카오에서 제공한 좌표:', addressData.latitude, addressData.longitude);
					} else {
						console.warn('좌표 정보가 제공되지 않았습니다.');
					}

					// 이벤트 발송
					dispatch('select', addressData);
					
					// 입력 필드에 주소 표시
					if (searchInput) {
						searchInput.value = addressData.roadAddress || addressData.address;
					}
				},
				width: 500,
				height: 600
			}).open();

		} catch (err) {
			console.error('주소 검색 오류:', err);
			error = '주소 검색 중 오류가 발생했습니다.';
		} finally {
			loading = false;
		}
	}

	// 컴포넌트 마운트 시 스크립트 미리 로드
	onMount(async () => {
		try {
			await loadKakaoScript();
		} catch (err) {
			console.error('카카오 스크립트 로드 실패:', err);
		}
	});
</script>

<div class="relative">
	<div class="flex gap-2">
		<!-- 주소 입력 필드 -->
		<div class="relative flex-1">
			<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
				<MapPin class="h-4 w-4 text-gray-400" />
			</div>
			<input
				bind:this={searchInput}
				type="text"
				{placeholder}
				{disabled}
				{required}
				readonly
				class="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500"
				on:click={openAddressSearch}
			/>
		</div>

		<!-- 검색 버튼 -->
		<button
			type="button"
			on:click={openAddressSearch}
			{disabled}
			class="flex items-center gap-2 whitespace-nowrap rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
		>
			{#if loading}
				<Loader2 class="h-4 w-4 animate-spin" />
			{:else}
				<Search class="h-4 w-4" />
			{/if}
			주소 검색
		</button>
	</div>

	<!-- 에러 메시지 -->
	{#if error}
		<p class="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
	{/if}

	<!-- 도움말 -->
	<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
		검색 버튼을 클릭하여 주소를 검색하세요. 도로명 또는 지번 주소를 입력할 수 있습니다.
	</p>
</div>