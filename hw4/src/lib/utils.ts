export function formatName(name: string) {
    if (name.length <= 8) return name;
    return name.slice(0, 8) + "...";
}