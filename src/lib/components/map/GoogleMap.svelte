<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Loader2 } from 'lucide-svelte';

	// Props
	export let center = { lat: 37.5665, lng: 126.9780 }; // 서울 기본 좌표
	export let zoom = 13;
	export let height = '400px';
	export let markers: Array<{
		id: string;
		position: { lat: number; lng: number };
		title?: string;
		icon?: string;
		info?: string;
	}> = [];
	export let showTraffic = false;
	export let enableClustering = true;

	// State
	let mapElement: HTMLDivElement;
	let map: google.maps.Map;
	let mapMarkers: google.maps.Marker[] = [];
	let markerCluster: any;
	let loading = true;
	let error = '';

	// Google Maps API 로드
	function loadGoogleMaps() {
		return new Promise((resolve, reject) => {
			// 이미 로드되어 있는지 확인
			if (window.google && window.google.maps) {
				resolve(window.google);
				return;
			}

			// API 키 확인
			const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
			if (!apiKey) {
				reject(new Error('Google Maps API 키가 설정되지 않았습니다. .env 파일에 VITE_GOOGLE_MAPS_API_KEY를 추가해주세요.'));
				return;
			}

			// 스크립트 동적 로드
			const script = document.createElement('script');
			script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker,places`;
			script.async = true;
			script.defer = true;
			
			script.onload = () => resolve(window.google);
			script.onerror = () => reject(new Error('Google Maps API 로드 실패'));
			
			document.head.appendChild(script);
		});
	}

	// 맵 초기화
	async function initMap() {
		try {
			loading = true;
			await loadGoogleMaps();

			// 맵 생성
			map = new google.maps.Map(mapElement, {
				center,
				zoom,
				mapTypeControl: true,
				streetViewControl: true,
				fullscreenControl: true,
				zoomControl: true,
				styles: [
					{
						featureType: 'poi.business',
						stylers: [{ visibility: 'off' }]
					}
				]
			});

			// 교통 정보 레이어
			if (showTraffic) {
				const trafficLayer = new google.maps.TrafficLayer();
				trafficLayer.setMap(map);
			}

			// 마커 추가
			updateMarkers();

			loading = false;
		} catch (err) {
			console.error('Google Maps 초기화 실패:', err);
			error = err.message || '지도를 불러올 수 없습니다.';
			loading = false;
		}
	}

	// 마커 업데이트
	function updateMarkers() {
		if (!map) return;

		// 기존 마커 제거
		mapMarkers.forEach(marker => marker.setMap(null));
		mapMarkers = [];

		// 새 마커 생성
		markers.forEach(markerData => {
			const marker = new google.maps.Marker({
				position: markerData.position,
				map,
				title: markerData.title || '',
				animation: google.maps.Animation.DROP
			});

			// 커스텀 아이콘 설정
			if (markerData.icon) {
				marker.setIcon({
					url: markerData.icon,
					scaledSize: new google.maps.Size(40, 40)
				});
			}

			// 정보 창 추가
			if (markerData.info) {
				const infoWindow = new google.maps.InfoWindow({
					content: `
						<div class="p-2">
							<h3 class="font-semibold">${markerData.title || ''}</h3>
							<p class="text-sm">${markerData.info}</p>
						</div>
					`
				});

				marker.addListener('click', () => {
					infoWindow.open(map, marker);
				});
			}

			mapMarkers.push(marker);
		});

		// 마커 클러스터링
		if (enableClustering && mapMarkers.length > 10) {
			// MarkerClusterer 라이브러리 로드 필요
			// 여기서는 기본 구현만
		}
	}

	// Props 변경 감지
	$: if (map && markers) {
		updateMarkers();
	}

	$: if (map && center) {
		map.setCenter(center);
	}

	$: if (map && zoom) {
		map.setZoom(zoom);
	}

	onMount(() => {
		initMap();
	});

	onDestroy(() => {
		// 클린업
		mapMarkers.forEach(marker => marker.setMap(null));
	});
</script>

<div class="relative w-full" style="height: {height}">
	{#if loading}
		<div class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
			<div class="flex flex-col items-center gap-2">
				<Loader2 class="h-8 w-8 animate-spin text-blue-600" />
				<p class="text-sm text-gray-600 dark:text-gray-400">지도 로딩중...</p>
			</div>
		</div>
	{/if}
	
	{#if error}
		<div class="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20">
			<div class="text-center">
				<p class="text-red-600 dark:text-red-400">{error}</p>
				<button 
					on:click={initMap}
					class="mt-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
				>
					다시 시도
				</button>
			</div>
		</div>
	{/if}
	
	<div bind:this={mapElement} class="h-full w-full rounded-lg" />
</div>