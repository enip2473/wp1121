import { Container } from "@mui/material";
import MainHeader from "@/components/MainHeader";
import SongLists from "@/components/SongLists";
import { useState } from "react"

export default function Main() {
    const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
    return (
        <Container maxWidth="lg">
            <MainHeader setIsDeleteMode={setIsDeleteMode} isDeleteMode={isDeleteMode}/>
            <SongLists isDeleteMode={isDeleteMode}/>
        </Container>
    );
}


// export default function Main() {
//     const { lists, fetchLists, fetchSongs } = useSongs();
//     const [newListDialogOpen, setNewListDialogOpen] = useState(false);
//     useEffect(() => {
//       fetchLists();
//       fetchSongs();
//     }, [fetchSongs, fetchLists]);
//     return(
//         <main className="mx-auto flex max-h-full flex-row gap-6 px-24 py-12">
//         {lists.map((list) => (
//         <SongList key={list.id} {...list} />
//         ))}
//         <div>
//         <Button
//             variant="contained"
//             className="w-80"
//             onClick={() => setNewListDialogOpen(true)}
//         >
//             <AddIcon className="mr-2" />
//             Add a list
//         </Button>
//         </div>
//         <NewListDialog
//         open={newListDialogOpen}
//         onClose={() => setNewListDialogOpen(false)}
//         />
//         </main>
//     )
// }

