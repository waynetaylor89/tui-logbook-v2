export default function RecordsPanel({
  paginatedHistory,
  deleteEntry,
  searchTerm,
  setSearchTerm,
  activeTab,
  setActiveTab,
  tuiAircraftTypes,
  totalPages,
  currentPage,
  setCurrentPage,
  typeFilteredHistory,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">

      <div className="flex flex-col gap-4 mb-4">

  <div className="flex justify-between items-center flex-wrap gap-3">
  <h2 className="text-2xl font-bold text-slate-800">
    Movement Records
  </h2>
</div>

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

          const realIndex = typeFilteredHistory.findIndex(
            (entry) =>
              entry.date === item.date &&
              entry.time === item.time &&
              entry.aircraft === item.aircraft
          );

          return (
            <div
              key={`${item.aircraft}-${item.date}-${item.time}`}
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

              <button
                onClick={() => deleteEntry(realIndex)}
                className="w-full mt-3 bg-red-500 text-white py-2 rounded-lg font-semibold"
              >
                Delete
              </button>

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