export function formatTime(dateString) {
  var selectedDate;
  if (typeof dateString == "string") {
    selectedDate = new Date(dateString);
  } else {
    selectedDate = dateString;
  }
  const day_table = ["日", "一", "二", "三", "四", "五", "六"];
  const dateLocal = selectedDate.toLocaleString();
  const parts = dateLocal.split(" ")[0].split("/"); // Split the date string
  const year = parseInt(parts[0]);
  const month = String(parseInt(parts[1])).padStart(2, "0");
  const date = String(parseInt(parts[2])).padStart(2, "0");
  const day = selectedDate.getDay();
  const formattedDate = `${year}-${month}-${date} (${day_table[day]})`;
  return formattedDate;
}
