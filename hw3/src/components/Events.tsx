import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import Axios
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface EventsProp {
    username: string;
    searchTerm: string;
    refreshKey: number;
}

interface SingleEventProp {
    username: string;
    event: Event;
}

interface Event {
    id: number;
    eventName: string;
    startTime: string;
    endTime: string;
    isParticipating: string | null;
    participationCount: number;
}

function Events({ username, searchTerm, refreshKey } : EventsProp) {
    const [events, setEvents] = useState<Event[]>([]);
    
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const participateResponse = axios.get(`/api/participations?username=${username}`);
                const response = await axios.get(`/api/events?searchTerm=${searchTerm}`);
                const resParticipations = await participateResponse;
                const data = await response.data;
                let fetchedEvents: Event[] = data.events;
                const tempData = await resParticipations.data;
                const participateEvents = tempData.attendingEvents;

                fetchedEvents = fetchedEvents.map(event => ({
                    ...event,
                    isParticipating: participateEvents.includes(event.id)
                }));

                setEvents(fetchedEvents);
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        }
        fetchEvents();
    }, [searchTerm, username, refreshKey]);

    // useEffect(() => {
    //     const params = {username: username};
    //     const fetchParticipate = async () => {
    //         try {
    //             const response = await axios.get('/api/participate', { params });
    //             const participateEvents: number[] = response.data;
    //             setParticipate(participateEvents);
    //         } catch (error) {
    //             console.error("Error fetching events:", error);
    //         }
    //     }
    //     fetchParticipate();
    // }, [username]);

    return (
        <div className="w-full p-8 flex flex-wrap justify-center align-start gap-4">
            {events.map(event => (
                <SingleEvent username={username} event={event}/>
            ))}
        </div>
    );
}

function SingleEvent({username, event}: SingleEventProp) {
    return (
        <Link href={{
            pathname: `/events/${event.id}`,
            query: { username: username },
          }}
        >

            <div className={`z-0 border p-6 m-4 rounded-lg shadow-2xl flex flex-1 flex-col w-[300px] relative ${event.isParticipating ? "bg-green-100" : "bg-white"}`}>
                {/* Event Name */}
                {event.isParticipating && (
                    <svg className="w-8 h-8 text-green-500 absolute top-4 right-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                )}
                <h2 className="text-2xl font-extrabold text-blue-800">{event.eventName}</h2>
                
                {/* Event Details */}
                <div className="mt-4 space-y-2">
                    <p className="text-lg">
                        <span className="font-semibold text-gray-700">Start:</span> 
                        <span className="ml-2 text-gray-600">{formatDate(new Date(event.startTime))}</span>
                    </p>
                    <p className="text-lg">
                        <span className="font-semibold text-gray-700">End:</span> 
                        <span className="ml-2 text-gray-600">{formatDate(new Date(event.endTime))}</span>
                    </p>
                    <p className="text-lg">
                        {/* <span className="font-semibold text-gray-700">Participation Count:</span>  */}
                        <span className="text-gray-700">{event.participationCount} {event.participationCount > 1 ? "people" : "person"} is in!</span>
                    </p>
                </div>

                {/* Participation Indicator */}
            </div>

        </Link>
    );
}

export default Events;
