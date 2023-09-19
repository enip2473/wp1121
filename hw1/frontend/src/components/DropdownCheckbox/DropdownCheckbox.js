import React, { useState } from 'react';
import './DropdownCheckbox.css'

export default function DropdownCheckbox({ availableTags, availableMoods, onFilterChange }) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [relationship, setRelationship] = useState('AND'); // Default to AND
  const [isDropdownOpen, setDropdownOpen] = useState(false); // Default to AND

  const handleTagChange = (tag) => {
    const updatedTags = [...selectedTags];
    if (updatedTags.includes(tag)) {
      updatedTags.splice(updatedTags.indexOf(tag), 1);
    } else {
      updatedTags.push(tag);
    }
    setSelectedTags(updatedTags);
    onFilterChange(updatedTags, selectedMoods, relationship); // Notify the parent component of filter changes
  };

  const handleMoodChange = (mood) => {
    const updatedMoods = [...selectedMoods];
    if (updatedMoods.includes(mood)) {
      updatedMoods.splice(updatedMoods.indexOf(mood), 1);
    } else {
      updatedMoods.push(mood);
    }
    setSelectedMoods(updatedMoods);
    onFilterChange(selectedTags, updatedMoods, relationship); // Notify the parent component of filter changes
  };


  const handleRelationshipChange = (e) => {
    setRelationship(e.target.value);
    onFilterChange(selectedTags, selectedMoods, e.target.value); // Notify the parent component of filter changes
  };

  const handleDropdownToggle = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="dropdown">
      <div onClick={handleDropdownToggle} className="drop-button">
          Tags
      </div>
      <div className={`dropdown-menu${isDropdownOpen ? '-open' : ''}`}>
        <div className='tags'>
          {availableTags.map((tag) => (
            <label key={tag} className="checkbox-label">
              <input
                name="tagCheckbox"
                type="checkbox"
                value={tag}
                onChange={() => handleTagChange(tag)}
              />
              {tag}
            </label>
          ))}
        </div>
        <div className='moods'>
          {availableMoods.map((mood) => (
            <label key={mood} className="checkbox-label">
              <input
                name="tagCheckbox"
                type="checkbox"
                value={mood}
                onChange={() => handleMoodChange(mood)}
              />
              {mood}
            </label>
          ))}
        </div>
        <div className='relationship'>
          <select id="selectOption" value={relationship} onChange={handleRelationshipChange}>
            <option value="AND">And</option>
            <option value="OR">Or</option>
          </select>
        </div>
      </div>
    </div>
  );
}
