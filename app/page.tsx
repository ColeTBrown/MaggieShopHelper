"use client";

import { useMemo, useState } from "react";

type Result = {
  title: string;
  link: string;
  source?: string;
  price?: number;
  priceText?: string;
  thumbnail?: string;
};

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [hintText, setHintText] = useState<string>("");
  const [category, setCategory] = useState<string>("clothes");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState<string>("");

  const canSearch = useMemo(() => !!preview && !loading, [preview, loading]);

  function readFileAsDataURL(f: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result || ""));
      r.onerror = reject;
      r.readAsDataURL(f);
    });
  }

  async function onPickFile(f: File | null) {
    setError("");
    setQuery("");
    setResults([]);
    setFile(f);

    if (!f) {
      setPreview("");
      return;
    }
    const url = await readFileAsDataURL(f);
    setPreview(url);
  }

  async function onSearch() {
    setError("");
    setLoading(true);
    setResults([]);
    setQuery("");

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: preview,
          hintText,
          category,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Search failed");

      setQuery(data.query);
      setResults(data.results || []);
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card">
        {/* ✅ New Header */}
        <div className="h1">Deal Finder</div>
        <div className="small" style={{ marginTop: 4 }}>
          Inspired by Maggie Lewinsky
        </div>

        <p className="p" style={{ marginTop: 12 }}>
          Upload a photo of something you want (clothes/makeup/etc) and get the
          cheapest matches online.
        </p>

        <div className="row">
          <input
            className="input"
            type="file"
            accept="image/*"
            onChange={(e) => onPickFile(e.target.files?.[0] || null)}
          />

          <select
            className="select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="clothes">Clothes</option>
            <option value="makeup">Makeup</option>
            <option value="shoes">Shoes</option>
            <option value="bags">Bags</option>
            <option value="skincare">Skincare</option>
          </select>

          <input
            className="input"
            placeholder='Optional: "pink corset top", "rare beauty blush shade", etc.'
            value={hintText}
            onChange={(e) => setHintText(e.target.value)}
            style={{ flex: 1, minWidth: 260 }}
          />

          <button className="btn" disabled={!canSearch} onClick={onSearch}>
            {loading ? "Searching..." : "Find cheapest"}
          </button>
        </div>

        {preview && (
          <>
            <hr className="hr" />
            <div className="row">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="preview" className="thumb" />
              <span className="badge">Tip: add a hint for best accuracy</span>
            </div>
          </>
        )}

        {error && (
          <>
            <hr className="hr" />
            <div
              className="badge"
              style={{
                borderColor: "rgba(255,98,176,0.55)",
                color: "#ffd0e7",
              }}
            >
              {error}
            </div>
          </>
        )}

        {query && (
          <>
            <hr className="hr" />
            <div className="small">Search query used:</div>
            <div className="badge">{query}</div>
          </>
        )}
      </div>

      {results.length > 0 && (
        <div className="grid">
          {results.map((r, idx) => (
            <div key={idx} className="card">
              <div className="item">
                {r.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="thumb" src={r.thumbnail} alt="" />
                ) : (
                  <div className="thumb" />
                )}

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>
                    {r.title}
                  </div>

                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <div className="price">
                      {typeof r.price === "number"
                        ? `$${r.price.toFixed(2)}`
                        : r.priceText || "Price unknown"}
                    </div>
                    {r.source && <div className="badge">{r.source}</div>}
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <a
                      className="badge"
                      href={r.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open listing →
                    </a>
                  </div>

                  <div className="small" style={{ marginTop: 10 }}>
                    Ranked by cheapest (unknown prices go last).
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="small" style={{ marginTop: 18 }}>
        Next upgrade: plug in real image understanding (vision model) so users
        don’t need to type hints.
      </div>
    </div>
  );
}
