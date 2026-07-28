"use server";

const W3W_BASE = "https://api.what3words.com/v3";

function getApiKey(): string {
  const key = process.env.W3W_API_KEY;
  if (!key) throw new Error("W3W_API_KEY not configured");
  return key;
}

export interface W3WForwardResult {
  words: string;
  coordinates: { lat: number; lng: number };
  country: string;
  nearestPlace: string;
}

export async function forwardGeocode(words: string): Promise<W3WForwardResult | null> {
  try {
    const key = getApiKey();
    const url = `${W3W_BASE}/convert-to-coordinates?words=${encodeURIComponent(words)}&key=${key}`;
    const res = await fetch(url);
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

export interface W3WReverseResult {
  words: string;
  coordinates: { lat: number; lng: number };
  country: string;
  nearestPlace: string;
  distance: number;
}

export async function reverseGeocode(lat: number, lng: number): Promise<W3WReverseResult | null> {
  try {
    const key = getApiKey();
    const url = `${W3W_BASE}/convert-to-3wa?coordinates=${lat},${lng}&key=${key}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      words: data.words,
      coordinates: { lat: data.coordinates.lat, lng: data.coordinates.lng },
      country: data.country,
      nearestPlace: data.nearestPlace,
      distance: data.distance || 0,
    };
  } catch {
    return null;
  }
}

export interface W3WGridResult {
  words: string;
  coordinates: { lat: number; lng: number };
  square: { southwest: { lat: number; lng: number }; northeast: { lat: number; lng: number } };
}

export async function getGridSection(boundingBox: { swLat: number; swLng: number; neLat: number; neLng: number }): Promise<W3WGridResult[]> {
  try {
    const key = getApiKey();
    const { swLat, swLng, neLat, neLng } = boundingBox;
    const url = `${W3W_BASE}/grid-section?bounding-box=${swLat},${swLng},${neLat},${neLng}&key=${key}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.grid || [];
  } catch {
    return [];
  }
}

export async function isApiKeyValid(): Promise<boolean> {
  try {
    const key = process.env.W3W_API_KEY;
    if (!key) return false;
    const url = `${W3W_BASE}/convert-to-3wa?coordinates=51.5072,-0.1276&key=${key}`;
    const res = await fetch(url);
    return res.ok;
  } catch {
    return false;
  }
}
