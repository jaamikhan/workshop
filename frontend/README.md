# CampusPulse frontend

React + Vite event discovery frontend styled from `design/stitch_backend_deployment_configuration`.

## Run locally

```sh
npm install
npm run dev
```

The app uses `https://workshop-4heo.onrender.com` for every API request; `VITE_API_URL` is set in the local `.env.local` file. The app uses the routes listed in `Backend/Screenshot/api.jpeg` and `/api/users?role=...` to fill the role ID selector. The API screenshot is copied into `public/api-reference.jpeg` and can be opened from the page footer.

The role ID dropdown reads IDs from the backend API only; there is no manual ID entry. The backend source includes `GET /api/users?role=student|organizer|admin`. Redeploy the latest backend code so the selector can load IDs from Supabase.

## Render deployment

Create a static site with `frontend` as the root directory, `npm install && npm run build` as the build command, and `dist` as the publish directory. Set `VITE_API_URL=https://workshop-4heo.onrender.com` in the site environment if you want to override the built-in default.
