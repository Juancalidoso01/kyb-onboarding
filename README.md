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

## Crear el repositorio en GitHub

En este entorno no está instalado `gh` (GitHub CLI). Opciones:

### Opción A — Sitio web

1. En GitHub: **New repository** → nombre p. ej. `kyb-onboarding` → crear vacío (sin README).
2. En tu máquina:

```bash
cd /Users/juanpabloobregonjacome/Projects/kyb-onboarding
git init
git add .
git commit -m "chore: proyecto inicial KYB (Next.js + FastAPI)"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/kyb-onboarding.git
git push -u origin main
```

Sustituye `TU_USUARIO` por tu cuenta (p. ej. `Juancalidoso01`).

### Opción B — GitHub CLI

```bash
brew install gh
gh auth login
cd /Users/juanpabloobregonjacome/Projects/kyb-onboarding
git init && git add . && git commit -m "chore: proyecto inicial KYB"
gh repo create kyb-onboarding --private --source=. --push
```

## Próximos pasos de producto

- Sustituir pasos de ejemplo en `web/src/lib/kyb-steps.ts` por los campos del PDF.
- Modelo de datos y base de datos (PostgreSQL recomendado para KYB).
- Subida de documentos y política de retención.
- Auditoría y roles (compliance / ventas).
