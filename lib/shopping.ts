type ShoppingResult = {
  title: string;
  link: string;
  source?: string;
  price?: number;       // numeric if parsed
  priceText?: string;   // raw
  thumbnail?: string;
};

function parsePriceToNumber(priceText?: string): number | undefined {
  if (!priceText) return undefined;
  // Handles things like "$39.99" or "39.99"
  const m = priceText.replace(/,/g, "").match(/(\d+(\.\d+)?)/);
  return m ? Number(m[1]) : undefined;
}

export async function searchGoogleShoppingViaSerpAPI(query: string, max = 12): Promise<ShoppingResult[]> {
  const key = process.env.SERPAPI_KEY;
  if (!key) throw new Error("Missing SERPAPI_KEY in environment variables.");

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_shopping");
  url.searchParams.set("q", query);
  url.searchParams.set("api_key", key);
  url.searchParams.set("gl", "us");
  url.searchParams.set("hl", "en");

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SerpAPI error: ${res.status} ${text}`);
  }

  const data = await res.json();

  const items = (data.shopping_results || []).slice(0, max).map((x: any) => {
    const priceText = x.price || x.extracted_price?.toString();
    const price = x.extracted_price ?? parsePriceToNumber(priceText);
    return {
      title: x.title,
      link: x.link,
      source: x.source,
      priceText: x.price,
      price,
      thumbnail: x.thumbnail
    } as ShoppingResult;
  });

  // Sort cheapest first (unknown prices go last)
  items.sort((a: any, b: any) => {
    const ap = typeof a.price === "number" ? a.price : Number.POSITIVE_INFINITY;
    const bp = typeof b.price === "number" ? b.price : Number.POSITIVE_INFINITY;
    return ap - bp;
  });

  return items;
}