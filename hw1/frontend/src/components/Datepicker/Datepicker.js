import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatTime } from "../Common/Common";
export default function CustomDatePicker({ selectedDate, onDateChange }) {
  const handleDateChange = (date) => {
    onDateChange(date);
  };
  if (!selectedDate) selectedDate = new Date();
  const formattedDate = formatTime(selectedDate);
  return (
    <DatePicker
      selected={selectedDate}
      onChange={handleDateChange}
      dateFormat="yyyy-MM-dd" // Set the desired date format
      value={formattedDate} // Display the formatted date in the input field
    />
  );
}
