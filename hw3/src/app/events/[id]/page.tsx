"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import EventHeader from '@/components/EventHeader'
import { useSearchParams } from 'next/navigation';
import Comments from '@/components/Comments';
import Timetable from '@/components/Timetable';

type EventType = {
    eventName: string,
    startTime: Date,
    endTime: Date,
    participationCount: number
    isParticipating: boolean
}

type PageType = {
    params: {
        id: number;
    };
}

export default function Page({ params } : PageType) {
    const id = +params.id;
    const [event, setEvent] = useState<EventType | null>();
    const searchParams = useSearchParams()
    const username = searchParams.get('username') || 'guest';
    const [participateStatus, setParticipateStatus] = useState(false);

    useEffect(() => {
        const start = async () => {
            const [eventResponse, participationResponse] = await Promise.all([
                axios.get(`/api/events/${id}`),
                axios.get(`/api/participations?username=${username}`)
            ]);    
            const eventData = eventResponse.data.event;
            const attending = participationResponse.data.attendingEvents;
            const fetchedEvent: EventType = {
                ...eventData,
                startTime: new Date(eventData.startTime),
                endTime: new Date(eventData.endTime),
                isParticipating: attending.includes(id)
            }
            setEvent(fetchedEvent);
            setParticipateStatus(fetchedEvent.isParticipating);
        }
        start();
    }, [participateStatus, id, username]);
    
    if (!event) {
        return (
            <div> Loading... </div>
        )
    }
    return (
        <div>
            <EventHeader 
                eventId={id}
                eventName={event.eventName} 
                startTime={event.startTime} 
                endTime={event.endTime}
                username={username}
                isParticipating={participateStatus}
                setIsParticipating={setParticipateStatus}
            />
            <main className="flex min-h-screen justify-between p-8">
                <div className="flex-1 flex justify-center mx-w[400px]">
                    <Comments username={username} eventId={id} isParticipating={participateStatus}/>
                </div>
                <div className="flex-1 flex justify-center">
                    <Timetable isParticipating={participateStatus} username={username} eventId={id} participationCount={event.participationCount}/>
                </div>
            </main>
        </div>
    )
}