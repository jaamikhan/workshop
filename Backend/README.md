# Intellipat Events API

## Deploy on Render

1. In Render, create a new **Blueprint** from this repository. Render will read `render.yaml` and use `Backend` as the service root.
2. Set `SUPABASE_URL` and `SUPABASE_SECRET_KEY` when prompted. Keep this secret key in the backend service environment only; never put it in frontend variables. `SUPABASE_SERVICE_ROLE_KEY` is also accepted for older Supabase projects. The publishable key remains a fallback for read-only/local deployments.
3. Deploy. The service starts with Gunicorn and exposes `GET /` as a basic health check.

For a manual web service, use `Backend` as the root directory, `pip install -r requirements.txt` as the build command, and `gunicorn --bind 0.0.0.0:$PORT app:app` as the start command. Set `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in the service settings.

For local development, create a `.env` file in this directory with `SUPABASE_URL` and `SUPABASE_SECRET_KEY`, then run `python app.py`.
