import { NextResponse, type NextRequest } from "next/server";

import { z } from "zod";
import { db } from "@/db";
import { userChatroomsTable } from "@/db/schema";
import { eq, and } from 'drizzle-orm';
import io from "socket.io-client";

const putSchema = z.object({
    userId: z.number().min(1),
    chatroomId: z.number().min(1),
});

type PutRequest = z.infer<typeof putSchema>;


export async function PUT(request: NextRequest) {
    const data = await request.json();
    try {
        putSchema.parse(data);
    } 
    catch(error) {
        return NextResponse.json(
            { error: "Bad Request" },
            { status: 400 },
        );
    }

    const { userId, chatroomId } = data as PutRequest;
    const currentTime = new Date();
    const update = {
        lastRead: currentTime
    }

    try {
        await db.update(userChatroomsTable)
            .set(update)
            .where(
                and(
                    eq(userChatroomsTable.userId, userId),
                    eq(userChatroomsTable.chatroomId, chatroomId)
                )
            )
            .execute();
            
        const response = await db.select({id: userChatroomsTable.userId})
            .from(userChatroomsTable)
            .where(eq(userChatroomsTable.chatroomId, chatroomId))
            .execute();

        const users = response.map(x => x.id).filter(id => id != userId);
        const socketURL = process.env.NEXT_PUBLIC_SOCKET_URL || '';
        const socket = io(socketURL);
        socket.emit("read message", users, userId);
        
        return NextResponse.json(
            { status: 200 },
        );
    }
    catch (error) {
        return NextResponse.json(
            { error: "Bad Request" },
            { status: 400 },
        );
    }
}
