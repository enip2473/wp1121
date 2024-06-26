import { useState } from "react";

import { Container } from "@mui/material";

import MainHeader from "@/components/MainHeader";
import SongLists from "@/components/SongLists";

export default function Main() {
  const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  return (
    <Container maxWidth="lg">
      <MainHeader
        isDeleteMode={isDeleteMode}
        setIsDeleteMode={setIsDeleteMode}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <SongLists isDeleteMode={isDeleteMode} searchTerm={searchTerm} />
    </Container>
  );
}
