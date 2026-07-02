export async function parseJsonFile(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (Array.isArray(parsed?.flights)) {
    return parsed.flights;
  }

  if (Array.isArray(parsed?.data)) {
    return parsed.data;
  }

  throw new Error("JSON must be an array, { flights: [] }, or { data: [] }.");
}
