import { NextResponse, type NextRequest } from 'next/server';

import { z } from 'zod';

import { db } from '@/db';
import { tagsTable } from '@/db/schema';
import { getSessionUserId } from '@/utils/apiAuthentication';

const PostRequestSchema = z.object({
	names: z.array(z.string()),
});

type PostRequestType = z.infer<typeof PostRequestSchema>;
export const revalidate = 0;

export async function POST(req: NextRequest) {
	const userId = await getSessionUserId();
	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const data = await req.json();
	try {
		PostRequestSchema.parse(data);
	} catch (error) {
		console.error('Error parsing request in api/sign-up/route.ts');
		return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
	}
	const { names } = data as PostRequestType;
	const response = names.map(async (name) => {
		const tagExists = await db.query.tagsTable.findFirst({
			where: (existTag, { eq }) => eq(existTag.name, name),
		});
		if (tagExists) return tagExists.tagId;
		const [newTag] = await db
			.insert(tagsTable)
			.values({ name })
			.returning({ tagId: tagsTable.tagId });
		return newTag.tagId;
	});

	const result = await Promise.all(response);
	return NextResponse.json(result, { status: 201 });
}
