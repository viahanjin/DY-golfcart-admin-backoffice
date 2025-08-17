<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import BaseModal from '$lib/components/common/BaseModal.svelte';

	export let modalMode: 'create' | 'edit' | 'view';
	export let selectedCart: any = null;

	const dispatch = createEventDispatcher();

	function getInitialFormData() {
		return {
			id: '',
			cartName: '',
			modelYear: new Date().getFullYear().toString(),
			manufacturer: '',
			assignedGolfCourseId: '',
			hardware: { mcu: true, vcu: false, vpu: false, acu: false },
			sensors: [],
			capabilities: {
				supportedModes: ['manual'],
				maxSpeed: 15,
				battery: { type: 'Li-ion', capacity: '10kWh', expectedHours: 8 }
			},
			network: { macAddress: '', ip: '', isStatic: false },
			mqtt: { clientId: '', qos: 1 },
			cartStatus: {
				currentState: 'unavailable',
				lastInspection: '',
				nextInspection: ''
			}
		};
	}

	let formData = getInitialFormData();
	$: isReadOnly = modalMode === 'view';
	// 하드웨어 선택에 따른 운행모드 자동 계산
	$: {
		const modes = ['manual'];
		if (formData.hardware.vcu) modes.push('auto');
		if (formData.hardware.vpu) modes.push('safety');
		if (formData.hardware.acu) modes.push('autonomous');
		formData.capabilities.supportedModes = modes;
	}

	onMount(() => {
		if (selectedCart && (modalMode === 'edit' || modalMode === 'view')) {
			formData = JSON.parse(JSON.stringify(selectedCart));
		} else {
			formData.id = `CART-${Date.now().toString().slice(-4)}`;
			formData.mqtt.clientId = `${formData.id}-CLIENT`;
		}
	});

	function handleSave() {
		if (formData.id) {
			dispatch('save', { mode: modalMode, data: formData });
		} else {
			alert('카트 ID는 필수입니다.');
		}
	}

	const sensorOptions = [
		{ id: '3d-lidar', label: '3D LiDAR' },
		{ id: 'stereo-camera', label: '스테레오 카메라' },
		{ id: 'gps-ins', label: 'GPS/INS' },
		{ id: 'wifi', label: 'WiFi' },
		{ id: 'ble', label: 'BLE' },
		{ id: 'lte', label: 'LTE' }
	];
</script>

<BaseModal size="3xl" on:close={() => dispatch('close')}>
	<span slot="title">
		{modalMode === 'create' ? '새 카트 등록' : modalMode === 'edit' ? '카트 정보 수정' : '카트 상세 정보'}
	</span>

	<div class="space-y-6">
		<!-- 기본 정보 -->
		<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
			<h3 class="font-semibold dark:text-white">카트 기본 정보</h3>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div><label for="cartId" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">카트 ID *</label><input id="cartId" type="text" bind:value={formData.id} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
				<div><label for="cartName" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">카트명/별명</label><input id="cartName" type="text" bind:value={formData.cartName} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
				<div><label for="manufacturer" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">제조사</label><input id="manufacturer" type="text" bind:value={formData.manufacturer} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
				<div><label for="modelYear" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">제조년도</label><input id="modelYear" type="text" bind:value={formData.modelYear} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
				<div><label for="assignedGolfCourseId" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">할당 골프장 *</label>
					<select id="assignedGolfCourseId" bind:value={formData.assignedGolfCourseId} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
						<option value="">선택하세요</option>
						<option value="1">서울 컨트리클럽</option>
						<option value="2">부산 오션뷰 골프장</option>
					</select>
				</div>
			</div>
		</div>

		<!-- 하드웨어 및 센서 -->
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
				<h3 class="font-semibold dark:text-white">제어 모듈 구성</h3>
				{#each Object.keys(formData.hardware) as key}
					<div class="flex items-center gap-2">
						<input type="checkbox" id="hw-{key}" bind:checked={formData.hardware[key]} disabled={isReadOnly} class="h-4 w-4 rounded" />
						<label for="hw-{key}" class="uppercase text-gray-700 dark:text-gray-200">{key}</label>
					</div>
				{/each}
				<div class="mt-2 text-sm text-gray-700 dark:text-gray-200">
					<span class="font-semibold">지원 운행 모드:</span>
					<span class="text-blue-600 dark:text-blue-400">{formData.capabilities.supportedModes.join(', ')}</span>
				</div>
			</div>
			<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
				<h3 class="font-semibold dark:text-white">센서 구성</h3>
				{#each sensorOptions as sensor}
					<div class="flex items-center gap-2">
						<input type="checkbox" id="sensor-{sensor.id}" value={sensor.id} bind:group={formData.sensors} disabled={isReadOnly} class="h-4 w-4 rounded" />
						<label for="sensor-{sensor.id}" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">{sensor.label}</label>
					</div>
				{/each}
			</div>
		</div>
		<!-- 성능 사양 -->
		<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
			<h3 class="font-semibold dark:text-white">성능 사양</h3>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div><label for="maxSpeed" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">최대 운행 속도 (km/h)</label><input id="maxSpeed" type="number" bind:value={formData.capabilities.maxSpeed} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
				<div><label for="batteryCapacity" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">배터리 용량 (kWh)</label><input id="batteryCapacity" type="text" bind:value={formData.capabilities.battery.capacity} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
			</div>
		</div>

		<!-- 통신 설정 -->
		<div class="space-y-4 rounded-lg border p-4 dark:border-gray-700">
			<h3 class="font-semibold dark:text-white">통신 설정</h3>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div><label for="macAddress" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">MAC 주소</label><input id="macAddress" type="text" bind:value={formData.network.macAddress} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
				<div><label for="clientId" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">MQTT Client ID</label><input id="clientId" type="text" bind:value={formData.mqtt.clientId} disabled={isReadOnly} class="w-full rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
			</div>
		</div>
	</div>

	<div slot="footer">
		{#if !isReadOnly}
			<button on:click={() => dispatch('close')} class="rounded-lg border bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">취소</button>
			<button on:click={handleSave} class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
				{modalMode === 'create' ? '등록' : '수정'}
			</button>
		{:else}
			<button on:click={() => dispatch('close')} class="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700">닫기</button>
		{/if}
	</div>
</BaseModal>
