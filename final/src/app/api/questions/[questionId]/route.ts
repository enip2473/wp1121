import { NextResponse, type NextRequest } from 'next/server';

import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import { questionsTable, commentsTable, notificationsTable, usersTable } from '@/db/schema';
import { answerReward } from '@/lib/constants';
import { getSessionUserId } from '@/utils/apiAuthentication';

export const revalidate = 0;

const GetRequestSchema = z.object({
	questionId: z.string().min(1),
});

const ReplySchema = z.object({
	commentId: z.number().min(1),
	commenterId: z.number().min(1),
	parentCommentId: z.number().min(1),
	text: z.string().min(1),
	createdAt: z.date(),
	isHelpful: z.boolean(),
	upvotes: z.array(
		z.object({
			userId: z.number().min(1),
		}),
	),
	downvotes: z.array(
		z.object({
			userId: z.number().min(1),
		}),
	),
	user: z.object({
		userId: z.number().min(1),
		name: z.string().min(1),
		profilePicture: z.string().nullable(),
	}),
});

const CommentSchema = z.object({
	commentId: z.number().min(1),
	commenterId: z.number().min(1),
	questionId: z.number().min(1),
	text: z.string().min(1),
	createdAt: z.date(),
	isHelpful: z.boolean(),
	upvotes: z.array(
		z.object({
			userId: z.number().min(1),
		}),
	),
	downvotes: z.array(
		z.object({
			userId: z.number().min(1),
		}),
	),
	user: z.object({
		userId: z.number().min(1),
		name: z.string().min(1),
		profilePicture: z.string().nullable(),
	}),
	replies: z.array(ReplySchema),
});

const GetResponseSchema = z.object({
	questionId: z.number().min(1),
	questionTitle: z.string(),
	questionContext: z.string().min(1),
	questionImages: z.array(z.string()).nullable(),
	questionerId: z.number(),
	createdAt: z.date(),
	isSolved: z.boolean(),
	user: z.object({
		userId: z.number().min(1),
		name: z.string().min(1),
		profilePicture: z.string().nullable(),
	}),
	tags: z.array(
		z.object({
			tag: z.object({
				name: z.string(),
			}),
		}),
	),
	upvotes: z.array(
		z.object({
			userId: z.number().min(1),
		}),
	),
	favorites: z.array(
		z.object({
			userId: z.number().min(1),
		}),
	),
	comments: z.array(CommentSchema),
});

const PutRequestSchema = z.object({
	questionId: z.number().min(1),
	isSolved: z.boolean().optional(),
	helpfulCommentId: z.number().optional(),
});

