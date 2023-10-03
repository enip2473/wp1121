import type {
  CreateSongPayload,
  CreateSongResponse,
  CreateListPayload,
  CreateListResponse,
  GetSongsResponse,
  GetListsResponse,
  UpdateSongPayload,
  UpdateSongResponse,
  DeleteSongResponse,
  DeleteListResponse,
  UpdateListPayload,
  UpdateListResponse,
} from "@lib/shared_types";
import axios from "axios";

import { env } from "./env";

const client = axios.create({
  baseURL: env.VITE_API_URL,
});

export function getLists() {
  return client.get<GetListsResponse>("/lists");
}

export function getSongs() {
  return client.get<GetSongsResponse>("/songs");
}

export function createList(input: CreateListPayload) {
  return client.post<CreateListResponse>("/lists", input);
}

export function createSong(input: CreateSongPayload) {
  return client.post<CreateSongResponse>("/songs", input);
}

export function updateSong(id: string, input: UpdateSongPayload) {
  return client.put<UpdateSongResponse>(`/songs/${id}`, input);
}

export function updateList(id: string, input: UpdateListPayload) {
  return client.put<UpdateListResponse>(`/lists/${id}`, input);
}

export function deleteSong(id: string) {
  return client.delete<DeleteSongResponse>(`/songs/${id}`);
}

export function deleteList(id: string) {
  return client.delete<DeleteListResponse>(`/lists/${id}`);
}
