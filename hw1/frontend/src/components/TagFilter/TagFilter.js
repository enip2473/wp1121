import React, { useState } from 'react';

export default function TagFilter({ tags, onFilterChange }) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [relationship, setRelationship] = useState('AND'); // Default to AND

  const handleTagChange = (tag) => {
    const updatedTags = [...selectedTags];
    if (updatedTags.includes(tag)) {
      updatedTags.splice(updatedTags.indexOf(tag), 1);
    } else {
      updatedTags.push(tag);
    }
    setSelectedTags(updatedTags);
    onFilterChange(updatedTags, relationship); // Notify the parent component of filter changes
  };

  const handleRelationshipChange = (e) => {
    setRelationship(e.target.value);
    onFilterChange(selectedTags, e.target.value); // Notify the parent component of filter changes
  };


  return (
    <div>
      <h4>Filter by Tags:</h4>
      {tags.map((tag) => (
        <label key={tag}>
          <input
            type="checkbox"
            value={tag}
            checked={selectedTags.includes(tag)}
            onChange={() => handleTagChange(tag)}
          />
          {tag}
        </label>
      ))}
      <div>
        <label>Relationship:</label>
        <select value={relationship} onChange={handleRelationshipChange}>
          <option value="AND">AND</option>
          <option value="OR">OR</option>
        </select>
      </div>
    </div>
  
  );
}


