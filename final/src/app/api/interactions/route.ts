import { NextResponse, type NextRequest } from 'next/server';

import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import { upvotesTable, downvotesTable, favoritesTable, notificationsTable } from '@/db/schema';
import { getSessionUserId } from '@/utils/apiAuthentication';

export const revalidate = 0;

const PostRequestSchema = z.object({
	postId: z.number().optional(),
	questionId: z.number().optional(),
	commentId: z.number().optional(),
	userId: z.number().min(1),
	actionType: z.enum([
		'add_upvote',
		'add_downvote',
		'add_favorite',
		'remove_upvote',
		'remove_downvote',
		'remove_favorite',
	]),
});

type PostRequestType = z.infer<typeof PostRequestSchema>;

export async function POST(req: NextRequest) {
	const sessionUserId = await getSessionUserId();
	if (!sessionUserId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}
	const data = await req.json();
	try {
		PostRequestSchema.parse(data);
	} catch (error) {
		console.error('Error parsing request in api/comments/route.ts');
		return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
	}
	const newInteraction = data as PostRequestType;

	if (newInteraction.userId !== sessionUserId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (!newInteraction.postId && !newInteraction.questionId && !newInteraction.commentId) {
		return NextResponse.json(
			{ error: 'No parent specified in api/interactions/route.ts' },
			{ status: 400 },
		);
	}

	let multipleId = 0;
	if (newInteraction.commentId) multipleId += 1;
	if (newInteraction.questionId) multipleId += 1;
	if (newInteraction.postId) multipleId += 1;
	if (multipleId > 1) {
		return NextResponse.json(
			{ error: 'Only one parent can be specified in api/interactions/route.ts' },
			{ status: 400 },
		);
	}

	if (newInteraction.actionType === 'add_upvote') {
		await db.insert(upvotesTable).values(newInteraction);
		if (newInteraction.postId) {
			await db
				.delete(downvotesTable)
				.where(
					and(
						eq(downvotesTable.postId, newInteraction.postId),
						eq(downvotesTable.userId, newInteraction.userId),
					),
				);
		} else if (newInteraction.commentId) {
			await db
				.delete(downvotesTable)
				.where(
					and(
						eq(downvotesTable.commentId, newInteraction.commentId),
						eq(downvotesTable.userId, newInteraction.userId),
					),
				);
		}
	} else if (newInteraction.actionType === 'add_downvote') {
		await db.insert(downvotesTable).values(newInteraction);
		if (newInteraction.postId) {
			await db
				.delete(upvotesTable)
				.where(
					and(
						eq(upvotesTable.postId, newInteraction.postId),
						eq(upvotesTable.userId, newInteraction.userId),
					),
				);
		} else if (newInteraction.commentId) {
			await db
				.delete(upvotesTable)
				.where(
					and(
						eq(upvotesTable.commentId, newInteraction.commentId),
						eq(upvotesTable.userId, newInteraction.userId),
					),
				);
		} else if (newInteraction.questionId) {
			return NextResponse.json({ error: 'Cannot downvote a question' }, { status: 400 });
		}
	} else if (newInteraction.actionType === 'add_favorite') {
		if (newInteraction.commentId) {
			return NextResponse.json({ error: 'Cannot favorite a comment' }, { status: 400 });
		}
		await db.insert(favoritesTable).values(newInteraction);
	} else if (newInteraction.actionType === 'remove_upvote') {
		if (newInteraction.postId) {
			await db
				.delete(upvotesTable)
				.where(
					and(
						eq(upvotesTable.postId, newInteraction.postId),
						eq(upvotesTable.userId, newInteraction.userId),
					),
				);
		} else if (newInteraction.commentId) {
			await db
				.delete(upvotesTable)
				.where(
					and(
						eq(upvotesTable.commentId, newInteraction.commentId),
						eq(upvotesTable.userId, newInteraction.userId),
					),
				);
		} else if (newInteraction.questionId) {
			await db
				.delete(upvotesTable)
				.where(
					and(
						eq(upvotesTable.questionId, newInteraction.questionId),
						eq(upvotesTable.userId, newInteraction.userId),
					),
				);
		}
	} else if (newInteraction.actionType === 'remove_downvote') {
		if (newInteraction.postId) {
			await db
				.delete(downvotesTable)
				.where(
					and(
						eq(downvotesTable.postId, newInteraction.postId),
						eq(downvotesTable.userId, newInteraction.userId),
					),
				);
		} else if (newInteraction.commentId) {
			await db
				.delete(downvotesTable)
				.where(
					and(
						eq(downvotesTable.commentId, newInteraction.commentId),
						eq(downvotesTable.userId, newInteraction.userId),
					),
				);
		} else if (newInteraction.questionId) {
			return NextResponse.json({ error: 'Cannot downvote a question' }, { status: 400 });
		}
	} else if (newInteraction.actionType === 'remove_favorite') {
		if (newInteraction.commentId) {
			return NextResponse.json({ error: 'Cannot favorite a comment' }, { status: 400 });
		}
		if (newInteraction.postId) {
			await db
				.delete(favoritesTable)
				.where(
					and(
						eq(favoritesTable.postId, newInteraction.postId),
						eq(favoritesTable.userId, newInteraction.userId),
					),
				);
		} else if (newInteraction.questionId) {
			await db
				.delete(favoritesTable)
				.where(
					and(
						eq(favoritesTable.questionId, newInteraction.questionId),
						eq(favoritesTable.userId, newInteraction.userId),
					),
				);
		}
	} else {
		return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
	}

	if (newInteraction.postId && newInteraction.actionType.startsWith('add')) {
		const notification = await db.query.notificationsTable.findFirst({
			where: (notification, { eq, and }) =>
				and(
					eq(notification.postId, newInteraction.postId as number),
					eq(notification.notificationType, 'interaction'),
				),
			columns: {
				notificationId: true,
				userId: true,
			},
		});
		if (!notification) {
			const post = await db.query.postsTable.findFirst({
				where: (post, { eq }) => eq(post.postId, newInteraction.postId as number),
				columns: { posterId: true },
			});
			if (!post) {
				return NextResponse.json({ error: 'Post not exist' }, { status: 404 });
			}
			if (post.posterId !== newInteraction.userId) {
				await db.insert(notificationsTable).values({
					userId: post.posterId,
					postId: newInteraction.postId as number,
					notificationType: 'interaction',
					lastNotifyUserId: newInteraction.userId,
				});
			}
		} else {
			if (notification.userId !== newInteraction.userId) {
				await db
					.update(notificationsTable)
					.set({
						isRead: false,
						createdAt: new Date(),
						lastNotifyUserId: newInteraction.userId,
					})
					.where(eq(notificationsTable.notificationId, notification.notificationId));
			}
		}
	} else if (newInteraction.questionId && newInteraction.actionType.startsWith('add')) {
		const notification = await db.query.notificationsTable.findFirst({
			where: (notification, { eq, and }) =>
				and(
					eq(notification.questionId, newInteraction.questionId as number),
					eq(notification.notificationType, 'interaction'),
				),
			columns: {
				notificationId: true,
				userId: true,
			},
		});
		if (!notification) {
			const question = await db.query.questionsTable.findFirst({
				where: (question, { eq }) =>
					eq(question.questionId, newInteraction.questionId as number),
				columns: { questionerId: true },
			});
			if (!question) {
				return NextResponse.json({ error: 'question not exist' }, { status: 404 });
			}
			if (question.questionerId !== newInteraction.userId) {
				await db.insert(notificationsTable).values({
					userId: question.questionerId,
					questionId: newInteraction.questionId as number,
					notificationType: 'interaction',
					lastNotifyUserId: newInteraction.userId,
				});
			}
		} else {
			if (notification.userId !== newInteraction.userId) {
				await db
					.update(notificationsTable)
					.set({
						isRead: false,
						createdAt: new Date(),
						lastNotifyUserId: newInteraction.userId,
					})
					.where(eq(notificationsTable.notificationId, notification.notificationId));
			}
		}
	}

	return NextResponse.json({ success: true }, { status: 200 });
}
