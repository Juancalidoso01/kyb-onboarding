import { NextRequest, NextResponse } from "next/server";
import {
  buildGeoapifyAutocompleteUrl,
  type GeoapifyAddressItem,
} from "@/lib/geoapify-address";

/**
 * Proxy Geoapify: la API key vive solo en el servidor (GEOAPIFY_API_KEY).
 * El cliente llama a esta ruta; no hace falta otra credencial en el código.
 */
export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get("text")?.trim() ?? "";
  const serverKey = process.env.GEOAPIFY_API_KEY?.trim();

  if (text.length < 2) {
    return NextResponse.json({
      results: [] as GeoapifyAddressItem[],
      serverKeyConfigured: Boolean(serverKey),
    });
  }

  if (!serverKey) {
    return NextResponse.json({
      results: [] as GeoapifyAddressItem[],
      serverKeyConfigured: false,
    });
  }

  try {
    const r = await fetch(buildGeoapifyAutocompleteUrl(text, serverKey), {
      cache: "no-store",
    });
    if (!r.ok) {
      return NextResponse.json({
        results: [] as GeoapifyAddressItem[],
        serverKeyConfigured: true,
      });
    }
    const data = (await r.json()) as { results?: GeoapifyAddressItem[] };
    return NextResponse.json({
      results: Array.isArray(data.results) ? data.results : [],
      serverKeyConfigured: true,
    });
  } catch {
    return NextResponse.json({
      results: [] as GeoapifyAddressItem[],
      serverKeyConfigured: true,
    });
  }
}
