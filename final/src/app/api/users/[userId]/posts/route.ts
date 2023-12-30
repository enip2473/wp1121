import { NextResponse, type NextRequest } from 'next/server';

import { z } from 'zod';

import { db } from '@/db';

const GetRequestSchema = z.number().min(1);
export const revalidate = 0;

const GetResponseSchema = z.array(
	z.object({
		postId: z.number().min(1),
		postTitle: z.string().min(1),
		postContext: z.string(),
		posterId: z.number(),
		createdAt: z.date(),
		user: z.object({
			name: z.string(),
			profilePicture: z.string().nullable().optional(),
		}),
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
		favorites: z.array(
			z.object({
				userId: z.number().min(1),
			}),
		),
		comments: z.array(
			z.object({
				commenterId: z.number().min(1),
			}),
		),
		tags: z.array(
			z.object({
				tag: z.object({
					name: z.string(),
				}),
			}),
		),
	}),
);

type GetResponse = z.infer<typeof GetResponseSchema>;

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
	const userId = parseInt(params.userId);
	try {
		GetRequestSchema.parse(userId);
	} catch (error) {
		console.error('Error parsing request in api/users/posts/route.ts');
		return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
	}
	const user = await db.query.usersTable.findFirst({
		columns: {},
		with: {
			posts: {
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
					user: {
						columns: {
							name: true,
							profilePicture: true,
						},
					},
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
					comments: {
						fields: {
							commenterId: true,
						},
					},
				},
			},
		},
		where: (user, { eq }) => eq(user.userId, userId),
	});

	if (!user) {
		return NextResponse.json({ error: 'User not found' }, { status: 404 });
	}

	const rawPosts = user.posts;
	try {
		GetResponseSchema.parse(rawPosts);
	} catch (error) {
		console.error('Error parsing response in api/users/[userId]/posts/route.ts', error);
		return NextResponse.json({ error: 'Invalid response' }, { status: 500 });
	}

	const parsedPosts = rawPosts as GetResponse;

	const posts = parsedPosts.map((post) => ({
		postId: post.postId,
		postTitle: post.postTitle,
		postContext: post.postContext,
		createdAt: post.createdAt,
		posterId: post.posterId,
		profilePicture: post.user.profilePicture,
		posterName: post.user.name,
		upvotes: post.upvotes.length,
		downvotes: post.downvotes.length,
		favorites: post.favorites.length,
		commentsCount: post.comments.length,
		tags: post.tags.map((singleTag) => singleTag.tag.name),
	}));

	return NextResponse.json(posts, { status: 200 });
}
