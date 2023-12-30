import type { AuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import bcrypt from 'bcrypt';

import { db } from '@/db';

export const authOptions: AuthOptions = {
	secret: process.env.NEXTAUTH_SECRET,
	session: {
		strategy: 'jwt',
	},
	callbacks: {
		async session({ session, token }) {
			if (session.user) {
				session.user.userId = token.userId;
			}
			return session;
		},
		async jwt({ token, user, account }) {
			const extendedUser = user as User & { userId?: number };
			if (extendedUser) {
				token.userId = extendedUser.userId;
			}
			if (account) {
				token.accessToken = account.access_token;
			}
			return token;
		},
	},
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'email', type: 'text' },
				password: { label: 'password', type: 'password' },
			},
			async authorize(credentials, _) {
				if (!credentials) return null;
				const { email, password } = credentials;
				const dbUser = await db.query.usersTable.findFirst({
					where: (user, { eq }) => eq(user.email, email),
				});
				if (!dbUser) return null;
				const isMatch = await bcrypt.compare(password, dbUser.password);
				if (isMatch) {
					return {
						id: dbUser.userId.toString(),
						userId: dbUser.userId,
						name: dbUser.name,
					};
				}
				return null;
			},
		}),
	],
};
