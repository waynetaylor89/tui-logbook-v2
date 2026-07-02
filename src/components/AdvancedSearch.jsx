import { useState, useMemo } from "react";

const AdvancedSearch = ({ 
  history, 
  fleet, 
  onSearchResults, 
  onClearSearch
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    dateRange: { start: "", end: "" },
    aircraftType: "all",
    movementType: "all",
    fromStand: "all",
    toStand: "all",
  });

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const allMovements = Object.values(history).flat();
    
    const aircraftTypes = [...new Set(
      allMovements.map(m => m.aircraft?.split(' - ')[1] || 'Unknown')
    )].sort();
    
    const movementTypes = [...new Set(
      allMovements.map(m => m.movementType)
    )].sort();
    
    const stands = [...new Set(
      allMovements.flatMap(m => [m.fromStand, m.toStand])
    )].sort();
    
    const users = [...new Set(
      allMovements.map(m => m.createdBy)
    )].sort();
    
    return { aircraftTypes, movementTypes, stands, users };
  }, [history]);

  // Filter and search logic
  const filteredResults = useMemo(() => {
    if (!searchTerm && Object.values(filters).every(v => 
      typeof v === 'string' ? v === 'all' || v === '' : 
      typeof v === 'object' ? (!v.start && !v.end) : false
    )) {
      return [];
    }

    const allMovements = Object.values(history).flat();
    
    return allMovements.filter(movement => {
      // Text search
      const textMatch = !searchTerm || [
        movement.aircraft,
        movement.fromStand,
        movement.toStand,
        movement.notes,
        movement.date,
        movement.time,
        movement.createdBy
      ].some(field => 
        field?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Date range filter
      const dateMatch = (!filters.dateRange.start || movement.date >= filters.dateRange.start) &&
                       (!filters.dateRange.end || movement.date <= filters.dateRange.end);

      // Aircraft type filter
      const aircraftTypeMatch = filters.aircraftType === 'all' || 
        movement.aircraft?.includes(filters.aircraftType);

      // Movement type filter
      const movementTypeMatch = filters.movementType === 'all' || 
        movement.movementType === filters.movementType;

      // Stand filters
      const fromStandMatch = filters.fromStand === 'all' || 
        movement.fromStand === filters.fromStand;
      const toStandMatch = filters.toStand === 'all' || 
        movement.toStand === filters.toStand;

      // User filter
      const userMatch = true;

      return textMatch && dateMatch && aircraftTypeMatch && 
             movementTypeMatch && fromStandMatch && toStandMatch && userMatch;
    });
  }, [history, searchTerm, filters]);

  const handleSearch = () => {
    onSearchResults(filteredResults);
  };

  const handleClear = () => {
    setSearchTerm("");
    setFilters({
      dateRange: { start: "", end: "" },
      aircraftType: "all",
      movementType: "all",
      fromStand: "all",
      toStand: "all",
    });
    onClearSearch();
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="ops-panel space-y-4 rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-100">
          Advanced Search
        </h3>
        <button
          onClick={handleClear}
          className="text-sm text-slate-400 hover:text-slate-200"
        >
          Clear All
        </button>
      </div>

      {/* Text Search */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">
          Search Text
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search aircraft, stands, notes..."
          className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />
      </div>

      {/* Date Range */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">
          Date Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })}
            className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100"
          />
          <input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value })}
            className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100"
          />
        </div>
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Aircraft Type */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Aircraft Type
          </label>
          <select
            value={filters.aircraftType}
            onChange={(e) => updateFilter('aircraftType', e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100"
          >
            <option value="all">All Types</option>
            {filterOptions.aircraftTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Movement Type */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Movement Type
          </label>
          <select
            value={filters.movementType}
            onChange={(e) => updateFilter('movementType', e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100"
          >
            <option value="all">All Types</option>
            {filterOptions.movementTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* From Stand */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            From Stand
          </label>
          <select
            value={filters.fromStand}
            onChange={(e) => updateFilter('fromStand', e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100"
          >
            <option value="all">All Stands</option>
            {filterOptions.stands.map(stand => (
              <option key={stand} value={stand}>{stand}</option>
            ))}
          </select>
        </div>

        {/* To Stand */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            To Stand
          </label>
          <select
            value={filters.toStand}
            onChange={(e) => updateFilter('toStand', e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100"
          >
            <option value="all">All Stands</option>
            {filterOptions.stands.map(stand => (
              <option key={stand} value={stand}>{stand}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Results Count */}
      <div className="flex items-center justify-between border-t border-slate-700 pt-4">
        <div className="text-sm text-slate-400">
          {filteredResults.length} results found
        </div>
        <div className="space-x-2">
          <button
            onClick={handleClear}
            className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
          >
            Clear
          </button>
          <button
            onClick={handleSearch}
            className="rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-500"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
