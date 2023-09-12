import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function CustomDatePicker({ selectedDate, onDateChange }) {
  const handleDateChange = (date) => {
    onDateChange(date);
  };

  const toFormattedString = (date) => {
    const dateLocal = date.toLocaleString(); 
    const parts = dateLocal.split(' ')[0].split('/'); // Split the date string
    const year = parseInt(parts[0]);
    const month = String(parseInt(parts[1])).padStart(2, '0');
    const day = String(parseInt(parts[2])).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }

  // Format the selectedDate to display only the date portion
  const formattedDate = selectedDate
    ? toFormattedString(selectedDate)
    : '';

  return (
    <DatePicker
      selected={selectedDate}
      onChange={handleDateChange}
      dateFormat="yyyy-MM-dd" // Set the desired date format
      value={formattedDate}   // Display the formatted date in the input field
    />
  );
}
