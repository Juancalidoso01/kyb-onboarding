#!/usr/bin/env node
/**
 * Descarga el CSV público de Google Sheets y genera JSON en public/kyb-sheet-data/.
 * Ejecutar sin servidor: node scripts/sync-kyb-sheets.mjs
 * Útil para hosting estático o cuando /api no está disponible.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "kyb-sheet-data");

const SHEET_ID = "1tqZYs99XrnoQbLNCgH8GgoilIDTbc_ICKlbZqcS8K-w";
const GIDS = {
  actividades: "846907488",
  profesiones: "664727064",
};

function parseCsvRow(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

function isHeaderSpanishLabel(s) {
  const t = s.trim().toLowerCase();
  return t === "esp" || t === "español" || t.startsWith("español ");
}

function shouldSkipRow(cols, rowIndex) {
  const tipo = (cols[0] ?? "").trim().toLowerCase();
  const esp = (cols[1] ?? "").trim();
  if (!esp || esp.length < 2) return true;
  if (isHeaderSpanishLabel(esp)) return true;
  if (tipo === "tipo" && rowIndex <= 2) return true;
  if (esp.toLowerCase().includes("palabras para el buscador")) return true;
  return false;
}

function parseParametrizedSheetCsv(csv) {
  const text = csv.startsWith("\ufeff") ? csv.slice(1) : csv;
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const out = [];
  const seen = new Set();
  for (let i = 0; i < lines.length; i++) {
    const cols = parseCsvRow(lines[i]);
    if (cols.length < 2) continue;
    if (shouldSkipRow(cols, i)) continue;
    const label = cols[1].trim();
    if (!label || seen.has(label)) continue;
    seen.add(label);
    out.push({ value: label, label });
  }
  return out;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const [name, gid] of Object.entries(GIDS)) {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
    process.stdout.write(`Descargando ${name}… `);
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`HTTP ${res.status}`);
      process.exitCode = 1;
      continue;
    }
    const text = await res.text();
    const options = parseParametrizedSheetCsv(text);
    const outPath = path.join(OUT_DIR, `${name}.json`);
    fs.writeFileSync(outPath, JSON.stringify({ options }, null, 0), "utf8");
    console.log(`${options.length} opciones → ${path.relative(ROOT, outPath)}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
