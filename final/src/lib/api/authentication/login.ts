import { signIn } from 'next-auth/react';

export default async function logIn(email: string, password: string) {
	try {
		const result = await signIn('credentials', {
			email,
			password,
			redirect: false,
		});
		return result && result.ok;
	} catch (error) {
		return false;
	}
}
