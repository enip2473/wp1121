export function formatTime(dateString) {
    const dateUTC = new Date(dateString);
    const dateLocal = dateUTC.toLocaleString(); 
    const parts = dateLocal.split(' ')[0].split('/'); // Split the date string
    const year = parseInt(parts[0]);
    const month = String(parseInt(parts[1])).padStart(2, '0');
    const day = String(parseInt(parts[2])).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
}