import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { eventsTable, participationsTable } from "@/db/schema";
import { sql, eq } from "drizzle-orm";

type GetParamsType = {
    params: { 
        id: number;
    };
}

export async function GET(request: NextRequest, { params } : GetParamsType) {
    const eventId = params.id;
    try {
        const query = db.select({
            eventName: eventsTable.eventName,
            startTime: eventsTable.startTime,
            endTime: eventsTable.endTime,
            participationCount: sql<number>`count(${participationsTable.id})`
        })
        .from(eventsTable)
        .where(
            eq(eventsTable.id, eventId)
        )
        .limit(1)
        .leftJoin(
            participationsTable, 
            eq(eventsTable.id, participationsTable.eventId)
        )
        .groupBy(eventsTable.id);
        const events = await query.execute();
        if (events) {
            const event = events[0];
            return NextResponse.json({ event }, { status: 200 });
        }
        else {
            return NextResponse.json({ error: "Not Found" }, { status: 404 });
        }
    } catch (error) {
    console.log(error);
    return NextResponse.json(
        { error: error },
        { status: 500 },
    );
    }
}
