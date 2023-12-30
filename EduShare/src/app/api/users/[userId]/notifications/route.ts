import { NextResponse, type NextRequest } from 'next/server';

import { z } from 'zod';

import { db } from '@/db';

const GetRequestSchema = z.number().min(1);

const GetResponseSchema = z.array(
	z.object({
		notificationId: z.number(),
		userId: z.number().min(1),
		notificationType: z.enum(['comment', 'interaction']),
		postId: z.number().nullable(),
		questionId: z.number().nullable(),
		isRead: z.boolean(),
		createdAt: z.date(),
		post: z
			.object({
				postTitle: z.string(),
			})
			.nullable(),
		question: z
			.object({
				questionTitle: z.string(),
			})
			.nullable(),
		lastNotifyUserId: z.number().min(1),
		lastNotifyUser: z.object({
			name: z.string(),
		}),
	}),
);

export const revalidate = 0;
type GetResponse = z.infer<typeof GetResponseSchema>;

export async function GET(_: NextRequest, { params }: { params: { userId: string } }) {
	const userId = parseInt(params.userId);
	try {
		GetRequestSchema.parse(userId);
	} catch (error) {
		console.error('Error parsing request in api/users/[userId]/notifications/route.ts');
		return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
	}

	const dbData = await db.query.notificationsTable.findMany({
		where: (notification, { eq }) => eq(notification.userId, userId),
		with: {
			post: {
				columns: {
					postTitle: true,
				},
			},
			question: {
				columns: {
					questionTitle: true,
				},
			},
			lastNotifyUser: {
				columns: {
					name: true,
				},
			},
		},
		orderBy: (notification, { desc }) => [desc(notification.createdAt)],
	});

	try {
		GetResponseSchema.parse(dbData);
	} catch (error) {
		console.error('Error parsing response in api/users/[userId]/notifications/route.ts');
		return NextResponse.json({ error: 'Invalid response' }, { status: 500 });
	}

	const parsedData = dbData as GetResponse;

	const returnData = parsedData.map((notification) => ({
		...notification,
		postTitle: notification.post ? notification.post.postTitle : null,
		questionTitle: notification.question ? notification.question.questionTitle : null,
		lastNotifyUsername: notification.lastNotifyUser.name,
		post: undefined,
		question: undefined,
		lastNotifyUser: undefined,
	}));

	return NextResponse.json(returnData, { status: 200 });
}
