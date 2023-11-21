import { useState, useEffect } from 'react';
import axios from 'axios';
import { Endpoints } from '@/lib/endpoints';
import { User, ChatRoom } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { socket } from '@/lib/socket';

export const useFetchDatas = () => {
    const searchParams = useSearchParams();
    const userId = parseInt(searchParams.get('id') || '-1')
    const chatId = parseInt(searchParams.get('chat') || '-1')

    const [users, setUsers] = useState<User[]>([]);
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [refetchId, setRefetchId] = useState(0);
    
    const refetch = () => {
        setRefetchId(prev => prev + 1);
    }

    useEffect(() => {
        socket.emit('register', userId);
        socket.on('new message', (fromId) => {
            if (fromId !== userId) refetch();
        });    
        return function cleanup() {
            socket.off('new message');
        }
    }, [userId]);

    useEffect(() => {
        const getUsers = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(Endpoints.getUsers);
                setUsers(response.data.users);
                setIsLoading(false);
            } catch (err) {
                setUsers([]);
                setError(err as string);
                setIsLoading(false);
            }
        };
        const getChatRooms = async () => {
            setIsLoading(true);
            try {
                if (userId >= 0) {
                    const response = await axios.get(`${Endpoints.getChatRooms}${userId}`);
                    setChatRooms(response.data.chatRooms);
                }
                else {
                    setChatRooms([]);
                }
                setIsLoading(false);
            } catch (err) {
                setChatRooms([]);
                setError(err as string);
                setIsLoading(false);
            }
        }
        Promise.all([getUsers(), getChatRooms()]);
    }, [userId, chatId, refetchId]);

    return { userId, chatId, users, chatRooms, isLoading, error, refetch };
};
