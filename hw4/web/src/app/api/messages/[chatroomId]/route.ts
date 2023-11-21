import { NextResponse, type NextRequest } from "next/server";

import { z } from "zod";
import { db } from "@/db";
import { usersTable, userChatroomsTable, messagesTable, chatroomsTable } from "@/db/schema";
import type { MessageProps } from "@/lib/types";
import { eq, asc } from "drizzle-orm";
import { socket } from "@/lib/socket";

const postSchema = z.object({
    userId: z.number().min(1),
    content: z.string().min(1)
});

type PostRequest = z.infer<typeof postSchema>;

export async function GET(request: NextRequest, { params }: MessageProps) {
    const chatRoomId = params.chatroomId;
    try {
        const query = db.select({
            content: messagesTable.content,
            id: messagesTable.id,
            userId: messagesTable.userId,
            isSystem: messagesTable.isSystem,
            isHidden: messagesTable.isHidden,
            isDeleted: messagesTable.isDeleted,
            createdAt: messagesTable.createdAt
        })
        .from(messagesTable)
        .where(eq(messagesTable.chatroomId, chatRoomId))
        .orderBy(asc(messagesTable.createdAt))
        const messages = await query.execute();

        const users = await db.select({
            id: usersTable.id,
            displayName: usersTable.displayName,
            lastRead: userChatroomsTable.lastRead
        })
        .from(userChatroomsTable)
        .innerJoin(usersTable, eq(usersTable.id, userChatroomsTable.userId))
        .where(eq(userChatroomsTable.chatroomId, chatRoomId))
        .execute();

        const pinnedMessages = await db.select({
            id: chatroomsTable.pinnedMessageId,
            content: messagesTable.content,
            isDeleted: messagesTable.isDeleted,
            isHidden: messagesTable.isHidden,
            userId: messagesTable.userId
        })
        .from(chatroomsTable)
        .innerJoin(messagesTable, eq(messagesTable.id, chatroomsTable.pinnedMessageId))
        .where(eq(chatroomsTable.id, chatRoomId))
        .execute();

        const pinnedMessage = pinnedMessages.length > 0 ? pinnedMessages[0] : null;
        return NextResponse.json({ messages, users, pinnedMessage }, { status: 200 });
    } 
    catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: error },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest, { params }: MessageProps) {
    const chatroomId = params.chatroomId;
    let data;
    try {
      data = await request.json();
      postSchema.parse(data);
    } catch (error) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const { content, userId } = data as PostRequest;
    
    try {
        const newMessage = { content, userId, chatroomId };
        const result = await db
            .insert(messagesTable)
            .values(newMessage)
            .returning({ id: messagesTable.id })
            .execute();

        const response = await db.select({id: userChatroomsTable.userId})
            .from(userChatroomsTable)
            .where(eq(userChatroomsTable.chatroomId, chatroomId))
            .execute();

        const users = response.map(x => x.id);
        socket.emit("new message", users, userId);

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

export async function PUT(request: NextRequest, { params }: MessageProps) {
    const messageId = params.chatroomId;

    try {
        const data = await request.json();
        db.update(messagesTable)
            .set(data)
            .where(eq(messagesTable.id, messageId))
            .execute();

        const roomIdResponse = await db.select({id: messagesTable.chatroomId})
            .from(messagesTable)
            .where(eq(messagesTable.id, messageId));
        
        const chatroomId = roomIdResponse[0].id;
        
        const response = await db.select({id: userChatroomsTable.userId})
            .from(userChatroomsTable)
            .where(eq(userChatroomsTable.chatroomId, chatroomId))
            .execute();

        const users = response.map(x => x.id);

        socket.emit("update message", users, 0);

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

