import { NextResponse, type NextRequest } from 'next/server';

import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import { usersTable } from '@/db/schema';

export const revalidate = 0;

const PutRequestSchema = z.object({
	userId: z.number().min(1),
	pointsDiff: z.number(),
});

type PutRequestType = z.infer<typeof PutRequestSchema>;

export async function PUT(req: NextRequest) {
	const data = await req.json();

	try {
		PutRequestSchema.parse(data);
	} catch (error) {
		console.error('Error parsing request in api/users/points/route.ts');
		return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
	}

	if (data.pointsDiff < 0) {
		return NextResponse.json({ error: 'pointsDiff cannot be negative' }, { status: 400 });
	}

	const operation = data as PutRequestType;

	const updatedUsers = await db
		.update(usersTable)
		.set({ points: sql`${usersTable.points} + ${operation.pointsDiff}` })
		.where(eq(usersTable.userId, data.userId))
		.returning({
			userId: usersTable.userId,
			points: usersTable.points,
		});

	if (updatedUsers.length !== 1) {
		return NextResponse.json({ error: 'User not found' }, { status: 404 });
	}

	const updatedUser = updatedUsers[0];
	return NextResponse.json(updatedUser, { status: 200 });
}
