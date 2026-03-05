"use client";

/** Extracts plain text from .txt, .doc, .docx, or .pdf (max 500KB). */
export async function extractFileText(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const maxChars = 50000;

  if (ext === "txt") {
    const s = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve((r.result as string) || "");
      r.onerror = reject;
      r.readAsText(file);
    });
    return s.substring(0, maxChars);
  }

  if (ext === "doc" || ext === "docx") {
    const mammoth = (await import("mammoth")).default;
    const buf = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
    return (value || "").substring(0, maxChars);
  }

  if (ext === "pdf") {
    const pdfjs = await import("pdfjs-dist");
    if (typeof window !== "undefined" && pdfjs.GlobalWorkerOptions) {
      pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${(pdfjs as { version?: string }).version || "4"}/build/pdf.worker.min.mjs`;
    }
    const buf = await file.arrayBuffer();
    const doc = await pdfjs.getDocument(buf).promise;
    const numPages = doc.numPages;
    const chunks: string[] = [];
    for (let i = 1; i <= numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map((it) => ("str" in it ? it.str : "")).join(" ");
      chunks.push(text);
      if (chunks.join(" ").length >= maxChars) break;
    }
    return chunks.join("\n\n").substring(0, maxChars);
  }

  return "";
}
