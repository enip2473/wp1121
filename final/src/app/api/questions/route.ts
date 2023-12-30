import { NextResponse, type NextRequest } from 'next/server';

import { sql, eq, desc, and } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import {
	questionsTable,
	usersTable,
	commentsTable,
	favoritesTable,
	upvotesTable,
	tagsTable,
	questionTagsTable,
} from '@/db/schema';
import { questionCost } from '@/lib/constants';
import { getSessionUserId } from '@/utils/apiAuthentication';

export const revalidate = 0;

const GetResponseSchema = z.array(
	z.object({
		questionId: z.number().min(1),
		questionTitle: z.string().min(1),
		questionContext: z.string().min(1),
		questionImages: z.array(z.string()).nullable(),
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

const questionRequestSchema = z.object({
	questionTitle: z.string().min(1),
	questionContext: z.string().min(1),
	questionerId: z.number(),
	questionImages: z.array(z.string()).optional(),
	tags: z.array(z.string()).optional(),
});

type questionRequest = z.infer<typeof questionRequestSchema>;

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

	const data = combined;
	return NextResponse.json(data, { status: 200 });
}

export async function POST(req: NextRequest) {
	const sessionUserId = await getSessionUserId();
	if (!sessionUserId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const data = await req.json();
	try {
		questionRequestSchema.parse(data);
	} catch (error) {
		console.error('Error parsing request in api/questions/route.ts', error);
		return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
	}
	const { tags, ...newQuestion } = data as questionRequest;

	if (newQuestion.questionerId !== sessionUserId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const [user] = await db
			.select({ points: usersTable.points })
			.from(usersTable)
			.where(eq(usersTable.userId, sessionUserId));

		if (!user || !user.points) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		if (user.points < questionCost) {
			return NextResponse.json({ error: 'Points not enough!' }, { status: 400 });
		}

		const [updatedUser] = await db
			.update(usersTable)
			.set({ points: user.points - questionCost })
			.where(
				and(
					eq(usersTable.userId, sessionUserId),
					eq(usersTable.points, user.points), // avoid race condition
				),
			)
			.returning({ userId: usersTable.userId });
		if (!updatedUser) {
			return NextResponse.json({ error: 'Race condition' }, { status: 500 });
		}
	} catch (error) {
		console.error(error);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}

	let questionId = -1;
	try {
		const inserted = await db
			.insert(questionsTable)
			.values(newQuestion)
			.returning({ questionId: questionsTable.questionId });
		questionId = inserted[0].questionId;
	} catch (error) {
		return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
	}

	let tagIds: number[] = [];
	async function getTagIds(tags: string[]) {
		const tagPromises = tags.map(async (tag) => {
			const exist = await db.query.tagsTable.findFirst({
				columns: {
					tagId: true,
				},
				where: (tagsTable, { eq }) => eq(tagsTable.name, tag),
			});
			if (exist) {
				return exist.tagId;
			} else {
				const newTag = await db
					.insert(tagsTable)
					.values({ name: tag })
					.returning({ tagId: tagsTable.tagId });
				return newTag[0].tagId;
			}
		});
		return await Promise.all(tagPromises);
	}

	try {
		if (tags) {
			tagIds = await getTagIds(tags);
		} else {
			tagIds = [];
		}
	} catch (error) {
		console.error('Failed getting id of tags!');
		return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
	}

	const questionTagIds = tagIds.map((tagId) => ({
		questionId,
		tagId,
	}));

	try {
		if (questionTagIds.length > 0) {
			await db.insert(questionTagsTable).values(questionTagIds);
		}
		return NextResponse.json({ result: 'success' }, { status: 200 });
	} catch (error) {
		console.error('Failed inserting question and tags relationship!', error);
		return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
	}
}
