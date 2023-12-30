import { NextResponse, type NextRequest } from 'next/server';

import { sql, eq, desc } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import {
	postsTable,
	usersTable,
	commentsTable,
	favoritesTable,
	upvotesTable,
	downvotesTable,
	tagsTable,
	postTagsTable,
} from '@/db/schema';
import { getSessionUserId } from '@/utils/apiAuthentication';

const GetResponseSchema = z.array(
	z.object({
		postId: z.number().min(1),
		postTitle: z.string().min(1),
		postContext: z.string().min(1),
		postImages: z.array(z.string()).nullable(),
		posterId: z.number(),
		createdAt: z.date(),
		posterName: z.string(),
		profilePicture: z.string().optional().nullable(),
		upvotes: z.number().default(0),
		downvotes: z.number().default(0),
		commentsCount: z.number().default(0),
		favorites: z.number().default(0),
		tags: z.array(z.string()),
	}),
);

const PostRequestSchema = z.object({
	postTitle: z.string().min(1),
	postContext: z.string().min(1),
	posterId: z.number(),
	postImages: z.array(z.string()).optional(),
	tags: z.array(z.string()).optional(),
});

type PostRequest = z.infer<typeof PostRequestSchema>;
export const revalidate = 0;

export async function GET(_: NextRequest) {
	const upvotesSubQuery = db
		.select({
			postId: upvotesTable.postId,
			upvotesCount: sql<number>`cast(count(*) as int)`.as('upvotes'),
		})
		.from(upvotesTable)
		.groupBy(upvotesTable.postId)
		.as('upvotesSubQuery');

	const downvotesSubQuery = db
		.select({
			postId: downvotesTable.postId,
			downvotesCount: sql<number>`cast(count(*) as int)`.as('downvotesCount'),
		})
		.from(downvotesTable)
		.groupBy(downvotesTable.postId)
		.as('downvotesSubQuery');

	const commentsSubQuery = db
		.select({
			postId: commentsTable.postId,
			commentsCount: sql<number>`cast(count(*) as int)`.as('commentsCount'),
		})
		.from(commentsTable)
		.groupBy(commentsTable.postId)
		.as('commentsSubQuery');

	const favoritesSubQuery = db
		.select({
			postId: favoritesTable.postId,
			favoritesCount: sql<number>`cast(count(*) as int)`.as('favoritesCount'),
		})
		.from(favoritesTable)
		.groupBy(favoritesTable.postId)
		.as('favoritesSubQuery');

	const postDetails = db
		.select({
			postId: postsTable.postId,
			postTitle: postsTable.postTitle,
			postContext: postsTable.postContext,
			postImages: postsTable.postImages,
			posterId: postsTable.posterId,
			createdAt: postsTable.createdAt,
			posterName: usersTable.name,
			profilePicture: usersTable.profilePicture,
			upvotes: upvotesSubQuery.upvotesCount,
			downvotes: downvotesSubQuery.downvotesCount,
			commentsCount: commentsSubQuery.commentsCount,
			favorites: favoritesSubQuery.favoritesCount,
		})
		.from(postsTable)
		.leftJoin(upvotesSubQuery, eq(upvotesSubQuery.postId, postsTable.postId))
		.leftJoin(downvotesSubQuery, eq(downvotesSubQuery.postId, postsTable.postId))
		.leftJoin(commentsSubQuery, eq(commentsSubQuery.postId, postsTable.postId))
		.leftJoin(favoritesSubQuery, eq(favoritesSubQuery.postId, postsTable.postId))
		.leftJoin(usersTable, eq(usersTable.userId, postsTable.posterId))
		.orderBy(desc(postsTable.createdAt));

	const postTags = db.query.postsTable.findMany({
		columns: {
			postId: true,
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
		orderBy: [desc(postsTable.createdAt)],
	});

	const [details, allTags] = await Promise.all([postDetails, postTags]);
	const combined = details.map((detail, index) => ({
		...detail,
		postImages: detail.postImages ? detail.postImages : [],
		upvotes: detail.upvotes ? detail.upvotes : 0,
		downvotes: detail.downvotes ? detail.downvotes : 0,
		favorites: detail.favorites ? detail.favorites : 0,
		commentsCount: detail.commentsCount ? detail.commentsCount : 0,
		tags: allTags[index].tags.map((singleTag) => {
			return singleTag.tag.name;
		}),
	}));

	try {
		GetResponseSchema.parse(combined);
	} catch (error) {
		console.error('Error parsing response in api/posts/route.ts', error);
		return NextResponse.json({ error: 'Server Error' }, { status: 500 });
	}

	return NextResponse.json(combined, { status: 200 });
}

export async function POST(req: NextRequest) {
	const sessionUserId = await getSessionUserId();
	if (!sessionUserId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}
	const data = await req.json();
	try {
		PostRequestSchema.parse(data);
	} catch (error) {
		console.error('Error parsing request in api/posts/route.ts', error);
		return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
	}
	const { tags, ...newPost } = data as PostRequest;

	if (newPost.posterId !== sessionUserId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	let postId = -1;
	try {
		const inserted = await db
			.insert(postsTable)
			.values(newPost)
			.returning({ postId: postsTable.postId });
		postId = inserted[0].postId;
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

	const postTagIds = tagIds.map((tagId) => ({
		postId,
		tagId,
	}));

	try {
		if (postTagIds.length > 0) {
			await db.insert(postTagsTable).values(postTagIds);
		}
		return NextResponse.json({ result: 'success' }, { status: 200 });
	} catch (error) {
		console.error('Failed inserting post and tags relationship!', error);
		return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
	}
}
