import { NextResponse } from "next/server";
import { nextFormReference } from "@/lib/form-reference-server";

export const runtime = "nodejs";

export async function POST() {
  const ref = nextFormReference();
  return NextResponse.json({ ref });
}
