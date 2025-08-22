import {
	LayoutGrid,
	Building2,
	List,
	Map,
	// Car,
	// Briefcase,
	// FileText,
	// Radio,
	// Wrench,
	// TrendingUp,
	Upload,
	Settings,
	Package
	// Users,
	// AlertCircle,
	// DollarSign
} from 'lucide-svelte';

import type { ComponentType } from 'svelte';

export type NavMenuItem = {
	id: string;
	label: string;
	icon: ComponentType; // Lucide-svelte component
	path?: string;
	description?: string;
	children?: NavMenuItem[];
	section?: string;
};

export const MENU_ITEMS: NavMenuItem[] = [
	// 비즈니스 관리
	{
		id: 'dashboard',
		label: '비즈니스 대시보드',
		icon: LayoutGrid,
		path: '/dashboard',
		description: '전체 현황 및 주요 지표',
		section: '비즈니스 관리'
	},
	{
		id: 'client-management',
		label: '고객사 관리',
		icon: Building2,
		section: '비즈니스 관리',
		children: [
			{
				id: 'client-list',
				label: '고객사 목록',
				icon: List,
				path: '/dashboard/clients',
				description: '골프장 고객사 정보 관리'
			}
			// {
			// 	id: 'client-analytics',
			// 	label: '고객사 분석',
			// 	icon: TrendingUp,
			// 	path: '/dashboard/clients/analytics',
			// 	description: '고객사별 성과 분석'
			// }
		]
	},
	// {
	// 	id: 'sales-management',
	// 	label: '영업 관리',
	// 	icon: Briefcase,
	// 	section: '비즈니스 관리',
	// 	children: [
	// 		{
	// 			id: 'sales-pipeline',
	// 			label: '영업 파이프라인',
	// 			icon: TrendingUp,
	// 			path: '/dashboard/sales',
	// 			description: '영업 기회 및 진행 현황'
	// 		},
	// 		{
	// 			id: 'revenue-analysis',
	// 			label: '매출 분석',
	// 			icon: DollarSign,
	// 			path: '/dashboard/sales/revenue',
	// 			description: '매출 현황 및 분석'
	// 		}
	// 	]
	// },
	// {
	// 	id: 'contract-management',
	// 	label: '계약 관리',
	// 	icon: FileText,
	// 	path: '/dashboard/contracts',
	// 	description: '계약 현황 및 관리',
	// 	section: '비즈니스 관리'
	// },

	// 카트 관리
	{
		id: 'product-management',
		label: '카트 관리',
		icon: Package,
		section: '카트 관리',
		children: [
			{
				id: 'cart-models',
				label: '카트 모델',
				icon: Settings,
				path: '/dashboard/cart-models',
				description: '카트 모델 등록 및 관리'
			},
			{
				id: 'cart-inventory',
				label: '카트 재고',
				icon: List,
				path: '/dashboard/cart-inventory',
				description: '카트 재고 및 배치 관리'
			}
		]
	},
	// {
	// 	id: 'cart-delivery',
	// 	label: '납품 카트 관리',
	// 	icon: Car,
	// 	section: '제품 관리',
	// 	children: [
	// 		{
	// 			id: 'delivered-carts',
	// 			label: '납품 카트 현황',
	// 			icon: List,
	// 			path: '/dashboard/carts',
	// 			description: '고객사별 납품된 카트 관리'
	// 		},
	// 		{
	// 			id: 'cart-monitoring',
	// 			label: '실시간 모니터링',
	// 			icon: Radio,
	// 			path: '/dashboard/monitoring',
	// 			description: '카트 실시간 상태 모니터링'
	// 		}
	// 	]
	// },
	// {
	// 	id: 'maintenance-management',
	// 	label: 'A/S 관리',
	// 	icon: Wrench,
	// 	section: '제품 관리',
	// 	children: [
	// 		{
	// 			id: 'maintenance-requests',
	// 			label: 'A/S 요청',
	// 			icon: AlertCircle,
	// 			path: '/dashboard/maintenance',
	// 			description: 'A/S 요청 및 처리 현황'
	// 		},
	// 		{
	// 			id: 'maintenance-schedule',
	// 			label: '정기 점검',
	// 			icon: List,
	// 			path: '/dashboard/maintenance/schedule',
	// 			description: '정기 점검 일정 관리'
	// 		}
	// 	]
	// },

	// 기술 서비스
	{
		id: 'map-service',
		label: '맵 서비스 관리',
		icon: Map,
		section: '기술 서비스',
		children: [
			{
				id: 'client-maps',
				label: '고객사별 맵',
				icon: List,
				path: '/dashboard/maps',
				description: '고객사별 맵 데이터 관리'
			},
			{
				id: 'map-updates',
				label: '맵 업데이트 배포',
				icon: Upload,
				path: '/dashboard/maps/updates',
				description: '맵 버전 관리 및 배포'
			}
		]
	}
	// {
	// 	id: 'analytics',
	// 	label: '데이터 분석',
	// 	icon: TrendingUp,
	// 	path: '/dashboard/analytics',
	// 	description: '통합 데이터 분석 및 리포트',
	// 	section: '기술 서비스'
	// },

	// 설정
	// {
	// 	id: 'user-management',
	// 	label: '사용자 관리',
	// 	icon: Users,
	// 	path: '/dashboard/users',
	// 	description: 'DY 직원 계정 관리',
	// 	section: '설정'
	// },
	// {
	// 	id: 'system-settings',
	// 	label: '시스템 설정',
	// 	icon: Settings,
	// 	path: '/dashboard/settings',
	// 	description: '시스템 전반 설정',
	// 	section: '설정'
	// }
];

// 섹션별로 메뉴 아이템들을 그룹화
export const MENU_SECTIONS = [
	'비즈니스 관리',
	'카트 관리',
	'기술 서비스'
	// '설정'
];

export function getMenuItemsBySection(section: string): NavMenuItem[] {
	return MENU_ITEMS.filter((item) => item.section === section);
}
