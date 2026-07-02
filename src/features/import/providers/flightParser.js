const FLIGHT_HEADER_HINTS = [
  "flight",
  "airline",
  "registration",
  "aircraft",
  "origin",
  "destination",
  "arrival",
  "departure",
  "scheduled",
  "estimated",
  "status",
  "terminal",
  "gate",
  "stand",
  "date",
];

export function extractFlightRowsFromDocument(document) {
  const tables = Array.from(document.querySelectorAll("table"));
  const candidates = [];

  tables.forEach((table) => {
    const rows = Array.from(table.querySelectorAll("tr"));
    if (rows.length < 2) return;

    const headerCells = rows[0].querySelectorAll("th,td");
    const headers = Array.from(headerCells).map((cell) => cleanCellText(cell.textContent));
    if (!headers.length) return;

    const headerHitCount = headers
      .map((header) => normalizeToken(header))
      .filter((token) => FLIGHT_HEADER_HINTS.some((hint) => token.includes(hint))).length;

    if (headerHitCount < 2) return;

    const extractedRows = rows.slice(1).map((row) => {
      const cells = Array.from(row.querySelectorAll("td,th")).map((cell) => cleanCellText(cell.textContent));
      const payload = {};

      headers.forEach((header, index) => {
        payload[header] = cells[index] || "";
      });

      return payload;
    });

    candidates.push({
      score: headerHitCount,
      rows: extractedRows,
    });
  });

  if (candidates.length === 0) {
    return [];
  }

  candidates.sort((a, b) => b.score - a.score);

  const mergedRows = candidates.flatMap((candidate) => candidate.rows);
  return mergedRows.filter((row) => {
    const values = Object.values(row || {}).map((value) => String(value || "").trim());
    return values.some(Boolean);
  });
}

function cleanCellText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeToken(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}
