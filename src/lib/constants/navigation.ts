// src/lib/constants/navigation.ts - 메뉴 데이터만 분리 (가장 중요)
import {
	BarChart3,
	Monitor,
	Gamepad2,
	Wrench,
	Settings,
	FileText,
	MapPin,
	Users
} from 'lucide-svelte';

export const MENU_ITEMS = [
	{
		id: 'dashboard',
		label: '대시보드',
		icon: BarChart3,
		path: '/dashboard',
		description: '전체 현황 요약'
	},
	{
		id: 'maps',
		label: '골프장 관리',
		icon: MapPin,
		path: '/dashboard/maps',
		description: '코스 지도 및 경로 설정'
	},
	{
		id: 'control',
		label: '카트 제어',
		icon: Gamepad2,
		path: '/dashboard/control',
		description: '원격 제어 및 경로 설정'
	},
	{
		id: 'monitoring',
		label: '실시간 모니터링',
		icon: Monitor,
		path: '/dashboard/monitoring',
		description: '카트 위치 및 상태'
	},
	{
		id: 'maintenance',
		label: '유지보수 관리',
		icon: Wrench,
		path: '/dashboard/maintenance',
		description: '정비 스케줄 및 부품 관리'
	},
	{
		id: 'users',
		label: '사용자 관리',
		icon: Users,
		path: '/dashboard/users',
		description: '운영진 및 권한 관리'
	},
	{
		id: 'logs',
		label: '시스템 로그',
		icon: FileText,
		path: '/dashboard/logs',
		description: '활동 기록 및 감사'
	},
	{
		id: 'settings',
		label: '시스템 설정',
		icon: Settings,
		path: '/dashboard/settings',
		description: '전체 시스템 구성'
	}
];
