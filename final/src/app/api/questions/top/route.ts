import { NextResponse, type NextRequest } from 'next/server';

import { sql, eq, desc, gt } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import {
	questionsTable,
	usersTable,
	commentsTable,
	favoritesTable,
	upvotesTable,
} from '@/db/schema';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const GetResponseSchema = z.array(
	z.object({
		questionId: z.number().min(1),
		questionTitle: z.string().min(1),
		questionContext: z.string().min(1),
		questionImages: z.array(z.string()),
		questionerId: z.number(),
		createdAt: z.date(),
		questionerName: z.string(),
		profilePicture: z.string().optional().nullable(),
		upvotes: z.number().default(0),
		downvotes: z.number().default(0),
		commentsCount: z.number().default(0),
		favorites: z.number().default(0),
		tags: z.array(z.string()),
	}),
);

export async function GET(_: NextRequest) {
	const upvotesSubQuery = db
		.select({
			questionId: upvotesTable.questionId,
			upvotesCount: sql<number>`cast(count(*) as int)`.as('upvotes'),
		})
		.from(upvotesTable)
		.groupBy(upvotesTable.questionId)
		.as('upvotesSubQuery');

	const commentsSubQuery = db
		.select({
			questionId: commentsTable.questionId,
			commentsCount: sql<number>`cast(count(*) as int)`.as('commentsCount'),
		})
		.from(commentsTable)
		.groupBy(commentsTable.questionId)
		.as('commentsSubQuery');

	const favoritesSubQuery = db
		.select({
			questionId: favoritesTable.questionId,
			favoritesCount: sql<number>`cast(count(*) as int)`.as('favoritesCount'),
		})
		.from(favoritesTable)
		.groupBy(favoritesTable.questionId)
		.as('favoritesSubQuery');

	const oneDayAgo = new Date(Date.now() - 24 * 3600 * 1000);

	const questionDetails = db
		.select({
			questionId: questionsTable.questionId,
			questionTitle: questionsTable.questionTitle,
			questionContext: questionsTable.questionContext,
			questionImages: questionsTable.questionImages,
			questionerId: questionsTable.questionerId,
			isSolved: questionsTable.isSolved,
			createdAt: questionsTable.createdAt,
			questionerName: usersTable.name,
			profilePicture: usersTable.profilePicture,
			upvotes: upvotesSubQuery.upvotesCount,
			commentsCount: commentsSubQuery.commentsCount,
			favorites: favoritesSubQuery.favoritesCount,
		})
		.from(questionsTable)
		.where(gt(questionsTable.createdAt, oneDayAgo))
		.leftJoin(upvotesSubQuery, eq(upvotesSubQuery.questionId, questionsTable.questionId))
		.leftJoin(commentsSubQuery, eq(commentsSubQuery.questionId, questionsTable.questionId))
		.leftJoin(favoritesSubQuery, eq(favoritesSubQuery.questionId, questionsTable.questionId))
		.leftJoin(usersTable, eq(usersTable.userId, questionsTable.questionerId))
		.orderBy(desc(questionsTable.createdAt));

	const questionTags = db.query.questionsTable.findMany({
		columns: {
			questionId: true,
		},
		with: {
			tags: {
				with: {
					tag: {
						columns: {
							name: true,
						},
					},
				},
			},
		},
		where: (question, { gt }) => gt(question.createdAt, oneDayAgo),
		orderBy: [desc(questionsTable.createdAt)],
	});

	const [details, allTags] = await Promise.all([questionDetails, questionTags]);
	const combined = details.map((detail, index) => ({
		...detail,
		questionImages: detail.questionImages ? detail.questionImages : [],
		upvotes: detail.upvotes ? detail.upvotes : 0,
		favorites: detail.favorites ? detail.favorites : 0,
		commentsCount: detail.commentsCount ? detail.commentsCount : 0,
		tags: allTags[index].tags.map((singleTag) => {
			return singleTag.tag.name;
		}),
	}));

	try {
		GetResponseSchema.parse(combined);
	} catch (error) {
		console.error('Error parsing response in api/questions/route.ts', error);
		return NextResponse.json({ error: 'Server Error' }, { status: 500 });
	}

	const sorted = combined.sort((a, b) => {
		const popularityA = a.upvotes + a.favorites + a.commentsCount * 5;
		const popularityB = b.upvotes + b.favorites + b.commentsCount * 5;
		return popularityB - popularityA;
	});

	const data = sorted.slice(0, 3);
	return NextResponse.json(data, { status: 200 });
}
