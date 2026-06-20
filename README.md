# ATV Landing

Landing de captación de leads con quiz de diagnóstico, integración a WhatsApp y dashboard de métricas.

## Stack

- **Frontend:** React + Vite + CSS Modules
- **Backend:** FastAPI + Pony ORM + PostgreSQL (Neon)

## Estructura

```
atv-landing/
  frontend/          # React + Vite
  backend/
    main.py          # Punto de entrada FastAPI
    requirements.txt
    .env.template    # Variables requeridas (sin valores)
    .env             # Local (no versionar)
    src/
      db.py
      models.py
      schemas.py
      services/
        leads.py
      controllers/
        leads.py
```

## Setup local

### Backend

```bash
cd backend
cp .env.template .env
# Completar .env con tus credenciales de Neon
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
cp .env.template .env
# Ajustar VITE_WA_NUMBER con el número de WhatsApp destino
npm install
npm run dev
```

## Variables de entorno

### backend/.env

| Variable | Descripción |
|---|---|
| `DB_HOST` | Host de Neon/Postgres |
| `DB_PORT` | Puerto (default 5432) |
| `DB_NAME` | Nombre de la base de datos |
| `DB_USER` | Usuario |
| `DB_PASSWORD` | Contraseña |
| `WA_NUMBER` | Número WhatsApp sin + (ej: 5491112345678) |

### frontend/.env

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base del backend |
| `VITE_WA_NUMBER` | Número WhatsApp destino |

## API Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/leads/` | Crear lead desde el quiz |
| `GET` | `/api/leads/` | Listar todos los leads |
| `GET` | `/api/leads/metrics` | Métricas del dashboard |
| `GET` | `/api/leads/{id}` | Lead por ID |
| `PATCH` | `/api/leads/{id}` | Marcar como contactado / agregar notas |

## Flujo del usuario

1. Llega a la landing → ve el quiz
2. Responde 4 preguntas + deja nombre, email y WhatsApp
3. El backend guarda el lead en Postgres
4. Se redirige a `/gracias` con botón a WhatsApp pre-cargado con sus respuestas
5. El equipo ATV ve el lead en el dashboard ATV Landing
