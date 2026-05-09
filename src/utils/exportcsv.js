export const exportLogbookCSV = (history) => {
  const rows = [
    [
      "Aircraft",
      "Movement Type",
      "From Stand",
      "To Stand",
      "Date",
      "Time",
      "Notes",
    ],

    ...history.map((entry) => [
      entry.aircraft,
      entry.movementType,
      entry.fromStand,
      entry.toStand,
      entry.date,
      entry.time,
      entry.notes,
    ]),
  ];

  const csv = rows
    .map((row) => row.map((item) => `"${item}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = "aircraft-logbook.csv";
  link.click();

  URL.revokeObjectURL(url);
};