import type { SingleMessageProps } from "@/lib/types";
import { Avatar, Box, Paper } from '@mui/material';

export default function SingleMessage({userId, users, message, handleContextMenu}: SingleMessageProps) {
    const author = users.filter(user => user.id === message.userId)[0].displayName;
    
    const renderMessageContent = (content: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return content.split(urlRegex).map((part, index) => 
            urlRegex.test(part) ? <a className="text-blue-500 underline" href={part} key={index} target="_blank" rel="noopener noreferrer">{part}</a> : part
        );
    };
    
    if (message.isSystem) {
        let content;
        if (message.isDeleted) {
            content = `${author} unsend a message.`
        }
        else {
            content = `${author} created the chatroom.`
        }
        return (
            <Box 
                key={message.id} 
                className="flex justify-center mb-4" 
            >
                <Paper className="p-2">
                    <p>{content}</p>
                </Paper>
            </Box>
        )
    }
    else if (message.userId === userId) {
        if (message.isHidden) {
            return <></>
        }
        else {
            return (
                <Box 
                    key={message.id} 
                    className="flex justify-end mb-4" 
                    onContextMenu={(e) => handleContextMenu(e, message)}
                >
                    <Paper className="p-2">
                    <p>{renderMessageContent(message.content)}</p>
                    </Paper>
                </Box>
            )
        }
    }
    else {
        return (
            <Box 
                key={message.id} 
                className="flex items-center mb-4"
                onContextMenu={(e) => handleContextMenu(e, message)}
            >
                <Avatar/>
                <Box className="ml-2">
                <Paper className="p-2">
                    <p>{renderMessageContent(message.content)}</p>
                </Paper>
                </Box>
            </Box>
        )
    }
}