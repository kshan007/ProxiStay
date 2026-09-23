# ProxiStay

ProxiStay is a Django REST API and React/Vite frontend for searching and booking nearby accommodation.

## Requirements

- Python 3.13+
- Node.js 18+

## Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
python manage.py runserver
```

Set a unique `DJANGO_SECRET_KEY` in `backend/.env` before using the application. Keep `.env` out of Git.

## Frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

The frontend runs at `http://localhost:5173` and expects the API at `http://127.0.0.1:8000` by default.

## Checks

```powershell
cd backend
python manage.py test api
cd ..\frontend
npm run lint
npm run build
```