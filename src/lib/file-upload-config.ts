/** Allowed file types and max size (500KB) for attachments */
export const ALLOWED_EXTENSIONS = [".txt", ".doc", ".docx", ".pdf"];
export const MAX_FILE_BYTES = 512_000; // 500KB
export const ACCEPT_ATTR = ".txt,.doc,.docx,.pdf";

export function isAllowedFile(file: File): boolean {
  const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) return false;
  if (file.size > MAX_FILE_BYTES) return false;
  return true;
}
