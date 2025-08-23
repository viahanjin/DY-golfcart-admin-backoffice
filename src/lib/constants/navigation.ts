import {
	LayoutGrid,
	MapPin,
	List,
	Map,
	Car,
	Route,
	Users,
	Settings,
	BarChart3
} from 'lucide-svelte';

export type NavMenuItem = {
	id: string;
	label: string;
	icon: any; // Lucide-svelte component
	path?: string;
	description?: string;
	children?: NavMenuItem[];
};

export const MENU_ITEMS: NavMenuItem[] = [
	{
		id: 'dashboard',
		label: '대시보드',
		icon: LayoutGrid,
		path: '/dashboard',
		description: '전체 현황 요약'
	},
	{
		id: 'golf-course-management',
		label: '골프장 관리',
		icon: MapPin,
		children: [
			{
				id: 'golf-course-list',
				label: '골프장 목록',
				icon: List,
				path: '/dashboard/golf-courses'
			},
			{
				id: 'golf-course-status',
				label: '골프장 현황',
				icon: BarChart3,
				path: '/dashboard/golf-courses/status'
			}
		]
	},
	{
		id: 'cart-management',
		label: '카트 관리',
		icon: Car,
		children: [
			{
				id: 'cart-list',
				label: '카트 목록',
				icon: List,
				path: '/dashboard/carts'
			},
			{
				id: 'cart-status',
				label: '카트 상태 현황',
				icon: BarChart3,
				path: '/dashboard/carts/status'
			}
		]
	},
	// {
	// 	id: 'course-management',
	// 	label: '코스 관리',
	// 	icon: Route,
	// 	children: [
	// 		{
	// 			id: 'course-list',
	// 			label: '코스 목록',
	// 			icon: List,
	// 			path: '/dashboard/courses'
	// 		}
	// 	]
	// },
	{
		id: 'map-management',
		label: '맵 관리',
		icon: Map,
		children: [
			{
				id: 'map-list',
				label: '맵 목록',
				icon: List,
				path: '/dashboard/maps'
			},
			{
				id: 'map-status',
				label: '맵 상태 관리',
				icon: BarChart3,
				path: '/dashboard/maps/status'
			}
		]
	},
	{
		id: 'client-management',
		label: '고객 관리',
		icon: Users,
		path: '/dashboard/clients'
	},
	{
		id: 'user-management',
		label: '사용자 관리',
		icon: Settings,
		path: '/dashboard/users'
	},
	{
		id: 'system-settings',
		label: '시스템 설정',
		icon: Settings,
		path: '/dashboard/settings'
	}
];
