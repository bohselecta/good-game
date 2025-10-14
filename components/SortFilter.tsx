import { useState } from 'react';

type SortOption = 'date' | 'quality' | 'excitement';

interface SortFilterProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export default function SortFilter({ sortBy, onSortChange }: SortFilterProps) {
  const sortOptions = [
    { value: 'date', label: 'Most Recent' },
    { value: 'quality', label: 'Best Games' },
    { value: 'excitement', label: 'Most Exciting' }
  ];

  return (
    <div className="sort-filter">
      <span className="filter-label">Sort by:</span>
      <select 
        value={sortBy} 
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="sort-select"
      >
        {sortOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
