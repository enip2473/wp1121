import { Box } from "@mui/material"
import LeftBar from "@/components/LeftBar"
import UsernameModal from "@/components/UsernameModal"
import ChatRoomList from "@/components/ChatRoomList"
import SingleRoom from "@/components/SingleRoom"

export default function Home() {
  return (
    <div className="flex min-h-screen w-full items-start bg-white justify-between">
      <Box className="flex w-[20%] h-full">
        <LeftBar/>
      </Box>
      <Box className="flex w-[30%] min-h-screen justify-start items-start p-6 bg-gray-100">
        <ChatRoomList/>
      </Box>
      <Box className="flex w-[50%] h-screen">
        <SingleRoom/>
      </Box>
      <UsernameModal/>
    </div>
  )
}
