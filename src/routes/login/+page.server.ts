// src/routes/login/+page.server.ts - 로그인 처리 (임시)
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const email = data.get('email') as string;
		const password = data.get('password') as string;

		console.log('로그인 시도:', { email, password });

		// 임시 하드코딩된 인증 (나중에 DB로 변경)
		if (email === 'admin@dy.com' && password === 'SystemAdminPassword123') {
			console.log('로그인 성공!');
			throw redirect(302, '/dashboard');
		}

		// 실패 시
		return fail(400, {
			error: '이메일 또는 비밀번호가 올바르지 않습니다',
			email
		});
	}
};
