'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Search } from 'react-feather';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { datesBetween } from '@/lib/utils';
import { start } from 'repl';

interface SearchAddBarProps {
    searchTerm: string;
    // setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
    setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
}

interface SearchBarProps {
    searchTerm: string;
    // setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

type eventDate = {
    year: number;
    month: number;
    date: number;
    hours: number;
};

type NewEventProps = {
    eventName: string;
    startTime: eventDate;
    endTime: eventDate;
}

type NewEventBarProps = {
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
}

type DateTimeProps = {
    newDate: eventDate;
    handleChange: React.ChangeEventHandler<HTMLSelectElement>;
}


function SearchAddBar({searchTerm, setRefreshKey} : SearchAddBarProps) {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    return (
        <div className="pl-10 relative flex w-full items-center justify-between">
            <SearchBar searchTerm={searchTerm}/>
            <button onClick={() => setIsModalOpen(true)} className="mr-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Create New Event
            </button>
            {isModalOpen && <NewEventBar setRefreshKey={setRefreshKey} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}/>}
        </div>
    );
}

function SearchBar({searchTerm} : SearchBarProps) {
    const [input, setInput] = useState('');
    const searchParams = useSearchParams();

    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('searchTerm', input);

    useEffect(() => {
        setInput(searchTerm);
    }, [searchTerm])
          
    return (
        <div className="flex items-center p-4 rounded w-1/2">
            <input 
                placeholder="Search for event" 
                className="flex-grow outline-none px-3 py-1 rounded m-2"
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <Link href={`/?${newSearchParams.toString()}`}>
                <Search/>
            </Link>
        </div>
    );
}

function validateEvent(event: NewEventProps) {
    if (event.eventName == '') {
        return "Please enter event name!";
    }
    var startDate, endDate;
    try {
        startDate = new Date(
            event.startTime.year, 
            event.startTime.month - 1,
            event.startTime.date,
            event.startTime.hours,
        )
        
        if (startDate.getMonth() != event.startTime.month - 1) {
            return "Invalid Start Time!";
        }


        endDate = new Date(
            event.endTime.year, 
            event.endTime.month - 1,
            event.endTime.date,
            event.endTime.hours,
        )

        if (endDate.getMonth() != event.endTime.month - 1) {
            return "Invalid End Time!";
        }

        if (startDate.getTime() >= endDate.getTime()) {
            return "Start time should be smaller than end time"
        }
    }
    catch (error) {
        return "Please enter a valid date!"
    }

    const datesCount = datesBetween(startDate, endDate).length
    if (datesCount > 7) {
        return "Difference between start time and end time should be within 7 days"
    }
    return '';
}

function NewEventBar({isModalOpen, setIsModalOpen, setRefreshKey}: NewEventBarProps) {
    const currentTime = new Date();
    const curTime = {
        year: currentTime.getFullYear(),
        month: currentTime.getMonth() + 1,
        date: currentTime.getDate(),
        hours: currentTime.getHours(),
    }
    const [newEvent, setNewEvent] = useState<NewEventProps>({eventName:'', startTime: curTime, endTime: curTime})
    const modalRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();
    const params = useSearchParams();
    
    const handleCloseModal = () => {
        setNewEvent({eventName:'', startTime: curTime, endTime: curTime});
        setIsModalOpen(false);
    };    

    const handleSubmit = async () => {
        const errorMessage = validateEvent(newEvent);
        if (errorMessage) {
            alert(errorMessage);
            return;
        }
        const postEvent = {
            eventName: newEvent.eventName,
            startTime: new Date(
                newEvent.startTime.year, 
                newEvent.startTime.month - 1,
                newEvent.startTime.date,
                newEvent.startTime.hours,
            ),
            endTime: new Date(
                newEvent.endTime.year, 
                newEvent.endTime.month - 1,
                newEvent.endTime.date,
                newEvent.endTime.hours,
            )
        };
        try {
            const result = await axios.post('/api/events', postEvent);
            const resultData = await result.data;
            const username = params.get('username')
            const eventId = resultData.eventId;
            const participateData = {
                username, 
                eventId, 
                inserting: true
            }
            await axios.post('/api/participations', participateData)
            handleCloseModal();
            router.push(`/events/${eventId}?username=${username}`)
        } catch (error) {
            console.error('Error posting event:', error);
        }
        setRefreshKey(prev => prev + 1);
    };

    useEffect(() => {
        if (isModalOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isModalOpen]);

    const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            handleCloseModal();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewEvent({
            ...newEvent,
            [name]: value
        })
    }

    const handleStartTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewEvent({
            ...newEvent,
            startTime: {
                ...newEvent.startTime,
                [name]: value
            }
        })
    }

    const handleEndTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewEvent({
            ...newEvent,
            endTime: {
                ...newEvent.endTime,
                [name]: value
            }
        })
    }


    return (
        <div className="z-50 absolute top-0 left-0 w-full h-full flex items-center justify-center" ref={modalRef}>
            <div className="bg-white p-4 rounded">
                <h2>Add New Event</h2>
                <input 
                    type="text" 
                    name="eventName"
                    placeholder="Event Name" 
                    value={newEvent.eventName}
                    onChange={handleChange}
                    className="border p-2 rounded mt-2 w-full"
                />
                <div>Start Time:</div>
                <DateTimeDropdown newDate={newEvent.startTime} handleChange={handleStartTimeChange} />
                <div>End Time:</div>
                <DateTimeDropdown newDate={newEvent.endTime} handleChange={handleEndTimeChange} />
                <button onClick={handleSubmit} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-2 rounded mt-2">
                    Submit
                </button>
                <button onClick={handleCloseModal} className="ml-2 bg-gray-500 hover:bg-gray-400 text-white font-bold py-2 px-2 rounded">
                    Close
                </button>
            </div>
        </div>
    );
}

const DateTimeDropdown = ({ newDate, handleChange }: DateTimeProps) => {
    return (
        <div className="flex space-x-2"> {/* Flex container for horizontal alignment */}
            
            {/* Year Dropdown */}
            <select 
                name="year"
                value={newDate.year}
                onChange={handleChange}
                className="border p-2 rounded"
            >
                <option value="" selected disabled>Year</option>
                {[...Array(8)].map((_, i) => (
                    <option key={i} value={2020 + i}>
                        {2020 + i}
                    </option>
                ))}
            </select>

            {/* Month Dropdown */}
            <select 
                name="month"
                value={newDate.month}
                onChange={handleChange}
                className="border p-2 rounded"
            >
                <option value="" selected disabled>Month</option>
                {[...Array(12)].map((_, i) => (
                    <option key={i} value={i + 1}>
                        {i + 1}
                    </option>
                ))}
            </select>

            {/* Date Dropdown */}
            <select 
                name="date"
                value={newDate.date}
                onChange={handleChange}
                className="border p-2 rounded"
            >
                <option value="" selected disabled>Date</option>
                {[...Array(31)].map((_, i) => (
                    <option key={i} value={i + 1}>
                        {i + 1}
                    </option>
                ))}
            </select>

            {/* Hour Dropdown */}
            <select 
                name="hours"
                value={newDate.hours}
                onChange={handleChange}
                className="border p-2 rounded"
            >
                <option value="" selected disabled>Hour</option>
                {[...Array(24)].map((_, i) => (
                    <option key={i} value={i}>
                        {i}
                    </option>
                ))}
            </select>

        </div>
    );
};

export default SearchAddBar;
