# Onboarding KYB

Web app (Next.js) + API (Python / FastAPI) para digitalizar el proceso **Know Your Business** respecto al formulario PDF actual.

## Estructura

| Carpeta / archivo | Rol |
|-------------------|-----|
| Raíz (`package.json`, `src/`) | Interfaz Next.js: flujo por pasos, validación en cliente, llamadas al API |
| `api/` | Backend: salud, guardado de borradores, futura persistencia y reglas |
| `docs/` | Mapeo PDF → campos (`MAPEO_PDF.md`) |

## Requisitos

- Node.js 20+
- Python 3.11+

## Desarrollo local

**Terminal 1 — API**

```bash
cd api
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Web (desde la raíz del repositorio)**

```bash
cp env.example .env.local
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). El botón “Probar conexión con API Python” comprueba `GET /health`.

## Ver la app en internet (Vercel)

Repositorio: [github.com/Juancalidoso01/kyb-onboarding](https://github.com/Juancalidoso01/kyb-onboarding)

1. Entra en [vercel.com](https://vercel.com) → **Add New** → **Project** → importa `Juancalidoso01/kyb-onboarding`.
2. **Root Directory:** déjalo **vacío** (`.`) o en **“./”** — la app Next.js está en la **raíz** del repo (`package.json` con `next`).
3. **Framework Preset:** Next.js (auto).
4. **Deploy.**

Si antes configuraste el proyecto con Root Directory `web`, en **Settings → General → Root Directory** pon **.** o elimina el valor y vuelve a desplegar.

Opcional: **Settings → Environment Variables** → `NEXT_PUBLIC_API_URL` cuando tengas la API pública.

## Próximos pasos de producto

- Refinar validaciones en `src/lib/kyb-steps.ts` y reglas de negocio.
- Modelo de datos y base de datos (PostgreSQL recomendado para KYB).
- Subida de documentos y política de retención.
- Auditoría y roles (compliance / ventas).
