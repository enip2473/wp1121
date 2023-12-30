import { signOut } from 'next-auth/react';

export default async function logOut() {
	try {
		await signOut({ redirect: true, callbackUrl: '/' });
		return true;
	} catch (error) {
		console.error('Error during sign out:', error);
		return false;
	}
}
