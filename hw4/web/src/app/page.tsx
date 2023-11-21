"use client";
import { Box } from "@mui/material"
import LeftBar from "@/components/LeftBar"
import UsernameModal from "@/components/UsernameModal"
import ChatRoomList from "@/components/ChatRoomList"
import SingleRoom from "@/components/SingleRoom"
import { useFetchDatas } from "@/hooks/useFetchDatas";


export default function Home() {
  const { userId, chatId, users, chatRooms, refetch } = useFetchDatas();
  const displayName = users.find(user => user.id === userId)?.displayName || ''
  return (
    <div className="flex min-h-screen w-full items-start bg-white justify-between">
      <Box className="flex w-[20%] h-full">
        <LeftBar displayName={displayName}/>
      </Box>
      <Box className="flex w-[30%] min-h-screen justify-start items-start p-6 bg-gray-100">
        <ChatRoomList userId={userId} chatId={chatId} users={users} chatRooms={chatRooms} refetch={refetch}/>
      </Box>
      <Box className="flex w-[50%] h-screen">
        <SingleRoom refetchChatRoom={refetch}/>
      </Box>
      <UsernameModal userId={userId} users={users}/>
    </div>
  )
}
