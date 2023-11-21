import type { User } from "./types";

export function formatName(name: string) {
    if (name.length <= 8) return name;
    return name.slice(0, 8) + "...";
}

export function formatUsers(users: User[], myId: number) {
    const filteredUsers = users.filter((user) => user.id != myId);
    const names = filteredUsers.map(user => user.displayName);
    return names.join(", ")
}