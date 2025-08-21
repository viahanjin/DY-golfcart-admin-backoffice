export interface FileNode {
	name: string;
	path: string;
	type: 'file' | 'folder';
	size?: number;
	children?: FileNode[];
	expanded?: boolean;
}

/**
 * 숨김 파일인지 확인합니다.
 */
function isHiddenFile(fileName: string): boolean {
	return fileName.startsWith('.') || 
		   fileName === 'Thumbs.db' || 
		   fileName === 'desktop.ini' ||
		   fileName.toLowerCase().includes('__macosx');
}

/**
 * File 배열에서 폴더 트리 구조를 생성합니다.
 */
export function buildFolderTree(files: File[]): FileNode[] {
	const tree: FileNode[] = [];
	const pathMap = new Map<string, FileNode>();

	// 숨김 파일 제외하고 필터링
	const filteredFiles = files.filter(file => {
		const pathParts = file.webkitRelativePath.split('/');
		// 경로의 어떤 부분이라도 숨김 파일이면 제외
		return !pathParts.some(part => isHiddenFile(part));
	});

	// 필터링된 파일들로 트리 구조 생성
	filteredFiles.forEach(file => {
		const pathParts = file.webkitRelativePath.split('/');
		let currentPath = '';
		let currentLevel = tree;

		// 경로의 각 부분을 순회하며 폴더 구조 생성
		pathParts.forEach((part, index) => {
			currentPath = currentPath ? `${currentPath}/${part}` : part;
			const isFile = index === pathParts.length - 1;

			// 이미 존재하는 노드인지 확인
			let existingNode = currentLevel.find(node => node.name === part);

			if (!existingNode) {
				// 새 노드 생성
				const newNode: FileNode = {
					name: part,
					path: currentPath,
					type: isFile ? 'file' : 'folder',
					children: isFile ? undefined : [],
					expanded: false,
					size: isFile ? file.size : undefined
				};

				currentLevel.push(newNode);
				pathMap.set(currentPath, newNode);
				existingNode = newNode;
			}

			// 폴더인 경우 다음 레벨로 이동
			if (!isFile && existingNode.children) {
				currentLevel = existingNode.children;
			}
		});
	});

	// 폴더를 먼저, 파일을 나중에 정렬
	return sortTreeNodes(tree);
}

/**
 * 트리 노드를 정렬합니다 (폴더 우선, 이름순)
 */
function sortTreeNodes(nodes: FileNode[]): FileNode[] {
	return nodes.sort((a, b) => {
		// 폴더를 파일보다 먼저
		if (a.type !== b.type) {
			return a.type === 'folder' ? -1 : 1;
		}
		// 같은 타입이면 이름순
		return a.name.localeCompare(b.name);
	}).map(node => ({
		...node,
		children: node.children ? sortTreeNodes(node.children) : undefined
	}));
}

/**
 * 트리에서 특정 타입의 파일들을 찾습니다.
 */
export function findFilesByExtension(tree: FileNode[], extension: string): FileNode[] {
	const result: FileNode[] = [];
	
	function traverse(nodes: FileNode[]) {
		nodes.forEach(node => {
			if (node.type === 'file' && node.name.toLowerCase().endsWith(extension.toLowerCase())) {
				result.push(node);
			} else if (node.children) {
				traverse(node.children);
			}
		});
	}
	
	traverse(tree);
	return result;
}

/**
 * 트리의 통계 정보를 계산합니다.
 */
export function getTreeStats(tree: FileNode[]): {
	totalFiles: number;
	totalFolders: number;
	totalSize: number;
	jsonFiles: number;
	imageFiles: number;
} {
	let totalFiles = 0;
	let totalFolders = 0;
	let totalSize = 0;
	let jsonFiles = 0;
	let imageFiles = 0;

	function traverse(nodes: FileNode[]) {
		nodes.forEach(node => {
			if (node.type === 'file') {
				totalFiles++;
				totalSize += node.size || 0;
				
				const ext = node.name.split('.').pop()?.toLowerCase();
				if (ext === 'json') jsonFiles++;
				if (['png', 'jpg', 'jpeg', 'gif'].includes(ext || '')) imageFiles++;
			} else {
				totalFolders++;
				if (node.children) {
					traverse(node.children);
				}
			}
		});
	}
	
	traverse(tree);
	
	return {
		totalFiles,
		totalFolders,
		totalSize,
		jsonFiles,
		imageFiles
	};
}

