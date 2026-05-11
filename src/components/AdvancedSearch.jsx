import { useState, useMemo } from "react";

const AdvancedSearch = ({ 
  history, 
  fleet, 
  onSearchResults, 
  onClearSearch,
  isAdmin 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    dateRange: { start: "", end: "" },
    aircraftType: "all",
    movementType: "all",
    fromStand: "all",
    toStand: "all",
    user: "all"
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
      const userMatch = filters.user === 'all' || 
        movement.createdBy === filters.user;

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
      user: "all"
    });
    onClearSearch();
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          🔍 Advanced Search
        </h3>
        <button
          onClick={handleClear}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          Clear All
        </button>
      </div>

      {/* Text Search */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Search Text
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search aircraft, stands, notes..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {/* Date Range */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Date Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Aircraft Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Aircraft Type
          </label>
          <select
            value={filters.aircraftType}
            onChange={(e) => updateFilter('aircraftType', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Types</option>
            {filterOptions.aircraftTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Movement Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Movement Type
          </label>
          <select
            value={filters.movementType}
            onChange={(e) => updateFilter('movementType', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Types</option>
            {filterOptions.movementTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* From Stand */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            From Stand
          </label>
          <select
            value={filters.fromStand}
            onChange={(e) => updateFilter('fromStand', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Stands</option>
            {filterOptions.stands.map(stand => (
              <option key={stand} value={stand}>{stand}</option>
            ))}
          </select>
        </div>

        {/* To Stand */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            To Stand
          </label>
          <select
            value={filters.toStand}
            onChange={(e) => updateFilter('toStand', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Stands</option>
            {filterOptions.stands.map(stand => (
              <option key={stand} value={stand}>{stand}</option>
            ))}
          </select>
        </div>

        {/* User Filter (Admin Only) */}
        {isAdmin && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Created By
            </label>
            <select
              value={filters.user}
              onChange={(e) => updateFilter('user', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">All Users</option>
              {filterOptions.users.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Search Results Count */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div className="text-sm text-slate-600">
          {filteredResults.length} results found
        </div>
        <div className="space-x-2">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Clear
          </button>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
