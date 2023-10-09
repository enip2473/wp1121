import { Container } from "@mui/material";
import MainHeader from "@/components/MainHeader";
import SongLists from "@/components/SongLists";
import { useState } from "react"

export default function Main() {
    const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState('');
    return (
        <Container maxWidth="lg">
            <MainHeader 
                setIsDeleteMode={setIsDeleteMode} 
                isDeleteMode={isDeleteMode}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />
            <SongLists isDeleteMode={isDeleteMode} searchTerm={searchTerm}/>
        </Container>
    );
}