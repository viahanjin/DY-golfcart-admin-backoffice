// src/routes/+page.server.ts - 서버사이드 리다이렉트 (더 깔끔한 방법)
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// 서버에서 바로 로그인 페이지로 리다이렉트
	// 이렇게 하면 클라이언트에서 깜빡임 없이 바로 로그인 화면이 뜸
	throw redirect(302, '/login');
};
