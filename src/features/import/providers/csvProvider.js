import Papa from "papaparse";

export function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(Array.isArray(results.data) ? results.data : []),
      error: (error) => reject(error),
    });
  });
}
