export const formatDate : (rawDate: Date) => string = (rawDate : Date) => {
    const day = rawDate.getDate();
    const month = rawDate.toLocaleString('en', { month: 'short' });
    const year = rawDate.getFullYear();

    const hours = rawDate.getHours().toString().padStart(2, '0');
    const minutes = rawDate.getMinutes().toString().padStart(2, '0');
    return `${month} ${day}, ${year} ${hours}:${minutes}`;
}

export function datesBetween(start: Date, end: Date) {
    const days = []
    const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const msecPerDay = 1000 * 60 * 60 * 24;
    let curDate = startDate;
    
    while (curDate.getTime() < end.getTime()) {
        const weekOfDay = curDate.toLocaleString('en', { weekday: 'short' });
        days.push(`${curDate.getMonth() + 1}/${curDate.getDate()} (${weekOfDay})`)
        curDate = new Date(curDate.getTime() + msecPerDay);
    }
    return days;
}  

export function valid(index: number, start: Date, end: Date) {
    const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const msecPerHour = 1000 * 60 * 60;
    const indexTime = startDate.getTime() + index * msecPerHour;
    if (indexTime < start.getTime()) return false;
    if (indexTime >= end.getTime()) return false;
    return true;
}
