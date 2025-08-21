<script lang="ts">
	import { Map, Navigation, AlertTriangle, CheckCircle } from 'lucide-svelte';
	import type { GeoJSONPreviewData } from '$lib/utils/geojson-preview';
	import { formatCoordinate, validateBounds } from '$lib/utils/geojson-preview';

	export let previewData: GeoJSONPreviewData[] = [];

	function getGeometryTypeIcon(type: string): string {
		switch (type) {
			case 'Point':
			case 'MultiPoint':
				return '📍';
			case 'LineString':
			case 'MultiLineString':
				return '📏';
			case 'Polygon':
			case 'MultiPolygon':
				return '🔷';
			default:
				return '📍';
		}
	}

	function getGeometryTypeLabel(type: string): string {
		switch (type) {
			case 'Point':
				return '점';
			case 'MultiPoint':
				return '다중점';
			case 'LineString':
				return '선';
			case 'MultiLineString':
				return '다중선';
			case 'Polygon':
				return '면';
			case 'MultiPolygon':
				return '다중면';
			default:
				return type;
		}
	}

</script>

{#if previewData.length > 0}
	<div class="space-y-4">
		<div class="flex items-center gap-2 mb-3">
			<Map class="h-5 w-5 text-blue-600" />
			<h5 class="font-medium text-gray-900 dark:text-white">GeoJSON 미리보기</h5>
			<span class="text-sm text-gray-500 dark:text-gray-400">({previewData.length}개 파일)</span>
		</div>

		{#each previewData as data}
			{@const boundsValidation = validateBounds(data.bounds)}
			<div class="rounded-lg border p-4 dark:border-gray-600">
				<div class="flex items-center gap-2 mb-3">
					<span class="text-sm font-medium text-gray-900 dark:text-white">{data.fileName}</span>
					{#if boundsValidation.isValid}
						<CheckCircle class="h-4 w-4 text-green-600" />
					{:else}
						<AlertTriangle class="h-4 w-4 text-red-600" />
					{/if}
					<span class="text-xs text-gray-500 dark:text-gray-400">{data.featureCount}개 피처</span>
				</div>

				<!-- Geometry Types -->
				<div class="flex gap-2 mb-3">
					{#each data.geometryTypes as type}
						<span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded dark:bg-blue-900 dark:text-blue-200">
							<span>{getGeometryTypeIcon(type)}</span>
							{getGeometryTypeLabel(type)}
						</span>
					{/each}
				</div>

				<!-- Bounds Information -->
				<div class="grid grid-cols-2 gap-3 mb-3 text-xs">
					<div class="space-y-1">
						<div class="font-medium text-gray-700 dark:text-gray-300">위도 범위</div>
						<div class="text-gray-600 dark:text-gray-400">
							북: {formatCoordinate(data.bounds.north, 'lat')}
						</div>
						<div class="text-gray-600 dark:text-gray-400">
							남: {formatCoordinate(data.bounds.south, 'lat')}
						</div>
					</div>
					<div class="space-y-1">
						<div class="font-medium text-gray-700 dark:text-gray-300">경도 범위</div>
						<div class="text-gray-600 dark:text-gray-400">
							동: {formatCoordinate(data.bounds.east, 'lng')}
						</div>
						<div class="text-gray-600 dark:text-gray-400">
							서: {formatCoordinate(data.bounds.west, 'lng')}
						</div>
					</div>
				</div>

				<!-- Bounds Center -->
				<div class="flex items-center gap-2 mb-3">
					<Navigation class="h-4 w-4 text-gray-500" />
					<span class="text-xs text-gray-600 dark:text-gray-400">
						중심점: {formatCoordinate((data.bounds.north + data.bounds.south) / 2, 'lat')}, 
						{formatCoordinate((data.bounds.east + data.bounds.west) / 2, 'lng')}
					</span>
				</div>

				<!-- Validation Errors -->
				{#if !boundsValidation.isValid}
					<div class="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
						<div class="text-xs font-medium mb-1">좌표 오류:</div>
						{#each boundsValidation.errors as error}
							<div class="text-xs">• {error}</div>
						{/each}
					</div>
				{:else}
					<div class="mt-2 p-2 bg-green-50 border border-green-200 rounded text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
						<div class="text-xs">✓ 좌표가 유효한 범위 내에 있습니다</div>
					</div>
				{/if}

				<!-- Sample Features -->
				{#if data.data.features.length > 0}
					<details class="mt-3">
						<summary class="text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200">
							샘플 피처 보기 (최대 3개)
						</summary>
						<div class="mt-2 space-y-2">
							{#each data.data.features.slice(0, 3) as feature, index}
								<div class="p-2 bg-gray-50 rounded text-xs dark:bg-gray-700/50">
									<div class="font-medium text-gray-700 dark:text-gray-300">
										피처 #{index + 1}: {feature.geometry.type}
									</div>
									{#if feature.properties && Object.keys(feature.properties).length > 0}
										<div class="text-gray-600 dark:text-gray-400 mt-1">
											속성: {Object.entries(feature.properties).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(', ')}
											{#if Object.keys(feature.properties).length > 3}
												...
											{/if}
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</details>
				{/if}
			</div>
		{/each}
	</div>
{:else}
	<div class="text-center py-8 text-gray-500 dark:text-gray-400">
		<Map class="h-12 w-12 mx-auto mb-2 opacity-50" />
		<p class="text-sm">GeoJSON 파일을 찾을 수 없습니다</p>
	</div>
{/if}