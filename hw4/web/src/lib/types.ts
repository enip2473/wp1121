
export type MousePosition = {
    mouseX: number;
    mouseY: number;
}

export type User = {
    id: number;
    displayName: string;
    lastRead: Date;
}

export type ChatRoom = {
    chatroomId: number;
    chatroomName: string;
    lastMessageContent: string;
    lastMessageCreatedAt: string;
    users: User[];
}

export type Message = {
    content: string,
    id: number,
    userId: number,
    isSystem: boolean,
    isPinned: boolean,
    isDeleted: boolean,
    isHidden: boolean,
    createdAt: Date,
}

export type LeftBarProps = {
    displayName: string;
}

export type ChatroomProps = {
    params: {
        userId: number; 
    }
}

export type SingleRoomProps = {
    userId: number, 
    chatId: number, 
    chatRoomUsers: User[], 
    messages: Message[], 
    pinnedMessage: Message | null, 
    refetch: () => void
}


export type MessageProps = {
    params: {
        chatroomId: number; 
    }
}


export type ChatRoomListProps = {
    userId: number;
    chatId: number;
    users: User[];
    chatRooms: ChatRoom[];
    refetch: () => void;
}

export type InsertChatroomProps = {
    chatroomName: string;
}

export type UserSelectModalProps = {
    users: User[];
    userId: number;
    open: boolean;
    onClose: () => void;
};

export type SingleMessageProps = {
    userId: number;
    message: Message;
    users: User[];
    handleContextMenu: (event: React.MouseEvent, message: Message) => void
}

export type UsernameModalProps = {
    userId: number;
    users: User[];
}

