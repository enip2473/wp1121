import api from '@/lib/api/base';

export default async function signUp(email: string, username: string, password: string) {
	try {
		await api.post('/api/users', {
			email,
			name: username,
			password,
		});
		return true;
	} catch (error) {
		console.error(error);
		return false;
	}
}
