import { useState } from "react";
import RecordsPanel from "../components/RecordsPanel.jsx";
import { NoRecordsEmpty, NoResultsEmpty } from "../components/EmptyState.jsx";
import AdvancedSearch from "../components/AdvancedSearch.jsx";
import ExportOptions from "../components/ExportOptions.jsx";

export default function RecordsPage({
  isAdmin,
  currentUser,
  allHistoryLength,
  currentUserHistoryLength,
  paginatedHistory,
  handleDeleteEntry,
  handleEditEntry,
  searchTerm,
  setSearchTerm,
  activeTab,
  setActiveTab,
  tuiAircraftTypes,
  totalPages,
  currentPage,
  setCurrentPage,
  typeFilteredHistory,
  exportLogbook,
  selectedUser,
  setSelectedUser,
  userOptions,
  stats,
  history,
  fleet,
}) {
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isAdvancedSearchActive, setIsAdvancedSearchActive] = useState(false);

  const handleAdvancedSearch = (results) => {
    setSearchResults(results);
    setIsAdvancedSearchActive(true);
    setCurrentPage(1);
  };

  const handleClearAdvancedSearch = () => {
    setSearchResults([]);
    setIsAdvancedSearchActive(false);
    setSearchTerm("");
  };

  const displayHistory = isAdvancedSearchActive ? searchResults : paginatedHistory;
  const displayTotal = isAdvancedSearchActive ? searchResults.length : 
    (isAdmin ? allHistoryLength : currentUserHistoryLength);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              📋 Movement Records
            </h2>
            <div className="text-sm text-slate-500">View all saved records in one place.</div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className="px-3 py-1 text-sm bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200"
            >
              {showAdvancedSearch ? 'Hide' : 'Show'} Advanced Search
            </button>
            <div className="text-sm text-slate-500">
              {displayTotal} records total
              {isAdvancedSearchActive && ' (filtered)'}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Search Panel */}
      {showAdvancedSearch && (
        <AdvancedSearch
          history={history}
          fleet={fleet}
          onSearchResults={handleAdvancedSearch}
          onClearSearch={handleClearAdvancedSearch}
          isAdmin={isAdmin}
        />
      )}
      
      {/* Show empty state when no records */}
      {displayHistory.length === 0 ? (
        isAdvancedSearchActive ? (
          <NoResultsEmpty 
            searchTerm="Advanced Search"
            onClearSearch={handleClearAdvancedSearch}
          />
        ) : searchTerm ? (
          <NoResultsEmpty 
            searchTerm={searchTerm}
            onClearSearch={() => setSearchTerm("")}
          />
        ) : (
          <NoRecordsEmpty 
            onAddMovement={() => window.location.href = "/movements"}
          />
        )
      ) : (
        <RecordsPanel
          paginatedHistory={displayHistory}
          deleteEntry={handleDeleteEntry}
          editEntry={handleEditEntry}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tuiAircraftTypes={tuiAircraftTypes}
          totalPages={Math.ceil(displayHistory.length / 10)}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          typeFilteredHistory={typeFilteredHistory}
          exportLogbook={exportLogbook}
          isAdmin={isAdmin}
          currentUser={currentUser}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          userOptions={userOptions}
          stats={stats}
        />
      )}
      
      {/* Export Options */}
      <ExportOptions 
        data={displayHistory}
        isAdmin={isAdmin}
        title="Movement Records"
        onExportComplete={(type) => {
          console.log(`Export completed: ${type}`);
        }}
      />
    </div>
  );
}