type GetRequest = z.infer<typeof GetRequestSchema>;
type GetResponse = z.infer<typeof GetResponseSchema>;
type PutRequest = z.infer<typeof PutRequestSchema>;
export async function GET(req: NextRequest, { params }: { params: GetRequest }) {
	const sessionUserId = await getSessionUserId();
	const questionId = parseInt(params.questionId);
	const userId = sessionUserId;

	if (!questionId) {
		return NextResponse.json({ error: 'question id invalid' }, { status: 400 });
	}

	const questionDetail = await db.query.questionsTable.findFirst({
		with: {
			user: {
				columns: {
					userId: true,
					name: true,
					profilePicture: true,
				},
			},
			tags: {
				columns: {},
				with: {
					tag: {
						columns: {
							name: true,
						},
					},
				},
			},
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
			comments: {
				with: {
					user: {
						columns: {
							userId: true,
							name: true,
							profilePicture: true,
						},
					},
					replies: {
						with: {
							user: true,
							upvotes: true,
							downvotes: true,
						},
					},
					upvotes: true,
					downvotes: true,
				},
				orderBy: (comments, { asc }) => [asc(comments.createdAt)],
			},
		},
		where: (question, { eq }) => eq(question.questionId, questionId),
	});

	if (!questionDetail) {
		return NextResponse.json({ error: 'question not found' }, { status: 404 });
	}

	try {
		GetResponseSchema.parse(questionDetail);
	} catch (err) {
		console.error('Error parsing response in api/questions/[questionId]/route.ts', err);
		return NextResponse.json({ error: 'Server Error' }, { status: 500 });
	}

	const parsedDetail = questionDetail as unknown as GetResponse;

	const data = {
		questionId: parsedDetail.questionId,
		questionTitle: parsedDetail.questionTitle,
		questionContext: parsedDetail.questionContext,
		questionImages: parsedDetail.questionImages || [],
		questionerId: parsedDetail.questionerId,
		isSolved: parsedDetail.isSolved,
		questionerName: parsedDetail.user.name,
		profilePicture: parsedDetail.user.profilePicture,
		tags: parsedDetail.tags.map((singleTag) => {
			return singleTag.tag.name;
		}),
		createdAt: parsedDetail.createdAt,
		upvotes: parsedDetail.upvotes.length,
		hasUpvote: parsedDetail.upvotes.some((upvote) => upvote.userId === userId),
		favorites: parsedDetail.favorites.length,
		hasFavorite: parsedDetail.favorites.some((favorite) => favorite.userId === userId),
		commentsCount: parsedDetail.comments.length,
		hasComment: parsedDetail.comments.some((comment) => {
			if (comment.commenterId === userId) return true;
			comment.replies.forEach((reply) => {
				if (reply.commenterId === userId) return true;
			});
			return false;
		}),
		hasHelpfulComment: parsedDetail.comments.some((comment) => {
			if (comment.isHelpful) return true;
			comment.replies.forEach((reply) => {
				if (reply.isHelpful) return true;
			});
			return false;
		}),
		comments: parsedDetail.comments.map((comment) => ({
			commentId: comment.commentId,
			commenterId: comment.commenterId,
			commenterName: comment.user.name,
			commenterProfilePicture: comment.user.profilePicture,
			upvotes: comment.upvotes.length,
			hasUpvote: comment.upvotes.some((upvote) => upvote.userId === userId),
			downvotes: comment.downvotes.length,
			hasDownvote: comment.downvotes.some((downvote) => downvote.userId === userId),
			text: comment.text,
			isHelpful: comment.isHelpful,
			replies: comment.replies.map((reply) => ({
				commentId: reply.commentId,
				commenterId: reply.commenterId,
				commenterName: reply.user.name,
				commenterProfilePicture: reply.user.profilePicture,
				text: reply.text,
				isHelpful: reply.isHelpful,
				upvotes: reply.upvotes.length,
				hasUpvote: reply.upvotes.some((upvote) => upvote.userId === userId),
				downvotes: reply.downvotes.length,
				hasDownvote: reply.downvotes.some((downvote) => downvote.userId === userId),
				createdAt: reply.createdAt,
			})),
		})),
	};

	if (userId === data.questionerId) {
		try {
			await db
				.update(notificationsTable)
				.set({ isRead: true })
				.where(eq(notificationsTable.questionId, parsedDetail.questionId));
		} catch (error) {
			console.error(
				'Update notification status failed in questions/[questionId]/route.ts',
				error,
			);
			return NextResponse.json({ error: 'server error' }, { status: 500 });
		}
	}

	return NextResponse.json(data, { status: 200 });
}

export async function PUT(req: NextRequest) {
	const sessionUserId = await getSessionUserId();
	if (!sessionUserId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const data = await req.json();
	try {
		PutRequestSchema.parse(data);
	} catch (error) {
		console.error('Error parsing out request in api/questions/[questionId]/route.ts');
		return NextResponse.json({ error: 'put request invalid' }, { status: 400 });
	}
	const request = data as unknown as PutRequest;

	try {
		const question = await db.query.questionsTable.findFirst({
			where: (question, { eq }) => eq(question.questionId, request.questionId),
		});
		if (!question) {
			return NextResponse.json({ error: 'question not found' }, { status: 404 });
		}
		if (question.questionerId !== sessionUserId) {
			return NextResponse.json(
				{ error: 'You are not the owner of the question' },
				{ status: 401 },
			);
		}
	} catch (error) {
		return NextResponse.json({ error: 'database error' }, { status: 500 });
	}

	if (request.isSolved) {
		try {
			await db
				.update(questionsTable)
				.set({ isSolved: request.isSolved })
				.where(
					and(
						eq(questionsTable.questionId, request.questionId),
						eq(questionsTable.questionerId, sessionUserId),
					),
				);
		} catch (error) {
			console.error('Error updating question');
			return NextResponse.json({ error: 'server error updating question' }, { status: 500 });
		}
	}

	if (request.helpfulCommentId) {
		try {
			const [comment] = await db
				.update(commentsTable)
				.set({ isHelpful: true })
				.where(eq(commentsTable.commentId, request.helpfulCommentId))
				.returning({ commenterId: commentsTable.commenterId });
			if (comment) {
				const user = await db.query.usersTable.findFirst({
					columns: {
						points: true,
					},
					where: (user, { eq }) => eq(user.userId, comment.commenterId),
				});
				if (user) {
					const userPoints = user.points || 0;
					await db
						.update(usersTable)
						.set({ points: userPoints + answerReward })
						.where(eq(usersTable.userId, comment.commenterId));
				}
			}
		} catch (error) {
			console.error('Error updating helpful');
			return NextResponse.json({ error: 'server error updating helpful' }, { status: 500 });
		}
	}

	return NextResponse.json({ success: true }, { status: 200 });
}
