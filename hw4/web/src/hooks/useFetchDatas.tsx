import { useState, useEffect } from 'react';
import axios from 'axios';
import { Endpoints } from '@/lib/endpoints';
import type { User, Message, ChatRoom } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { socket } from '@/lib/socket';

export const useFetchDatas = () => {
    const searchParams = useSearchParams();
    const userId = parseInt(searchParams.get('id') || '-1')
    const chatId = parseInt(searchParams.get('chat') || '-1')

    const [users, setUsers] = useState<User[]>([]);
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [refetchId, setRefetchId] = useState(0);
    const [chatRoomUsers, setChatRoomUsers] = useState<User[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [pinnedMessage, setPinnedMessage] = useState<Message | null>(null);

    const refetch = () => {
        setRefetchId(prev => prev + 1);
    }

    useEffect(() => {
        const putRead = async () => {
            if (userId < 0 || chatId < 0) return;
            const putRequest = { userId, chatroomId: chatId}
            await axios.put(Endpoints.updateHasRead, putRequest);
        }
        putRead();
        if (userId > 0) {
            socket.emit('register', userId);
            socket.on('new message', async (newId) => {
                if (newId !== userId) {
                    refetch();
                }
                putRead();
            });    
            socket.on('read message', (newId) => {
                if (newId !== userId) refetch();
            });    
            return function cleanup() {
                socket.off('new message');
            }
        }
    }, [userId, chatId]);


    useEffect(() => {
        const getUsers = async () => {
            try {
                const response = await axios.get(Endpoints.getUsers);
                setUsers(response.data.users);
            } catch (err) {
                setUsers([]);
            }
        };
        const getChatRooms = async () => {
            try {
                if (userId >= 0) {
                    const response = await axios.get(`${Endpoints.getChatRooms}${userId}`);
                    setChatRooms(response.data.chatRooms);
                }
                else {
                    setChatRooms([]);
                }
            } catch (err) {
                setChatRooms([]);
            }
        }
        const getMessages = async () => {
            try {
                if (chatId >= 0) {
                    const response = await axios.get(`${Endpoints.getMessages}${chatId}`);
                    setMessages(response.data.messages);
                    setChatRoomUsers(response.data.users);
                    setPinnedMessage(response.data.pinnedMessage);
                }
                else {
                    setMessages([]);
                    setChatRoomUsers([]);
                }
            } catch (err) {
                setMessages([]);
                setChatRoomUsers([]);
            }
        }
        Promise.all([getUsers(), getChatRooms(), getMessages()]);
    }, [userId, chatId, refetchId]);

    return { userId, chatId, users, chatRooms, chatRoomUsers, messages, pinnedMessage, refetch };
};
