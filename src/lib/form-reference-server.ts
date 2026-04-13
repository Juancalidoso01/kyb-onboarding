/** Solo para Route Handlers. Contador en memoria (se reinicia al redeploy). */
let formSeq = Math.floor(Math.random() * 900) + 100;

export function nextFormReference(): string {
  formSeq += 1;
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `PP-KYB-${y}${m}${day}-${String(formSeq).padStart(5, "0")}`;
}
