import { NextResponse, type NextRequest } from "next/server";

import { z } from "zod";
import { db } from "@/db";
import { usersTable } from "@/db/schema";

const postSchema = z.object({
    displayName: z.string().min(1).max(50),
});

type PostRequest = z.infer<typeof postSchema>;

export async function GET(request: NextRequest) {
    try {
        let query = db.select({
            displayName: usersTable.displayName,
            id: usersTable.id,
        })
        .from(usersTable)
        const users = await query.execute();
        return NextResponse.json({ users }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: error },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    let data;
    try {
      data = await request.json();
      postSchema.parse(data);
    } catch (error) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const { displayName } = data as PostRequest;
    
    try {
        const newUser = { displayName };
        const result = await db
            .insert(usersTable)
            .values(newUser)
            .returning({ id: usersTable.id })
            .execute();
        return NextResponse.json(
            { id: result[0].id },
            { status: 200 },
        )

    } catch (error) {
        return NextResponse.json(
            { error: "error" },
            { status: 500 },
        );
    }
}