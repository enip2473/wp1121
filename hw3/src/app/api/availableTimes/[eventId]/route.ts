import { NextResponse, type NextRequest } from "next/server";

import { z } from "zod";
import { db } from "@/db";
import { timeTable } from "@/db/schema";
import { like, sql, eq, and } from "drizzle-orm";

type GetParamsType = {
    params: { 
        eventId: number;
    };
}

const postAvailableSchema = z.object({
    username: z.string().min(1).max(50),
    eventId: z.number(),
    availableTime: z.number(),
    isInserting: z.boolean(),
});

type PostAvailableRequest = z.infer<typeof postAvailableSchema>;


export async function GET(request: NextRequest, { params }: GetParamsType) {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');  
    const eventId = params.eventId;
    try {
        let query = db.select({
            username: timeTable.username,
            eventId: timeTable.eventId,
            availableTime: timeTable.availableTime,
        })
        .from(timeTable)
        .where(
            eq(timeTable.eventId, eventId)
        )
        if (username) {
            query = query.where(eq(timeTable.username, username));
        }
        const comments = await query.execute();
        const counter = new Array(168).fill(0);
        
        comments.forEach((comment) => {
            counter[comment.availableTime] += 1;
        });

        return NextResponse.json({ counter }, { status: 200 });
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
      postAvailableSchema.parse(data);
    } catch (error) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
  
    const { username, eventId, availableTime, isInserting } = data as PostAvailableRequest;
    
    try {
        const newAvailable = {
            username,
            eventId,
            availableTime,
        };
        if (isInserting) {
            await db
                .insert(timeTable)
                .values(newAvailable)
                .execute();
        }
        else {
            await db
                .delete(timeTable)
                .where(
                    and(
                        and(
                            eq(timeTable.username, username),
                            eq(timeTable.eventId, eventId),
                        ),
                        eq(timeTable.availableTime, availableTime)
                    )
                )
                .execute();
        }
        return NextResponse.json(newAvailable, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: error },
            { status: 500 },
        );
    }
}


export async function DELETE(request: NextRequest, { params }: GetParamsType) {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username') || '';
    const eventId = params.eventId;
    try {
        let query = db.delete(timeTable)
        .where(
            and(
                eq(timeTable.eventId, eventId),
                eq(timeTable.username, username)
            )
        )

        const result = await query.execute();
        console.log(result);
        return NextResponse.json({ ok: "OK" }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: error },
            { status: 500 },
        );
    }
}
