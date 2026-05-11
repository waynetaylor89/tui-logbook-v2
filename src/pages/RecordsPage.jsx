import RecordsPanel from "../components/RecordsPanel.jsx";
import { NoRecordsEmpty, NoResultsEmpty } from "../components/EmptyState.jsx";

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
}) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Movement Records</h2>
            <div className="text-sm text-slate-500">View all saved records in one place.</div>
          </div>
          <div className="text-sm text-slate-500">
            {isAdmin ? allHistoryLength : currentUserHistoryLength} records total
          </div>
        </div>
      </div>
      
      {/* Show empty state when no records */}
      {paginatedHistory.length === 0 ? (
        searchTerm ? (
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
        paginatedHistory={paginatedHistory}
        deleteEntry={handleDeleteEntry}
        editEntry={handleEditEntry}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tuiAircraftTypes={tuiAircraftTypes}
        totalPages={totalPages}
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
    </div>
  );
}
