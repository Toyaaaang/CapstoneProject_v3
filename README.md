# CapstoneProject_v3

This repository contains a full-stack web application with a Django backend and a Next.js frontend.

## Project Structure

```
.
├── backend/      # Django backend (APIs, business logic, static files)
├── frontend/     # Next.js frontend (UI, static assets)
├── env/          # Python virtual environment
├── package.json  # Node.js dependencies (frontend)
├── requirements.txt # Python dependencies (backend)
└── ...
```

## Backend

- **Framework:** Django
- **Location:** [`backend/`](backend/)
- **Setup:**
  1. Create a virtual environment and activate it.
  2. Install dependencies:
      ```sh
      pip install -r requirements.txt
      ```
  3. Run migrations:
      ```sh
      python backend/manage.py migrate
      ```
  4. Start the server:
      ```sh
      python backend/manage.py runserver
      ```

## Frontend

- **Framework:** Next.js (React)
- **Location:** [`frontend/`](frontend/)
- **Setup:**
  1. Install dependencies:
      ```sh
      cd frontend
      npm install
      ```
  2. Start the development server:
      ```sh
      npm run dev
      ```
  3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

- Backend code lives in [`backend/`](backend/).
- Frontend code lives in [`frontend/`](frontend/).
- Static files for the backend are in [`backend/staticfiles/`](backend/staticfiles/).

## License

See individual folders for license information.