/**
 * 폴더 구조에서 서브폴더들을 찾습니다.
 */
export function findSubfolders(tree: FileNode[]): FileNode[] {
	const subfolders: FileNode[] = [];
	
	function traverse(nodes: FileNode[], depth: number = 0) {
		nodes.forEach(node => {
			console.log(`폴더 확인 중: ${node.name}, 타입: ${node.type}, depth: ${depth}, children: ${node.children?.length || 0}`);
			if (node.type === 'folder' && node.children) {
				// depth가 0보다 크면 실제 서브폴더 (최상위 폴더 제외)
				if (depth > 0) {
					subfolders.push(node);
				}
				traverse(node.children, depth + 1);
			}
		});
	}
	
	traverse(tree, 0);
	console.log('찾은 서브폴더들 (최상위 제외):', subfolders.map(f => f.name));
	return subfolders;
}

/**
 * 중첩된 폴더 구조에서 메타데이터가 포함된 서브폴더들을 검증합니다.
 * 구조: 최상위폴더(동적) > 서브폴더 > 메타데이터JSON + GeoJSON 파일들
 * 또는: 최상위폴더(동적) > 메타데이터JSON 파일들 (직접)
 */
export function validateNestedMetadataStructure(tree: FileNode[]): {
	isValid: boolean;
	errors: string[];
	warnings: string[];
	validSubfolders: Array<{
		folder: FileNode;
		metadataFiles: FileNode[];
		geoJsonFiles: FileNode[];
		otherJsonFiles: FileNode[];
	}>;
} {
	const errors: string[] = [];
	const warnings: string[] = [];
	const validSubfolders: Array<{
		folder: FileNode;
		metadataFiles: FileNode[];
		geoJsonFiles: FileNode[];
		otherJsonFiles: FileNode[];
	}> = [];

	console.log('전체 트리 구조:', JSON.stringify(tree, null, 2));

	// 최상위 폴더들 확인
	if (tree.length === 0) {
		errors.push('폴더가 비어있습니다.');
		return { isValid: false, errors, warnings, validSubfolders };
	}

	// 최상위 폴더 검사
	tree.forEach(topFolder => {
		console.log(`최상위 폴더 검사: ${topFolder.name}`);
		if (topFolder.type !== 'folder' || !topFolder.children) return;

		// 최상위 폴더에서 직접 메타데이터 파일 확인
		const topLevelJsonFiles = topFolder.children.filter(file => 
			file.type === 'file' && file.name.toLowerCase().endsWith('.json')
		);
		
		const topLevelGeoJsonFiles = topFolder.children.filter(file => 
			file.type === 'file' && file.name.toLowerCase().endsWith('.geojson')
		);

		console.log(`${topFolder.name}의 최상위 JSON 파일들:`, topLevelJsonFiles.map(f => f.name));
		console.log(`${topFolder.name}의 최상위 GeoJSON 파일들:`, topLevelGeoJsonFiles.map(f => f.name));

		// 최상위에 메타데이터가 있는 경우
		const topLevelMetadataFiles = topLevelJsonFiles.filter(file => {
			const name = file.name.toLowerCase();
			return name.includes('.meta.json') || name.includes('.holes.json') || name.includes('meta.json');
		});

		if (topLevelMetadataFiles.length > 0 || topLevelGeoJsonFiles.length > 0) {
			console.log(`${topFolder.name}: 최상위에서 메타데이터 발견`);
			validSubfolders.push({
				folder: topFolder,
				metadataFiles: topLevelMetadataFiles,
				geoJsonFiles: topLevelGeoJsonFiles,
				otherJsonFiles: topLevelJsonFiles.filter(file => 
					!topLevelMetadataFiles.some(meta => meta.name === file.name) &&
					!topLevelGeoJsonFiles.some(geo => geo.name === file.name)
				)
			});
		}

		// 서브폴더들 검사
		const subfolders = topFolder.children.filter(child => child.type === 'folder');
		console.log(`${topFolder.name}의 서브폴더들:`, subfolders.map(f => f.name));

		subfolders.forEach(subfolder => {
			console.log(`서브폴더 검증 중: ${subfolder.name}, children: ${subfolder.children?.length || 0}`);
			if (!subfolder.children) return;

			const jsonFiles = subfolder.children.filter((file: FileNode) => 
				file.type === 'file' && file.name.toLowerCase().endsWith('.json')
			);
			console.log(`${subfolder.name}의 JSON 파일들:`, jsonFiles.map(f => f.name));
			
			const geoJsonFiles = subfolder.children.filter((file: FileNode) => 
				file.type === 'file' && file.name.toLowerCase().endsWith('.geojson')
			);
			console.log(`${subfolder.name}의 GeoJSON 파일들:`, geoJsonFiles.map(f => f.name));
			
			// 메타데이터 파일 패턴 확장 (.meta.json, .holes.json 등)
			const metadataFiles = jsonFiles.filter((file: FileNode) => {
				const name = file.name.toLowerCase();
				return name.includes('.meta.json') || 
					   name.includes('.holes.json') || 
					   name.includes('meta.json') ||
					   ['map.json', 'layers.json', 'courses.json', 'markers.json'].includes(name);
			});
			console.log(`${subfolder.name}의 메타데이터 파일들:`, metadataFiles.map(f => f.name));
			
			const otherJsonFiles = jsonFiles.filter((file: FileNode) => 
				!geoJsonFiles.some(geo => geo.name === file.name) && 
				!metadataFiles.some((meta: FileNode) => meta.name === file.name)
			);
			console.log(`${subfolder.name}의 기타 JSON 파일들:`, otherJsonFiles.map(f => f.name));

			// 메타데이터나 GeoJSON 파일이 있는 서브폴더를 유효한 것으로 간주
			if (metadataFiles.length > 0 || geoJsonFiles.length > 0) {
				console.log(`${subfolder.name}: 유효한 서브폴더로 인정`);
				validSubfolders.push({
					folder: subfolder,
					metadataFiles,
					geoJsonFiles,
					otherJsonFiles
				});

				// GeoJSON 파일 확인
				if (geoJsonFiles.length === 0) {
					warnings.push(`${subfolder.name}: GeoJSON 파일이 없습니다.`);
				}
			} else {
				console.log(`${subfolder.name}: 메타데이터나 GeoJSON 파일이 없어서 유효하지 않음`);
			}
		});
	});

	if (validSubfolders.length === 0) {
		errors.push('유효한 메타데이터가 포함된 폴더나 서브폴더가 없습니다.');
	}

	console.log('검증 완료:', { validCount: validSubfolders.length, errors, warnings });

	return {
		isValid: errors.length === 0 && validSubfolders.length > 0,
		errors,
		warnings,
		validSubfolders
	};
}

