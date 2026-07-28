import { NextResponse } from "next/server";
import { validateApiKey, checkScope } from "@/lib/logistics/api-auth";
import { validateW3WAddress } from "@/lib/logistics/what3words";

export async function POST(request: Request) {
  const auth = await validateApiKey(request.headers.get("Authorization"));
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!checkScope(auth, "w3w:read") && !checkScope(auth, "*")) {
    return NextResponse.json({ error: "Insufficient permissions. Required scope: w3w:read" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { words, lat, lng } = body;

    if (words) {
      if (!validateW3WAddress(words)) {
        return NextResponse.json({ error: "Invalid What3Words format (expected: word.word.word)" }, { status: 400 });
      }

      const resolved = await fetchWhat3WordsForward(words);
      if (!resolved) {
        return NextResponse.json({ error: "Failed to resolve What3Words address" }, { status: 422 });
      }

      return NextResponse.json({ data: resolved });
    }

    if (lat !== undefined && lng !== undefined) {
      const resolved = await fetchWhat3WordsReverse(Number(lat), Number(lng));
      if (!resolved) {
        return NextResponse.json({ error: "Failed to reverse geocode coordinates" }, { status: 422 });
      }

      return NextResponse.json({ data: resolved });
    }

    return NextResponse.json({ error: "Provide either 'words' for forward geocode or 'lat'/'lng' for reverse geocode" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to process What3Words request" }, { status: 500 });
  }
}

async function fetchWhat3WordsForward(words: string) {
  const apiKey = process.env.W3W_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`https://api.what3words.com/v3/convert-to-coordinates?words=${encodeURIComponent(words)}&key=${apiKey}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      words: data.words,
      coordinates: { lat: data.coordinates.lat, lng: data.coordinates.lng },
      country: data.country,
      nearestPlace: data.nearestPlace,
    };
  } catch {
    return null;
  }
}

async function fetchWhat3WordsReverse(lat: number, lng: number) {
  const apiKey = process.env.W3W_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`https://api.what3words.com/v3/convert-to-3wa?coordinates=${lat},${lng}&key=${apiKey}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      words: data.words,
      coordinates: { lat: data.coordinates.lat, lng: data.coordinates.lng },
      country: data.country,
      nearestPlace: data.nearestPlace,
    };
  } catch {
    return null;
  }
}
