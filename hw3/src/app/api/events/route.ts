import { NextResponse, type NextRequest } from "next/server";

import { z } from "zod";
import { db } from "@/db";
import { eventsTable, participationsTable } from "@/db/schema";
import { like, sql, eq, asc } from "drizzle-orm";

const postEventRequestSchema = z.object({
  eventName: z.string().min(1).max(50),
  startTime: z.string().min(24).max(24),
  endTime: z.string().min(24).max(24),
});

type PostEventRequest = z.infer<typeof postEventRequestSchema>;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const searchTerm = params.get('searchTerm');

  try {
    let query = db.select({
      id: eventsTable.id,
      eventName: eventsTable.eventName,
      startTime: eventsTable.startTime,
      endTime: eventsTable.endTime,
      participationCount: sql<number>`count(${participationsTable.id})`
    }).from(eventsTable);
    
    if (searchTerm) {
      query = query.where(like(eventsTable.eventName, `%${searchTerm}%`));
    }
    
    query = query
      .leftJoin(
        participationsTable, 
        eq(participationsTable.eventId, eventsTable.id)
      )
      .groupBy(eventsTable.id)
      .orderBy(asc(eventsTable.createdAt))

    const events = await query.execute();

    return NextResponse.json({ events }, { status: 200 });
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
    postEventRequestSchema.parse(data);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { eventName, startTime, endTime } = data as PostEventRequest;

  try {
    const result = await db
      .insert(eventsTable)
      .values({
        eventName,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      })
      .returning({ eventId: eventsTable.id })
      .execute();
    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: error },
      { status: 500 },
    );
  }
}
