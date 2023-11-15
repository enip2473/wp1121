"use client";
import Modal from '@mui/material/Modal';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, TextField, Box } from '@mui/material';
import { useState } from 'react'
export default function UsernameModal(){
    const searchParams = useSearchParams();
    const username = searchParams.get('username');
    const [newName, setNewName] = useState('');
    const router = useRouter();
  
    const submitName = (username: string) => {
      router.push(`/?username=${username}`)
    };

    return (
        <Modal open={!username}>
            <Box className="w-full h-full flex justify-center items-center">
                <Box className="flex flex-col space-y-4 p-5 rounded-lg bg-blue-50">
                    <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        label="Username"
                        autoFocus
                        value={username}
                        onChange={(e) => setNewName(e.target.value)}
                        className="bg-white"
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        className="mt-4 bg-blue-400"
                        onClick={() => submitName(newName)}
                    >
                        Sign In
                    </Button>
                </Box>
            </Box>
        </Modal>
    )
}