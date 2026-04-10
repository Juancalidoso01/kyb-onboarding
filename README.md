# Onboarding KYB

Web app (Next.js) + API (Python / FastAPI) para digitalizar el proceso **Know Your Business** respecto al formulario PDF actual.

## Estructura

| Carpeta | Rol |
|---------|-----|
| `web/` | Interfaz: flujo por pasos, validación en cliente, llamadas al API |
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

**Terminal 2 — Web**

```bash
cd web
cp env.example .env.local
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). El botón “Probar conexión con API Python” comprueba `GET /health`.

## Ver la app en internet (Vercel)

Repositorio: [github.com/Juancalidoso01/kyb-onboarding](https://github.com/Juancalidoso01/kyb-onboarding)

1. Entra en [vercel.com](https://vercel.com) → **Add New** → **Project** → importa `Juancalidoso01/kyb-onboarding`.
2. En **Root Directory**, elige **`web`** (el front está en esa carpeta, no en la raíz del repo).
3. **Framework Preset:** Next.js (detectado solo).
4. **Deploy.** Obtendrás una URL del tipo `https://kyb-onboarding-xxx.vercel.app`.

Opcional: en el proyecto Vercel → **Settings → Environment Variables**, añade `NEXT_PUBLIC_API_URL` con la URL pública de tu API cuando la tengas desplegada (si no, el formulario funciona; el botón de prueba de API seguirá apuntando a la URL por defecto o fallará hasta configurar backend).

## Próximos pasos de producto

- Refinar validaciones en `web/src/lib/kyb-steps.ts` y reglas de negocio.
- Modelo de datos y base de datos (PostgreSQL recomendado para KYB).
- Subida de documentos y política de retención.
- Auditoría y roles (compliance / ventas).
