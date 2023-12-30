import { NextResponse, type NextRequest } from 'next/server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import { commentsTable, notificationsTable } from '@/db/schema';
import { getSessionUserId } from '@/utils/apiAuthentication';

export const revalidate = 0;

const PostRequestSchema = z.object({
	postId: z.number().optional(),
	questionId: z.number().optional(),
	parentCommentId: z.number().optional(),
	commenterId: z.number().min(1),
	text: z.string().min(1),
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
	const newComment = data as PostRequestType;

	if (newComment.commenterId !== sessionUserId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (!newComment.postId && !newComment.questionId && !newComment.parentCommentId) {
		return NextResponse.json(
			{ error: 'No parent specified in api/comments/route.ts' },
			{ status: 400 },
		);
	}

	if (newComment.postId) {
		const notification = await db.query.notificationsTable.findFirst({
			where: (notification, { eq, and }) =>
				and(
					eq(notification.postId, newComment.postId as number),
					eq(notification.notificationType, 'comment'),
				),
			columns: {
				notificationId: true,
				userId: true,
			},
		});
		if (!notification) {
			const post = await db.query.postsTable.findFirst({
				where: (post, { eq }) => eq(post.postId, newComment.postId as number),
				columns: { posterId: true },
			});
			if (!post) {
				return NextResponse.json({ error: 'Post not exist' }, { status: 404 });
			}
			if (post.posterId !== newComment.commenterId) {
				await db.insert(notificationsTable).values({
					userId: post.posterId,
					postId: newComment.postId as number,
					notificationType: 'comment',
					lastNotifyUserId: newComment.commenterId,
				});
			}
		} else {
			if (notification.userId !== newComment.commenterId) {
				await db
					.update(notificationsTable)
					.set({
						isRead: false,
						createdAt: new Date(),
						lastNotifyUserId: newComment.commenterId,
					})
					.where(eq(notificationsTable.notificationId, notification.notificationId));
			}
		}
	} else if (newComment.questionId) {
		const notification = await db.query.notificationsTable.findFirst({
			where: (notification, { eq, and }) =>
				and(
					eq(notification.questionId, newComment.questionId as number),
					eq(notification.notificationType, 'comment'),
				),
			columns: {
				notificationId: true,
				userId: true,
			},
		});
		if (!notification) {
			const question = await db.query.questionsTable.findFirst({
				where: (question, { eq }) =>
					eq(question.questionId, newComment.questionId as number),
				columns: { questionerId: true },
			});
			if (!question) {
				return NextResponse.json({ error: 'question not exist' }, { status: 404 });
			}
			if (question.questionerId !== newComment.commenterId) {
				await db.insert(notificationsTable).values({
					userId: question.questionerId,
					questionId: newComment.questionId as number,
					notificationType: 'comment',
					lastNotifyUserId: newComment.commenterId,
				});
			}
		} else {
			if (notification.userId !== newComment.commenterId) {
				await db
					.update(notificationsTable)
					.set({
						isRead: false,
						createdAt: new Date(),
						lastNotifyUserId: newComment.commenterId,
					})
					.where(eq(notificationsTable.notificationId, notification.notificationId));
			}
		}
	}

	try {
		await db
			.insert(commentsTable)
			.values(newComment)
			.returning({ commentId: commentsTable.commentId });
		return NextResponse.json({ success: true }, { status: 201 });
	} catch (error) {
		return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
	}
}
