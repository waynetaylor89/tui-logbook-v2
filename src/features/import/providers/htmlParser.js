export async function parseHtmlDocumentFile(file) {
  const content = await readFileText(file);
  const parser = new DOMParser();
  const document = parser.parseFromString(content, "text/html");

  if (document.querySelector("parsererror")) {
    throw new Error("Unable to parse HTML export. Check that the file is a valid webpage export.");
  }

  return {
    content,
    document,
  };
}

function readFileText(file) {
  if (typeof file?.text === "function") {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read HTML file."));
    reader.readAsText(file);
  });
}