/**
 * 필수 메타데이터 파일들이 있는지 검증합니다 (레거시 지원용).
 */
export function validateMetadataStructure(tree: FileNode[]): {
	isValid: boolean;
	errors: string[];
	warnings: string[];
} {
	// 새로운 중첩 구조 검증 먼저 시도
	const nestedValidation = validateNestedMetadataStructure(tree);
	if (nestedValidation.isValid) {
		return {
			isValid: true,
			errors: nestedValidation.errors,
			warnings: nestedValidation.warnings
		};
	}

	// 레거시 플랫 구조 검증
	const errors: string[] = [];
	const warnings: string[] = [];
	
	const jsonFiles = findFilesByExtension(tree, '.json');
	const jsonFileNames = jsonFiles.map(f => f.name.toLowerCase());
	
	// 필수 파일 확인
	const requiredFiles = ['map.json', 'layers.json'];
	const missingRequired = requiredFiles.filter(file => !jsonFileNames.includes(file));
	
	if (missingRequired.length > 0) {
		errors.push(`필수 파일이 누락되었습니다: ${missingRequired.join(', ')}`);
	}
	
	// 권장 파일 확인
	const recommendedFiles = ['courses.json', 'markers.json'];
	const missingRecommended = recommendedFiles.filter(file => !jsonFileNames.includes(file));
	
	if (missingRecommended.length > 0) {
		warnings.push(`권장 파일이 누락되었습니다: ${missingRecommended.join(', ')}`);
	}
	
	// JSON 파일이 너무 적은 경우
	if (jsonFiles.length < 2) {
		warnings.push('메타데이터 파일이 너무 적습니다. 최소 2개 이상의 JSON 파일이 필요합니다.');
	}
	
	return {
		isValid: errors.length === 0,
		errors,
		warnings
	};
}