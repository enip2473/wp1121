import { NextResponse, type NextRequest } from 'next/server';

import { eq, and } from 'drizzle-orm';

import { db } from '@/db';
import { usersTable } from '@/db/schema';
import { isSameDateInUTC8 } from '@/lib/utils';
import { getSessionUserId } from '@/utils/apiAuthentication';

export const revalidate = 0;

export async function PUT(req: NextRequest, { params }: { params: { userId: string } }) {
	const sessionUserId = await getSessionUserId();
	if (!sessionUserId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const userId = parseInt(params.userId);

	if (userId !== sessionUserId) {
		return NextResponse.json({ error: 'Wrong endpoints [userId]' }, { status: 401 });
	}

	try {
		const [user] = await db
			.select({
				lastSigned: usersTable.lastSigned,
				points: usersTable.points,
			})
			.from(usersTable)
			.where(eq(usersTable.userId, sessionUserId));

		if (!user || !user.points) {
			return NextResponse.json({ error: 'User not found!' }, { status: 404 });
		}

		const currentDate = new Date();
		if (isSameDateInUTC8(user.lastSigned as Date, currentDate)) {
			return NextResponse.json({ error: 'Already Signed!' }, { status: 400 });
		}

		const [updatedUser] = await db
			.update(usersTable)
			.set({
				lastSigned: currentDate,
				points: user.points + 1,
			})
			.where(and(eq(usersTable.userId, sessionUserId), eq(usersTable.points, user.points)))
			.returning({
				userId: usersTable.userId,
				lastSigned: usersTable.lastSigned,
			});

		if (!updatedUser) {
			return NextResponse.json({ error: 'Race Condition' }, { status: 500 });
		}
	} catch (error) {
		return NextResponse.json({ error: 'Server Error' }, { status: 500 });
	}
	return NextResponse.json({ success: true }, { status: 200 });
}
