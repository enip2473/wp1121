'use client';
import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UsernameBarProps {
    username: string;
}


function UsernameBar({username} : UsernameBarProps) {
    
    const router = useRouter()
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [newUsername, setNewUsername] = useState<string>('');

    const handleSwitchUser = () => {
        setNewUsername(() => '');
        setIsOpen(() => true);
    };

    const handleClose = () => {
        setIsOpen(() => false);
    }

    const handleSave = () => {
        setIsOpen(() => false);
        router.push(`/?username=${newUsername}`)
    }

    return (
        <div className="flex w-full items-center justify-between p-8">
            <span className="pl-8 py-2 text-2xl font-semibold tracking-wide">
                Hello, {username}
            </span>
            <button onClick={handleSwitchUser} className="mr-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Switch User
            </button>
            {isOpen && (
                <div className="z-40 absolute top-0 left-0 w-full h-full flex items-center justify-center">
                    <div className="border border-black bg-white p-4 rounded">
                        <h2>Enter New Username</h2>
                        <input 
                            type="text" 
                            value={newUsername} 
                            onChange={(e) => setNewUsername(e.target.value)} 
                            className="border p-2 rounded mt-2"
                        />
                        <button onClick={handleSave} className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded mt-2">Submit</button>
                        <button onClick={handleClose} className="ml-2 bg-gray-500 hover:bg-gray-400 text-white font-bold py-2 px-2 rounded mt-2">Close</button>
                    </div>
                </div>
            )}

        </div>
    );
}

export default UsernameBar;