import React, { useState } from 'react';

export default function TagFilter({ tags, onFilterChange }) {
  const [selectedTags, setSelectedTags] = useState([]);

  const handleTagChange = (tag) => {
    const updatedTags = [...selectedTags];
    if (updatedTags.includes(tag)) {
      updatedTags.splice(updatedTags.indexOf(tag), 1);
    } else {
      updatedTags.push(tag);
    }
    setSelectedTags(updatedTags);
    onFilterChange(updatedTags); // Notify the parent component of filter changes
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
    </div>
  );
}
