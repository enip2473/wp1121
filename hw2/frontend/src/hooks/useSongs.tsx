import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import type { GetSongsResponse, GetListsResponse } from "@lib/shared_types";

import type { SongListProps } from "@/components/SongList";
import { getSongs, getLists } from "@/utils/client";

type SongContextType = {
  lists: SongListProps[];
  fetchLists: () => Promise<void>;
  fetchSongs: () => Promise<void>;
};

// context is a way to share data between components without having to pass props down the component tree
const SongContext = createContext<SongContextType>({
  lists: [],
  fetchLists: async () => {},
  fetchSongs: async () => {},
});

type SongProviderProps = {
  children: React.ReactNode;
};

// all data fetching and processing is done here, the rest of the app just consumes the data exposed by this provider
// when we run fetchLists or fetchSongs, we update the state of the provider, which causes the rest of the app to re-render accordingly
export function SongProvider({ children }: SongProviderProps) {
  const [rawLists, setRawLists] = useState<GetListsResponse>([]);
  const [rawSongs, setRawSongs] = useState<GetSongsResponse>([]);

  const fetchLists = useCallback(async () => {
    try {
      const { data } = await getLists();
      setRawLists(data);
    } catch (error) {
      alert("Error: failed to fetch lists");
    }
  }, []);

  const fetchSongs = useCallback(async () => {
    try {
      const { data } = await getSongs();
      setRawSongs(data);
    } catch (error) {
      alert("Error: failed to fetch songs");
    }
  }, []);

  const lists = useMemo(() => {
    const listMap = rawLists.reduce(
      (acc, list) => {
        acc[list.id] = { ...list, songs: [] };
        return acc;
      },
      {} as Record<string, SongListProps>,
    );
    // or you can do for loops
    for (const song of rawSongs) {
      listMap[song.list_id].songs.push({
        ...song,
        listId: song.list_id,
      });
    }
    return Object.values(listMap);
  }, [rawSongs, rawLists]);

  return (
    <SongContext.Provider
      value={{
        lists,
        fetchLists,
        fetchSongs,
      }}
    >
      {children}
    </SongContext.Provider>
  );
}

// this is a custom hook, the name must start with "use"
export default function useSongs() {
  return useContext(SongContext);
}
