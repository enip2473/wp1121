import { NextResponse, type NextRequest } from 'next/server';

import bcrypt from 'bcrypt';
import { z } from 'zod';

import { db } from '@/db';
import { usersTable } from '@/db/schema';

const PostRequestSchema = z.object({
	email: z.string().email().min(1),
	name: z.string().min(1),
	password: z.string().min(1),
});
export const revalidate = 0;

type PostRequestType = z.infer<typeof PostRequestSchema>;

export async function POST(req: NextRequest) {
	const data = await req.json();
	try {
		PostRequestSchema.parse(data);
	} catch (error) {
		console.error('Error parsing request in api/users/route.ts');
		return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
	}
	const { name, email, password } = data as PostRequestType;

	const existingUser = await db.query.usersTable.findFirst({
		where: (user, { eq }) => eq(user.email, email),
	});

	if (existingUser) {
		return NextResponse.json({ error: 'User already exists' }, { status: 400 });
	}

	const hashedPassword = await bcrypt.hash(password, 10);
	const newUser = await db.insert(usersTable).values({
		email,
		name,
		password: hashedPassword,
	});

	if (newUser) {
		return NextResponse.json({ message: 'User created' }, { status: 201 });
	} else {
		return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
	}
}
