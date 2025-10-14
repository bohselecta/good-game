type Sport = "NBA"|"NFL"|"MLB"|"NHL"|"Soccer"|"UFC";

interface SportFilterProps {
  selectedSports: Sport[];
  onSportsChange: (sports: Sport[]) => void;
}

export default function SportFilter({ selectedSports, onSportsChange }: SportFilterProps) {
  const allSports: Sport[] = ["NBA", "NFL", "MLB", "NHL", "Soccer", "UFC"];
  
  const toggleSport = (sport: Sport) => {
    if (selectedSports.includes(sport)) {
      onSportsChange(selectedSports.filter(s => s !== sport));
    } else {
      onSportsChange([...selectedSports, sport]);
    }
  };

  const selectAll = () => {
    onSportsChange(allSports);
  };

  const selectNone = () => {
    onSportsChange([]);
  };

  return (
    <div className="sport-filter">
      <div className="filter-header">
        <span className="filter-label">Sports:</span>
        <div className="filter-actions">
          <button className="filter-btn-small" onClick={selectAll}>All</button>
          <button className="filter-btn-small" onClick={selectNone}>None</button>
        </div>
      </div>
      <div className="sport-checkboxes">
        {allSports.map(sport => (
          <label key={sport} className="sport-checkbox">
            <input
              type="checkbox"
              checked={selectedSports.includes(sport)}
              onChange={() => toggleSport(sport)}
            />
            <span className="sport-name">{sport}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
