# mami-food-order

Monorepo for the Mami Food Order application (frontend + backend).

## Project structure

- `frontend/` — React + Tailwind frontend
- `backend/` — Node.js + Express backend (API)

## Local setup

Prerequisites: Node.js (16+), npm/yarn

1. Clone the repo and change directory:

```bash
git clone git@github.com:YourUsername/mami-food-order.git
cd mami-food-order
```

2. Install and run frontend:

```bash
cd frontend
npm install
npm run dev
```

3. Install and run backend (in a separate terminal):

```bash
cd backend
npm install
npm start
```

Backend should read port from `process.env.PORT` and any required env vars (DB connection string, etc.).

## Deployment

- Frontend can be deployed to Vercel / Netlify / Cloudflare Pages. Set the root/build directory to `frontend`.
- Backend can be deployed to Render / Heroku / Cloud Run. Set the root to `backend` and ensure the start command is configured.

## Contributing

Feel free to open issues or PRs. Keep commits focused and update README with setup notes when necessary.

## License

MIT
