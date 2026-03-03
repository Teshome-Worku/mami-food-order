Food Order Frontend is a responsive food ordering app built with React and Tailwind CSS.

Core customer features:
- Menu browsing and add-to-cart flow
- Cart drawer + checkout form
- Order success screen with tracking credentials
- Dedicated order tracking page (`/track-order`) using order ID + tracking code

Core admin features:
- Secure login
- Order dashboard with status updates (`pending`, `preparing`, `ready`, `delivered`)

## Environment variables

- Copy `food-order-app/frontend/.env.example` to `food-order-app/frontend/.env`
- Set `VITE_API_BASE_URL` to your backend URL (example: `http://localhost:5000`)
