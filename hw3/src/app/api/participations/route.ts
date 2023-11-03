import { NextResponse, type NextRequest } from "next/server";

import { z } from "zod";

import { db } from "@/db";
import { participationsTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const postParticipationRequestSchema = z.object({
  username: z.string().min(1).max(50),
  eventId: z.number(),
  inserting: z.boolean()
});

type PostParticipationRequest = z.infer<typeof postParticipationRequestSchema>;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const username = params.get('username');

  try {
    const queryname = username ? username : "";
    const query = db.select().from(participationsTable).where(eq(participationsTable.username, queryname));
    const events = await query.execute();

    const attendingEvents = events.map((event) => event.eventId)
    return NextResponse.json({ attendingEvents }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error },
      { status: 500 },
    );
  }
}


export async function POST(request: NextRequest) {
  const data = await request.json();
  try {
    postParticipationRequestSchema.parse(data);
  } catch (error) {
    // in case of an error, we return a 400 response
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { username, eventId, inserting } = data as PostParticipationRequest;

  try {
    if (inserting === true) {
      await db.insert(participationsTable)
        .values({username, eventId})
        .execute();
    }
    else {
      await db.delete(participationsTable)
        .where(and(eq(participationsTable.username, username), eq(participationsTable.eventId, eventId)))
        .execute();
    }
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: error },
      { status: 500 },
    );
  }

}
