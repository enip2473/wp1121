import NextAuth from 'next-auth';

declare module 'next-auth' {
	interface Session {
		user: {
			userId: number;
		} & DefaultSession['user'];
	}
}
