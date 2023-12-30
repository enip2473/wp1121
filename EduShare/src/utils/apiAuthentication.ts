import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/utils/authOptions';

export const getSessionUserId: () => Promise<number | null> = async () => {
	const session = await getServerSession(authOptions);
	if (!session) return null;
	return session.user.userId || null;
};
