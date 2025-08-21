import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

// 기본 테마 설정 (시스템 설정 또는 라이트 모드)
const defaultTheme: Theme = 'light';

// 초기 테마 값 가져오기
function getInitialTheme(): Theme {
	if (!browser) return defaultTheme;

	// 로컬스토리지에서 저장된 테마 확인
	const stored = localStorage.getItem('theme');
	if (stored === 'light' || stored === 'dark') {
		return stored;
	}

	// 시스템 다크모드 설정 확인
	if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
		return 'dark';
	}

	return defaultTheme;
}

// 테마 스토어 생성
export const theme = writable<Theme>(getInitialTheme());

// 테마 토글 함수
export function toggleTheme() {
	theme.update(currentTheme => {
		const newTheme = currentTheme === 'light' ? 'dark' : 'light';
		
		if (browser) {
			// 로컬스토리지에 저장
			localStorage.setItem('theme', newTheme);
			
			// DOM에 클래스 적용
			if (newTheme === 'dark') {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		}
		
		return newTheme;
	});
}

// 특정 테마로 설정
export function setTheme(newTheme: Theme) {
	theme.set(newTheme);
	
	if (browser) {
		localStorage.setItem('theme', newTheme);
		
		if (newTheme === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}
}

// 시스템 테마 감지
export function watchSystemTheme() {
	if (!browser) return;

	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	
	mediaQuery.addEventListener('change', (e) => {
		// 사용자가 수동으로 설정한 테마가 없을 때만 시스템 설정을 따름
		const storedTheme = localStorage.getItem('theme');
		if (!storedTheme) {
			setTheme(e.matches ? 'dark' : 'light');
		}
	});
}

// 초기 DOM 클래스 설정
if (browser) {
	const initialTheme = getInitialTheme();
	if (initialTheme === 'dark') {
		document.documentElement.classList.add('dark');
	} else {
		document.documentElement.classList.remove('dark');
	}
}