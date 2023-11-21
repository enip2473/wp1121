import { NextResponse, type NextRequest } from "next/server";

import { z } from "zod";
import { db } from "@/db";
import { usersTable, userChatroomsTable, chatroomsTable, messagesTable } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { not, eq, or, and } from 'drizzle-orm';
import { intersect } from 'drizzle-orm/pg-core'
import { ChatroomProps } from "@/lib/types";
import { socket } from "@/lib/socket"

const postSchema = z.object({
    chatroomName: z.string().min(1).max(50),
    userIds: z.array(z.number().min(1))
});

type PostRequest = z.infer<typeof postSchema>;


export async function GET(request: NextRequest, { params }: ChatroomProps) {
    const userId = params.userId || -1;
    try {
        const lastMessageSubquery = db.select({
            lastMessageId: sql`max(${messagesTable.id})`.as("maxId"),
            chatroomId: messagesTable.chatroomId
        })
        .from(messagesTable)
        .where(
            and(
                not(eq(messagesTable.isDeleted, true)),
                or(
                    not(eq(messagesTable.isHidden, true)),
                    not(eq(messagesTable.userId, userId))
                )
            )
        )
        .groupBy(messagesTable.chatroomId)
        .as('lastMessageSubquery');
    
        // Main query
        const chatroomsWithLastMessage = await db.select({
            chatroomId: chatroomsTable.id,
            chatroomName: chatroomsTable.chatroomName,
            lastMessageContent: messagesTable.content,
            lastMessageCreatedAt: messagesTable.createdAt
        })
        .from(userChatroomsTable)
        .innerJoin(chatroomsTable, eq(userChatroomsTable.chatroomId, chatroomsTable.id))
        .leftJoin(lastMessageSubquery, eq(lastMessageSubquery.chatroomId, chatroomsTable.id))
        .leftJoin(messagesTable, eq(messagesTable.id, lastMessageSubquery.lastMessageId))
        .where(eq(userChatroomsTable.userId, userId))
        .orderBy(desc(messagesTable.createdAt))
        .execute();

        const chatroomsWithUsers = await Promise.all(chatroomsWithLastMessage.map(async (chatroom) => {
            const usersInChatroom = await db.select({
                id: usersTable.id,
                displayName: usersTable.displayName
            })
            .from(userChatroomsTable)
            .innerJoin(usersTable, eq(usersTable.id, userChatroomsTable.userId))
            .where(eq(userChatroomsTable.chatroomId, chatroom.chatroomId))
            .execute();
                        
            return {
                ...chatroom,
                users: usersInChatroom
            };
        }));

        return NextResponse.json( 
            {chatRooms: chatroomsWithUsers},
            {status: 200},
        )
    }
    catch (error) {
        console.log(error);
        return NextResponse.json(
            {error: error},
            {status: 500}
        )
    }
}


export async function POST(request: NextRequest, { params }: ChatroomProps) {
    let data;
    try {
        data = await request.json();
        postSchema.parse(data);
    } catch (error) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { chatroomName, userIds } = data as PostRequest;
    
    if (userIds.length === 2) {
        const [firstUserId, secondUserId] = userIds;

        const firstChatrooms = db.select({
            chatroomId: userChatroomsTable.chatroomId
        })
        .from(userChatroomsTable)
        .where(eq(userChatroomsTable.userId, firstUserId))

        const secondChatrooms = db.select({
            chatroomId: userChatroomsTable.chatroomId
        })
        .from(userChatroomsTable)
        .where(eq(userChatroomsTable.userId, secondUserId))

        const shared = await intersect(firstChatrooms, secondChatrooms).execute();

        if (shared.length > 0) {
            return NextResponse.json({ 
                status: 200, 
                exist: true,
                chatroomId: shared[0].chatroomId 
            });
        }
        
    }

    const userId = params.userId || -1;
        
    const newChatroom = { chatroomName, userIds };

    const result = await db
        .insert(chatroomsTable)
        .values(newChatroom)
        .returning({ id: chatroomsTable.id })
        .execute();

    const chatroomId = result[0].id;

    await Promise.all(userIds.map(memberId => 
        db.insert(userChatroomsTable)
            .values({
                userId: memberId,
                chatroomId: chatroomId
            })
            .execute()
    ));

    await db.insert(messagesTable)
            .values({
                chatroomId: chatroomId,
                userId: userId,
                content: "Say hello to your new friend!",
                isSystem: true
            })
            .execute();

    const emitIds = userIds.filter(id => id != userId);
    socket.emit("new chatroom", emitIds, userId);
    return NextResponse.json({ 
        status: 201, 
        chatroomId
    })
}

export async function DELETE(request: NextRequest, { params }: ChatroomProps) {
    const chatroomId = params.userId;
    try {
        const response = await db.select({id: userChatroomsTable.userId})
            .from(userChatroomsTable)
            .where(eq(userChatroomsTable.chatroomId, chatroomId))
            .execute();

        const users = response.map(x => x.id);

        await db.delete(chatroomsTable)
                .where(eq(chatroomsTable.id, chatroomId))
                .execute();

        socket.emit("delete chatroom", users, 0);
        return NextResponse.json({
            status: 200,
        })
    }
    catch (error) {
        console.log(error);
        return NextResponse.json({
            status: 500, error: error
        })
    }
}

export async function PUT(request: NextRequest, { params }: ChatroomProps) {
    const chatroomId = params.userId;

    try {

        const data = await request.json();
        await db.update(chatroomsTable)
            .set(data)
            .where(eq(chatroomsTable.id, chatroomId))
            .execute();

        const response = await db.select({id: userChatroomsTable.userId})
            .from(userChatroomsTable)
            .where(eq(userChatroomsTable.chatroomId, chatroomId))
            .execute();

        const users = response.map(x => x.id);

        socket.emit("update chatroom", users, 0);
        
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


