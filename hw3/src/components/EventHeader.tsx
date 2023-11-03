"use client";
import Link from "next/link"
import { formatDate } from '@/lib/utils'
import React from 'react'
import axios from "axios";

type EventHeaderProps = {
    eventId: number;
    eventName: string;
    startTime: Date;
    endTime: Date;
    username: string;
    isParticipating: boolean;
    setIsParticipating: React.Dispatch<React.SetStateAction<boolean>>;
}

type EventDataProps = {
    eventName: string;
    startTime: Date;
    endTime: Date;
}

function EventHeader({
    eventId,
    eventName, 
    startTime, 
    endTime,
    username,
    isParticipating,
    setIsParticipating
}: EventHeaderProps) {
    return (
        <div className="flex items-center justify-between p-4">
            <Link href="/" className="inline-block">
                <GoBackButton />
            </Link>
            
            <div className="flex-1 text-center">
                <EventData eventName={eventName} startTime={startTime} endTime={endTime}/>
            </div>
            
            <div className="inline-block">
                <ParticipateButton username={username} eventId={eventId} isParticipating={isParticipating} setIsParticipating={setIsParticipating}/>
            </div>
        </div>
    )
    
}

function GoBackButton() {
    return (
        <button className="bg-gray-400 hover:bg-gray-500 text-black font-semibold py-2 px-4 rounded-full transition duration-300">
            Go Back
        </button>
    );
}


function EventData({ eventName, startTime, endTime }: EventDataProps){
    return (
        <div className="event-data">
            <div className="event-name text-xl font-bold">{eventName}</div>
            <div className="event-time">{formatDate(startTime)} - {formatDate(endTime)}</div>
        </div>
    );
}

type ParticipateButtonProps = {
    username: string;
    eventId: number;
    isParticipating: boolean;
    setIsParticipating: React.Dispatch<React.SetStateAction<boolean>>;
}

function ParticipateButton ({ username, eventId, isParticipating, setIsParticipating }: ParticipateButtonProps) {
    const buttonText = isParticipating ? 'Leave Event' : 'Join Event';
    const buttonClasses = isParticipating ? 
        "bg-red-500 hover:bg-red-600" : 
        "bg-green-500 hover:bg-green-600";

    const handleClick = async () => {
        try {
            if (isParticipating) {
                const postData = {
                    username: username, 
                    eventId: eventId,
                    inserting: false
                }
                await axios.post("/api/participations", postData);
            } else {
                const postData = {
                    username: username, 
                    eventId: eventId,
                    inserting: true
                }
                await axios.post("/api/participations", postData);
            }
            setIsParticipating(!isParticipating);
        }
        catch (error) {
            console.log(error);
        }
    };

    return (
        <button 
            className={`${buttonClasses} text-white font-semibold py-2 px-4 rounded-full transition duration-300`} 
            onClick={handleClick}
        >
            {buttonText}
        </button>
    );
}


export default EventHeader;