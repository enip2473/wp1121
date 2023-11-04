import { NextResponse, type NextRequest } from "next/server";

import { z } from "zod";
import { db } from "@/db";
import { commentsTable } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

type GetParamsType = {
    params: { 
        id: number;
    };
}

const postCommentSchema = z.object({
    username: z.string().min(1).max(50),
    eventId: z.number(),
    content: z.string().min(1)
});

type PostCommentRequest = z.infer<typeof postCommentSchema>;


export async function GET(request: NextRequest, { params } : GetParamsType) {
    const eventId = params.id;
    try {
        const query = db.select({
            username: commentsTable.username,
            eventId: commentsTable.eventId,
            content: commentsTable.content,
            createdAt: commentsTable.createdAt,
        })
        .from(commentsTable)
        .where(
            eq(commentsTable.eventId, eventId)
        )
        .orderBy(asc(commentsTable.createdAt))
        const comments = await query.execute();
        return NextResponse.json({ comments }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: error },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    const data = await request.json();
    try {
      postCommentSchema.parse(data);
    } catch (error) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
  
    // Now we can safely use the data from the request body
    // the `as` keyword is a type assertion, this tells typescript
    // that we know what we're doing and that the data is of type LikeEventRequest.
    // This is safe now because we've already validated the data with zod.
    const { username, eventId, content } = data as PostCommentRequest;
  
    try {
      const newComment = {
        username,
        eventId,
        content,
      };
      await db
        .insert(commentsTable)
        .values(newComment)
        .execute();
      return NextResponse.json(newComment, { status: 200 });
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        { error: error },
        { status: 500 },
      );
    }
  }