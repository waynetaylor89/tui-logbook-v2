const mapAircraftLabel = (registration, aircraftTypeCode) => {
  const normalizedRegistration = registration.startsWith("G-") ? registration : `G-${registration}`;
  if (aircraftTypeCode === "737") return `${normalizedRegistration} - Boeing 737-800`;
  if (aircraftTypeCode === "787") return `${normalizedRegistration} - Boeing 787-8 Dreamliner`;
  if (aircraftTypeCode === "789") return `${normalizedRegistration} - Boeing 787-9 Dreamliner`;
  return normalizedRegistration;
};

const rows = [
  { date: "", fromStand: "31", toStand: "305L", registration: "737", typeCode: "737", notes: "" },
  { date: "", fromStand: "213", toStand: "26", registration: "787", typeCode: "787", notes: "" },
  { date: "", fromStand: "81", toStand: "214", registration: "789", typeCode: "789", notes: "" },
  { date: "", fromStand: "231L", toStand: "302L", registration: "GTAWW", typeCode: "737", notes: "" },
  { date: "", fromStand: "01", toStand: "305", registration: "GTUKT", typeCode: "737", notes: "" },
  { date: "", fromStand: "80", toStand: "203", registration: "GTUIM", typeCode: "788", notes: "" },
  { date: "", fromStand: "32", toStand: "305", registration: "GTUMM", typeCode: "", notes: "" },
  { date: "", fromStand: "231L", toStand: "303", registration: "GTUMZ", typeCode: "", notes: "" },
  { date: "", fromStand: "308L", toStand: "71", registration: "GTUOA", typeCode: "", notes: "" },
  { date: "", fromStand: "31", toStand: "109", registration: "GTUMM", typeCode: "", notes: "" },
  { date: "", fromStand: "71", toStand: "215", registration: "GTUOA", typeCode: "", notes: "Cancelled" },
  { date: "", fromStand: "231L", toStand: "113R", registration: "GTUOA", typeCode: "", notes: "" },
  { date: "", fromStand: "27", toStand: "210", registration: "GTUIM", typeCode: "", notes: "" },
  { date: "", fromStand: "231L", toStand: "215", registration: "GTUMN", typeCode: "", notes: "" },
  { date: "02.04", fromStand: "31", toStand: "307", registration: "GTUWM", typeCode: "", notes: "" },
  { date: "02.04", fromStand: "71", toStand: "207", registration: "GTUMS", typeCode: "", notes: "" },
  { date: "03.04", fromStand: "73", toStand: "213R", registration: "GTUMD", typeCode: "", notes: "" },
  { date: "03.04", fromStand: "909", toStand: "101", registration: "GTUMK", typeCode: "", notes: "" },
  { date: "04.04", fromStand: "101", toStand: "901", registration: "GTUMK", typeCode: "", notes: "" },
  { date: "04.04", fromStand: "304L", toStand: "32", registration: "GTUPC", typeCode: "", notes: "" },
  { date: "04.04", fromStand: "209L", toStand: "10", registration: "GTUMC", typeCode: "", notes: "" },
  { date: "05.04", fromStand: "306L", toStand: "24", registration: "GTUML", typeCode: "", notes: "" },
  { date: "14.04", fromStand: "101", toStand: "24", registration: "GTAWP", typeCode: "", notes: "" },
  { date: "14.04", fromStand: "214", toStand: "113", registration: "GTUPD", typeCode: "", notes: "" },
  { date: "04.05.26", fromStand: "6", toStand: "308L", registration: "GTAWU", typeCode: "", notes: "" },
];

export const importedMovementEntries = rows.map((row, index) => ({
  id: `import-2026-05-${String(index + 1).padStart(2, "0")}`,
  createdBy: "wayne",
  aircraft: mapAircraftLabel(row.registration, row.typeCode),
  airport: "MAN",
  movementType: "Tow",
  fromStand: row.fromStand,
  toStand: row.toStand,
  notes: row.notes,
  date: row.date,
  time: "",
}));

const getSignature = (entry) =>
  `${entry.createdBy}|${entry.aircraft}|${entry.fromStand}|${entry.toStand}|${entry.date}|${entry.notes}`;

export const mergeImportedHistory = (history) => {
  const base = history || {};
  const existing = base.wayne || [];
  const existingSignatures = new Set(existing.map(getSignature));

  const toAdd = importedMovementEntries.filter((entry) => !existingSignatures.has(getSignature(entry)));
  if (toAdd.length === 0) return base;

  return {
    ...base,
    wayne: [...toAdd, ...existing],
  };
};
