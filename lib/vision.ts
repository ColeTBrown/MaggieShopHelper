export async function imageToSearchQuery(params: {
  imageBase64: string;         // data URL base64
  hintText?: string;           // user typed hint
  category?: string;           // "clothes" | "makeup" | etc
}): Promise<string> {
  const hint = (params.hintText || "").trim();

  // ✅ Minimal viable fallback (works without AI):
  // If you want real image understanding, plug in a vision model here.
  if (hint.length > 0) {
    return `${hint} ${params.category ? params.category : ""}`.trim();
  }

  // If no hint provided, you can still attempt generic search by category
  return params.category ? `best match ${params.category}` : "best match product";
}