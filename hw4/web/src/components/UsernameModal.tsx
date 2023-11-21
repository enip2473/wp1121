"use client";
import Modal from '@mui/material/Modal';
import { useRouter } from 'next/navigation';
import { Button, TextField, Box } from '@mui/material';
import { useState } from 'react'
import { Endpoints } from '@/lib/endpoints';
import axios from 'axios';
import type { UsernameModalProps } from '@/lib/types';
export default function UsernameModal({userId, users}: UsernameModalProps){

    const [newName, setNewName] = useState('');
    const router = useRouter();
  
    const submitName = async (displayName: string) => {
      const user = users.find(user => user.displayName === displayName);
      let id;
      if (user) id = user.id;
      else {
        const postResponse = await axios.post(Endpoints.createUser, { displayName });
        id = postResponse.data.id;
        
    }
      router.push(`/?id=${id}`)
    };

    return (
        <Modal open={userId < 0}>
            <Box className="w-full h-full flex justify-center items-center">
                <Box className="flex flex-col space-y-4 p-5 rounded-lg bg-blue-50">
                    <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        label="Username"
                        autoFocus
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