# Intellipat Events API

## Deploy on Render

1. In Render, create a new **Blueprint** from this repository. Render will read `render.yaml` and use `Backend` as the service root.
2. Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` when prompted. These are intentionally not stored in the Blueprint.
3. Deploy. The service starts with Gunicorn and exposes `GET /` as a basic health check.

For a manual web service, use `Backend` as the root directory, `pip install -r requirements.txt` as the build command, and `gunicorn --bind 0.0.0.0:$PORT app:app` as the start command. Set the same two environment variables in the service settings.

For local development, create a `.env` file in this directory with those two variables, then run `python app.py`.
