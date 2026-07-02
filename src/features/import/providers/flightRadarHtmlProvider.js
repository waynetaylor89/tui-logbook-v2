import { parseHtmlDocumentFile } from "./htmlParser.js";
import { extractFlightRowsFromDocument } from "./flightParser.js";
import { normalizeHtmlFlightRows } from "./flightNormalizer.js";

export async function parseFlightRadarHtmlFile(file) {
  const extension = getExtension(file?.name || "");
  if (!extension || !["html", "htm"].includes(extension)) {
    throw new Error("Unsupported format. Upload .html or .htm FlightRadar24 webpage exports.");
  }

  const parsed = await parseHtmlDocumentFile(file);
  const extractedRows = extractFlightRowsFromDocument(parsed.document);
  const normalizedRows = normalizeHtmlFlightRows(extractedRows);
  const detection = detectFlightRadarFromHtml({
    fileName: file?.name || "",
    htmlContent: parsed.content,
    extractedRows,
  });

  return {
    fileName: file?.name || "",
    sourceFormat: "html",
    rows: normalizedRows,
    detectedFlightRadarHint: detection.detected,
    detectedFlightRadarConfidence: detection.confidence,
  };
}

function getExtension(fileName) {
  return String(fileName || "").split(".").pop().toLowerCase();
}

function detectFlightRadarFromHtml({ fileName, htmlContent, extractedRows }) {
  const content = String(htmlContent || "").toLowerCase();
  const fromName = /flightradar|fr24/i.test(String(fileName || ""));
  const fromContent = content.includes("flightradar24") || content.includes("fr24");

  const sampleRow = extractedRows?.[0] || {};
  const keys = Object.keys(sampleRow).map((key) => String(key || "").toLowerCase());
  const rowSignals = ["flight", "airline", "registration", "origin", "destination", "scheduled", "estimated"];
  const rowHits = keys.filter((key) => rowSignals.some((signal) => key.includes(signal))).length;

  const detected = fromName || fromContent || (Array.isArray(extractedRows) && extractedRows.length > 0 && rowHits >= 3);
  const confidence = Math.min(1, (fromName ? 0.4 : 0) + (fromContent ? 0.4 : 0) + Math.min(rowHits / 10, 0.4));

  return {
    detected,
    confidence,
  };
}
