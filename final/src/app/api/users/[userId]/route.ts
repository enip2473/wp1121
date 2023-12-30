import { NextResponse, type NextRequest } from 'next/server';

import bcrypt from 'bcrypt';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import { usersTable } from '@/db/schema';
import { isSameDateInUTC8 } from '@/lib/utils';
import { getSessionUserId } from '@/utils/apiAuthentication';

export const revalidate = 0;

const GetRequestSchema = z.number().min(1);

const GetResponseSchema = z.object({
	userId: z.number(),
	name: z.string(),
	email: z.string(),
	profilePicture: z.string().optional().nullable(),
	points: z.number(),
	lastSigned: z.date(),
	posts: z.array(
		z.object({
			upvotes: z.array(
				z.object({
					userId: z.number(),
				}),
			),
			downvotes: z.array(
				z.object({
					userId: z.number(),
				}),
			),
			favorites: z.array(
				z.object({
					userId: z.number(),
				}),
			),
		}),
	),
	questions: z.array(
		z.object({
			upvotes: z.array(
				z.object({
					userId: z.number(),
				}),
			),
			favorites: z.array(
				z.object({
					userId: z.number(),
				}),
			),
		}),
	),
	comments: z.array(
		z.object({
			upvotes: z.array(
				z.object({
					userId: z.number(),
				}),
			),
			downvotes: z.array(
				z.object({
					userId: z.number(),
				}),
			),
			isHelpful: z.boolean(),
		}),
	),
});

const PutRequestSchema = z.object({
	userId: z.number().min(1),
	currentPassword: z.string().min(1),
	newName: z.string().optional(),
	newProfilePicture: z.string().optional(),
	newPassword: z.string().optional(),
});

type GetResponseType = z.infer<typeof GetResponseSchema>;

type PutRequestType = z.infer<typeof PutRequestSchema>;

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
	const userId = parseInt(params.userId);
	try {
		GetRequestSchema.parse(userId);
	} catch (error) {
		console.error('Error parsing request in api/users/[userId]/route.ts');
		return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
	}

	const user = await db.query.usersTable.findFirst({
		where: (user, { eq }) => eq(user.userId, userId),
		columns: {
			password: false,
		},
		with: {
			posts: {
				columns: {},
				with: {
					upvotes: {
						columns: {
							userId: true,
						},
					},
					downvotes: {
						columns: {
							userId: true,
						},
					},
					favorites: {
						columns: {
							userId: true,
						},
					},
				},
			},
			questions: {
				columns: {},
				with: {
					upvotes: {
						columns: {
							userId: true,
						},
					},
					favorites: {
						columns: {
							userId: true,
						},
					},
				},
			},
			comments: {
				columns: {
					isHelpful: true,
				},
				with: {
					upvotes: {
						columns: {
							userId: true,
						},
					},
					downvotes: {
						columns: {
							userId: true,
						},
					},
				},
			},
		},
	});

	if (!user) {
		return NextResponse.json({ error: 'User not found' }, { status: 404 });
	}

	try {
		GetResponseSchema.parse(user);
	} catch (error) {
		return NextResponse.json({ error: 'Server fetch error' }, { status: 500 });
	}

	const parsedUser = user as unknown as GetResponseType;
	const hasSigned = isSameDateInUTC8(parsedUser.lastSigned, new Date());

	const aggUser = {
		userId: parsedUser.userId,
		name: parsedUser.name,
		email: parsedUser.email,
		profilePicture: parsedUser.profilePicture,
		points: parsedUser.points,
		upvotes: 0,
		downvotes: 0,
		hearts: 0,
		favorites: 0,
		checkmarks: 0,
		hasSigned,
	};

	parsedUser.posts.forEach((post) => {
		aggUser.upvotes += post.upvotes.length;
		aggUser.downvotes += post.downvotes.length;
		aggUser.favorites += post.favorites.length;
	});

	parsedUser.questions.forEach((question) => {
		aggUser.hearts += question.upvotes.length;
		aggUser.favorites += question.favorites.length;
	});

	parsedUser.comments.forEach((comment) => {
		aggUser.upvotes += comment.upvotes.length;
		aggUser.downvotes += comment.downvotes.length;
		aggUser.checkmarks += comment.isHelpful === true ? 1 : 0;
	});

	return NextResponse.json(aggUser, { status: 200 });
}

export async function PUT(req: NextRequest, { params }: { params: { userId: string } }) {
	const sessionUserId = await getSessionUserId();
	if (!sessionUserId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const userId = parseInt(params.userId);
	try {
		GetRequestSchema.parse(userId);
	} catch (error) {
		console.error('Error parsing request in api/users/[userId]/route.ts');
		return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
	}

	const data = await req.json();

	try {
		PutRequestSchema.parse(data);
	} catch (error) {
		console.error('Error parsing request in api/users/[userId]/route.ts', error);
		return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
	}

	const newUser = data as PutRequestType;

	if (newUser.userId !== userId || newUser.userId !== sessionUserId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const [user] = await db
			.select({ password: usersTable.password })
			.from(usersTable)
			.where(eq(usersTable.userId, newUser.userId));

		const isMatch = await bcrypt.compare(newUser.currentPassword, user.password);
		if (!isMatch) {
			return NextResponse.json({ error: 'Incorrect Password!' }, { status: 400 });
		}

		const updatedUser: {
			userId: number;
			name?: string;
			profilePicture?: string;
			password?: string;
		} = {
			userId: newUser.userId,
		};

		if (newUser.newPassword) {
			const hashedPassword = await bcrypt.hash(newUser.newPassword, 10);
			updatedUser.password = hashedPassword;
		}

		if (newUser.newName) {
			updatedUser.name = newUser.newName;
		}

		if (newUser.newProfilePicture) {
			updatedUser.profilePicture = newUser.newProfilePicture;
		}

		const [dbUser] = await db
			.update(usersTable)
			.set(updatedUser)
			.where(
				and(eq(usersTable.userId, newUser.userId), eq(usersTable.password, user.password)),
			)
			.returning({ userId: usersTable.userId });

		if (!dbUser) {
			return NextResponse.json({ error: 'Race Condition' }, { status: 500 });
		}
	} catch (error) {
		return NextResponse.json({ error: 'Server Error!' }, { status: 500 });
	}
	return NextResponse.json({ success: true }, { status: 200 });
}
