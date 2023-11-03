import { NextResponse, type NextRequest } from "next/server";

import { z } from "zod";
import { db } from "@/db";
import { eventsTable, participationsTable } from "@/db/schema";
import { like, sql, eq } from "drizzle-orm";
// zod is a library that helps us validate data at runtime
// it's useful for validating data coming from the client,
// since typescript only validates data at compile time.
// zod's schema syntax is pretty intuitive,
// read more about zod here: https://zod.dev/
const postEventRequestSchema = z.object({
  eventName: z.string().min(1).max(50),
  startTime: z.string().min(24).max(24),
  endTime: z.string().min(24).max(24),
});

// you can use z.infer to get the typescript type from a zod schema
type PostEventRequest = z.infer<typeof postEventRequestSchema>;

// This API handler file would be trigger by http requests to /api/likes
// POST requests would be handled by the POST function
// GET requests would be handled by the GET function
// etc.
// read more about Next.js API routes here:
// https://nextjs.org/docs/app/building-your-application/routing/route-handlers

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

    query = query.leftJoin(participationsTable, eq(participationsTable.eventId, eventsTable.id))
                 .groupBy(eventsTable.id);

    // await db.select({
    //   teamName: team.teamname,
    //   time: team.team_timestamp
    //   strength: sql<number>`count(${player.team_id})`
    // }).from(team)
    // .leftJoin(player, eq(team.team_id, player.team_id))
    // .groupBy(team.team_id)
    // .orderBy(desc(sql`count(${player.team_id})`));
    
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
    // parse will throw an error if the data doesn't match the schema
    postEventRequestSchema.parse(data);
  } catch (error) {
    // in case of an error, we return a 400 response
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Now we can safely use the data from the request body
  // the `as` keyword is a type assertion, this tells typescript
  // that we know what we're doing and that the data is of type LikeEventRequest.
  // This is safe now because we've already validated the data with zod.
  const { eventName, startTime, endTime } = data as PostEventRequest;

  try {
    const result = await db
      .insert(eventsTable)
      .values({
        eventName,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      })
      .execute();
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: error },
      { status: 500 },
    );
  }
}
