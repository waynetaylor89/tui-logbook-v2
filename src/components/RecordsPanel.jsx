import { useState } from "react";

export default function RecordsPanel({
  paginatedHistory,
  deleteEntry,
  editEntry,
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
  isAdmin,
  currentUser,
  selectedUser,
  setSelectedUser,
  userOptions,
  stats,
}) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({
    aircraft: "",
    movementType: "",
    fromStand: "",
    toStand: "",
    date: "",
    time: "",
    notes: "",
  });

  const startEditing = (item) => {
    setEditingId(item.id);
    setDraft({
      aircraft: item.aircraft || "",
      movementType: item.movementType || "",
      fromStand: item.fromStand || "",
      toStand: item.toStand || "",
      date: item.date || "",
      time: item.time || "",
      notes: item.notes || "",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEdit = (item) => {
    const ok = editEntry(item.id, item.createdBy, {
      aircraft: draft.aircraft.trim(),
      movementType: draft.movementType.trim(),
      fromStand: draft.fromStand.trim().toUpperCase(),
      toStand: draft.toStand.trim().toUpperCase(),
      date: draft.date.trim(),
      time: draft.time.trim(),
      notes: draft.notes.trim(),
    });
    if (ok) setEditingId(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">

      <div className="flex flex-col gap-4 mb-4">

  <div className="flex justify-between items-center flex-wrap gap-3">
  <h2 className="text-2xl font-bold text-slate-800">
    Movement Records
  </h2>
  <button
    onClick={exportLogbook}
    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold"
  >
    Export CSV
  </button>
</div>

      {isAdmin && (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-600">Filter by user</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="rounded-xl border px-4 py-2 bg-white"
            >
              {userOptions.map((user) => (
                <option key={user} value={user}>
                  {user === "ALL_USERS" ? "All users" : user}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {stats.topUsers.map(([user, count]) => (
              <div key={user} className="rounded-2xl border p-3 bg-slate-50">
                <div className="text-xs uppercase text-slate-500">{user}</div>
                <div className="text-xl font-semibold text-slate-800">{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

        {/* Aircraft Type Tabs */}
        <div className="flex gap-2 flex-wrap">

          <button
            onClick={() => {
              setActiveTab("ALL");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl font-semibold ${
              activeTab === "ALL"
                ? "bg-blue-600 text-white"
                : "bg-slate-100"
            }`}
          >
            All
          </button>

          {tuiAircraftTypes.map((type) => (
            <button
              key={type}
              onClick={() => {
                setActiveTab(type);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl font-semibold ${
                activeTab === type
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100"
              }`}
            >
              {type}
            </button>
          ))}

        </div>

        {/* Search */}
        <input
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search records..."
          className="w-full border rounded-xl px-4 py-3 bg-slate-50"
        />

      </div>

      {/* Records */}
      <div className="space-y-3 max-h-[700px] overflow-y-auto">

        {paginatedHistory.length === 0 && (
          <div className="text-center text-slate-500 py-10">
            No movement records found.
          </div>
        )}

        {paginatedHistory.map((item) => {
          const canModify = isAdmin || item.createdBy === currentUser;
          const editedLabel =
            item.updatedAt && item.updatedBy
              ? `Edited by ${item.updatedBy} on ${new Date(item.updatedAt).toLocaleString()}`
              : null;

          return (
            <div
              key={item.id}
              className="border rounded-xl p-4 bg-slate-50"
            >

              <div className="flex justify-between gap-3">

                <div>
                  <div className="font-bold text-slate-800">
                    {item.aircraft}
                  </div>

                  <div className="text-sm text-blue-600 font-medium">
                    {item.movementType}
                  </div>

                  <div className="text-sm text-slate-500">
                    {item.date} • {item.time}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-slate-500">
                    Stand Move
                  </div>

                  <div className="font-semibold">
                    {item.fromStand} → {item.toStand}
                  </div>
                </div>

              </div>

              {item.notes && (
                <div className="mt-3 text-sm text-slate-700 bg-white rounded-lg p-3 border">
                  {item.notes}
                </div>
              )}

              {item.createdBy && (
                <div className="mt-3 text-sm text-slate-500">
                  Logged by: {item.createdBy}
                </div>
              )}

              {editedLabel && (
                <div className="mt-1 text-xs font-medium text-amber-700 bg-amber-100 inline-block px-2 py-1 rounded">
                  {editedLabel}
                </div>
              )}

              {editingId === item.id ? (
                <div className="mt-3 space-y-2">
                  <input
                    value={draft.aircraft}
                    onChange={(e) => setDraft((prev) => ({ ...prev, aircraft: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 bg-white"
                    placeholder="Aircraft"
                  />
                  <input
                    value={draft.movementType}
                    onChange={(e) => setDraft((prev) => ({ ...prev, movementType: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 bg-white"
                    placeholder="Movement type"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={draft.fromStand}
                      onChange={(e) => setDraft((prev) => ({ ...prev, fromStand: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 bg-white"
                      placeholder="From stand"
                    />
                    <input
                      value={draft.toStand}
                      onChange={(e) => setDraft((prev) => ({ ...prev, toStand: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 bg-white"
                      placeholder="To stand"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={draft.date}
                      onChange={(e) => setDraft((prev) => ({ ...prev, date: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 bg-white"
                      placeholder="Date"
                    />
                    <input
                      value={draft.time}
                      onChange={(e) => setDraft((prev) => ({ ...prev, time: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 bg-white"
                      placeholder="Time"
                    />
                  </div>
                  <textarea
                    value={draft.notes}
                    onChange={(e) => setDraft((prev) => ({ ...prev, notes: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 bg-white resize-none"
                    rows={2}
                    placeholder="Notes"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => saveEdit(item)}
                      className="bg-blue-600 text-white py-2 rounded-lg font-semibold"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="bg-slate-200 text-slate-800 py-2 rounded-lg font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : canModify ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => startEditing(item)}
                    className="bg-amber-500 text-white py-2 rounded-lg font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteEntry(item.id, item.createdBy)}
                    className="bg-red-500 text-white py-2 rounded-lg font-semibold"
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <div className="mt-3 text-xs text-slate-500 italic">
                  View only - only the record owner or admin can edit/delete.
                </div>
              )}

            </div>
          );
        })}

      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-4 flex-wrap">

        <button
          onClick={() =>
            setCurrentPage((prev) =>
              Math.max(prev - 1, 1)
            )
          }
          className="px-4 py-2 rounded-xl border bg-white"
        >
          Previous
        </button>

        {Array.from(
          { length: totalPages },
          (_, i) => i + 1
        ).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-4 py-2 rounded-xl font-semibold ${
              currentPage === page
                ? "bg-blue-600 text-white"
                : "bg-white border"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(prev + 1, totalPages)
            )
          }
          className="px-4 py-2 rounded-xl border bg-white"
        >
          Next
        </button>

      </div>

    </div>
  );
}