import { NextRequest, NextResponse } from "next/server";
import { getActividadesCsvUrl, getProfesionesCsvUrl } from "@/lib/kyb-sheet-config";
import {
  FALLBACK_ACTIVIDADES,
  FALLBACK_PROFESIONES,
  parseParametrizedSheetCsv,
} from "@/lib/kyb-sheet-csv";

export const revalidate = 3600;

export async function GET(req: NextRequest) {
  const kind = req.nextUrl.searchParams.get("kind");
  const isProf = kind === "profesiones";
  const url = isProf ? getProfesionesCsvUrl() : getActividadesCsvUrl();
  const fallback = isProf ? FALLBACK_PROFESIONES : FALLBACK_ACTIVIDADES;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { Accept: "text/csv,*/*" },
    });
    if (!res.ok) {
      return NextResponse.json({ options: fallback }, { status: 200 });
    }
    const text = await res.text();
    const parsed = parseParametrizedSheetCsv(text);
    return NextResponse.json({
      options: parsed.length > 0 ? parsed : fallback,
    });
  } catch {
    return NextResponse.json({ options: fallback }, { status: 200 });
  }
}
