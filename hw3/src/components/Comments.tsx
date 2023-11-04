import axios from "axios";
import { useEffect, useState } from "react";

type CommentsProp = {
    username: string;
    eventId: number;
    isParticipating: boolean;
}

type Comment = {
    commentId?: number;
    username: string;
    content: string;
}

type InputBarProps = {
    username: string;
    eventId: number;
    isParticipating: boolean;
    setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
}

type SingleCommentProp = {
    comment: Comment;
}

type ResponseComment = {
    username: string;
    content: string;
    createdAt: string;
    eventId: string;
}

function Comments({username, eventId, isParticipating}: CommentsProp) {
    const [comments, setComments] = useState<Comment[]>([]);
    useEffect(() => {
        const getComments = async () => {
            try {
                const response = await axios.get(`/api/comments/${eventId}`);
                const data = await response.data;
                const dbComments = data.comments.map((comment: ResponseComment) => {
                    return ({
                        username: comment.username,
                        content: comment.content
                    })
                })
                if (dbComments) setComments(dbComments);
            }
            catch (error) {
                console.log("Fetch Comments Error")
            }
        }
        getComments();
    }, [eventId]);
    return (
        <div>
            <InputBar username={username} eventId={eventId} isParticipating={isParticipating} setComments={setComments} />
            {comments?.map((comment, index) => (
               <SingleComment key={index} comment={comment}/>
            ))}
        </div>
    )
}

function InputBar({ username, eventId, isParticipating, setComments }: InputBarProps) {
    const [input, setInput] = useState('');
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (input.trim()) {
            const newComment = {
                username: username,
                eventId: eventId,
                content: input,
            }
            try {
                await axios.post(`/api/comments/${eventId}`, newComment)
                setComments(prevComments => [...prevComments, newComment]);
                setInput('');
            }
            catch(error) {
                console.log(error);
                alert("Add comment error!");
            }
        }
    }

    return (
        <div className="p-4">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full p-2 border rounded shadow-sm focus:outline-none focus:border-blue-300"
                    placeholder={isParticipating ? "Add a comment..." : "Join event to comment..."}
                    disabled={!isParticipating}
                />
            </form>
        </div>
    );
}

function SingleComment({comment}: SingleCommentProp) {
    return (
        <div className="p-1 border-b border-gray-200 max-w-md">
            <span className="font-semibold text-gray-800 mr-2">{comment.username}</span>
            <span className="text-gray-700 break-words whitespace-normal">{comment.content}</span>
        </div>
    )
}

export default Comments;