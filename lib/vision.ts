import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function imageToSearchQuery(params: {
  imageBase64: string; // data URL base64 like "data:image/png;base64,..."
  hintText?: string;
  category?: string;
}): Promise<string> {
  const hint = (params.hintText || "").trim();
  const category = (params.category || "").trim();

  // If no OpenAI key is set, gracefully fall back to your old behavior
  if (!process.env.OPENAI_API_KEY) {
    if (hint) return `${hint} ${category}`.trim();
    return category ? `best match ${category}` : "best match product";
  }

  // Ask vision to describe the product in a way that's good for shopping search
  const prompt = `
You are a shopping assistant.
Look at the image and output ONE short product search query (max 12 words).
Include brand only if you are confident.
Include color + item type + key details.
If it's makeup, include product type + shade/color + finish if visible.
Return ONLY the query text, no quotes, no punctuation at end.

Category hint: ${category || "unknown"}
User hint (optional): ${hint || "none"}
`.trim();

  const resp = await client.responses.create({
    // Pick a vision-capable model available in your account.
    // If this errors, tell me the error text and I’ll give the exact model name to use.
    model: "gpt-5",
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: prompt },
          { type: "input_image", image_url: params.imageBase64 },
        ],
      },
    ],
  });

  // Extract text output safely
  const text =
    resp.output
      ?.flatMap((o: any) => o.content || [])
      ?.map((c: any) => c.text)
      ?.filter(Boolean)
      ?.join(" ")
      ?.trim() || "";

  // Final fallback if the model returns nothing
  if (!text) {
    if (hint) return `${hint} ${category}`.trim();
    return category ? `best match ${category}` : "best match product";
  }

  return text;
}
