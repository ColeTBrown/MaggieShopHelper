import { NextResponse } from "next/server";
import { imageToSearchQuery } from "@/lib/vision";
import { searchGoogleShoppingViaSerpAPI } from "@/lib/shopping";

export const runtime = "nodejs"; // ensures Node runtime for server route

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const imageBase64 = String(body.imageBase64 || "");
    const hintText = String(body.hintText || "");
    const category = String(body.category || "");

    if (!imageBase64.startsWith("data:image/")) {
      return NextResponse.json({ error: "Please upload an image." }, { status: 400 });
    }

    const query = await imageToSearchQuery({ imageBase64, hintText, category });
    const results = await searchGoogleShoppingViaSerpAPI(query, 12);

    return NextResponse.json({ query, results });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}