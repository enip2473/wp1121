import React, { useState } from 'react';
import './DropdownCheckbox.css'

export default function DropdownCheckbox({ availableTags, onFilterChange }) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [relationship, setRelationship] = useState('AND'); // Default to AND
  const [isDropdownOpen, setDropdownOpen] = useState(false); // Default to AND

  const handleTagChange = (tag) => {
    console.log(tag);
    const updatedTags = [...selectedTags];
    if (updatedTags.includes(tag)) {
      updatedTags.splice(updatedTags.indexOf(tag), 1);
    } else {
      updatedTags.push(tag);
    }
    console.log(updatedTags);
    setSelectedTags(updatedTags);
    onFilterChange(updatedTags, relationship); // Notify the parent component of filter changes
  };

  const handleRelationshipChange = (e) => {
    setRelationship(e.target.value);
    onFilterChange(selectedTags, e.target.value); // Notify the parent component of filter changes
  };

  const handleDropdownToggle = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  return (
    <div class="dropdown">
      <button onClick={handleDropdownToggle} class="dropbtn"> Tags </button>
      <div className={`dropdown-menu${isDropdownOpen ? '-open' : ''}`}>
        {availableTags.map((tag) => (
          <label key={tag} className="checkbox-label">
            <input
              type="checkbox"
              value={tag}
              onChange={() => handleTagChange(tag)}
            />
            {tag}
          </label>
        ))}
      </div>
    </div>
  );
}
