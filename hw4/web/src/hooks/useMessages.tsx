import { useState, useEffect } from 'react';
import axios from 'axios';
import { Endpoints } from '@/lib/endpoints';
import { useSearchParams } from 'next/navigation';
import type { Message, User } from '@/lib/types';
import { socket } from '@/lib/socket';

export const useMessages = () => {
    const searchParams = useSearchParams();
    const userId = parseInt(searchParams.get('id') || '-1')
    const chatId = parseInt(searchParams.get('chat') || '-1')
    const [users, setUsers] = useState<User[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [refetchId, setRefetchId] = useState(0);
    const [pinnedMessage, setPinnedMessage] = useState<Message | null>(null);
    
    const refetch = () => {
        setRefetchId(prev => prev + 1);
    }

    useEffect(() => {
        if (userId > 0) {
            socket.emit('register', userId);
            socket.on('new message', (newId) => {
                if (newId !== userId) refetch();
            });    
            return function cleanup() {
                socket.off('new message');
            }
        }
    }, [userId]);

    useEffect(() => {
        const getMessages = async () => {
            setIsLoading(true);
            try {
                if (chatId >= 0) {
                    if (userId > 0) {
                        const putRequest = {
                            userId,
                            chatroomId: chatId
                        }
                        await axios.put(Endpoints.updateHasRead, putRequest);
                    }
                    const response = await axios.get(`${Endpoints.getMessages}${chatId}`);
                    setMessages(response.data.messages);
                    setUsers(response.data.users);
                    setPinnedMessage(response.data.pinnedMessage);
                }
                else {
                    setMessages([]);
                    setUsers([]);
                }
                setIsLoading(false);
            } catch (err) {
                setMessages([]);
                setUsers([]);
                setError(err as string);
                setIsLoading(false);
            }
        }
        getMessages();
    }, [userId, chatId, refetchId]);

    return { userId, chatId, users, messages, pinnedMessage, isLoading, error, refetch };
};
