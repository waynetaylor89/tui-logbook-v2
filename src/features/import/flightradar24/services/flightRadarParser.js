import { parseCsvFile } from "../../providers/csvProvider.js";
import { parseJsonFile } from "../../providers/jsonProvider.js";
import { parseExcelFile } from "../../providers/excelProvider.js";
import { parseFlightRadarHtmlFile } from "../../providers/flightRadarHtmlProvider.js";

export async function parseFlightRadarFile(file) {
  const sourceFormat = getExtension(file?.name || "");

  if (!sourceFormat || !["csv", "xlsx", "xls", "json", "html", "htm"].includes(sourceFormat)) {
    throw new Error("Unsupported format. Upload CSV, XLSX, JSON, or HTML exports.");
  }

  if (sourceFormat === "html" || sourceFormat === "htm") {
    return parseFlightRadarHtmlFile(file);
  }

  let rows = [];
  if (sourceFormat === "csv") {
    rows = await parseCsvFile(file);
  } else if (sourceFormat === "xlsx" || sourceFormat === "xls") {
    rows = await parseExcelFile(file);
  } else {
    rows = await parseJsonFile(file);
  }

  return {
    fileName: file?.name || "",
    sourceFormat,
    rows: Array.isArray(rows) ? rows : [],
  };
}

function getExtension(fileName) {
  return String(fileName || "").split(".").pop().toLowerCase();
}
