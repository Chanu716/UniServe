# UniServe

UniServe is a campus resource booking platform for managing classrooms, laboratories, seminar spaces, and other shared facilities without the usual spreadsheet chaos. It gives students and faculty a simple booking flow, gives coordinators approval and resource-management tools, and gives admins a centralized view of what is being used, when, and by whom.

## Why this exists

Campus bookings usually break down in the same few places: people book the same room twice, approvals live in chat threads, resource lists go stale, and nobody has a clear picture of utilization. UniServe fixes that with one system for discovery, booking, approvals, QR-based check-in, and reporting.

## What UniServe does

- Shows live campus resources with search and filtering.
- Prevents conflicting bookings before they are submitted.
- Supports role-based workflows for students, faculty, coordinators, admins, and management.
- Lets coordinators manage resources and approve or reject booking requests.
- Uses QR check-in for approved bookings.
- Surfaces dashboards and analytics for utilization and booking activity.
- Ships with a seeded SRM AP resource catalog so the app is useful immediately.

## Roles and access

- Student: create bookings, view own bookings, cancel own bookings.
- Faculty: create bookings with faculty-level priority, view own bookings, cancel own bookings.
- Coordinator: manage resources, review all bookings, approve or reject requests, check in bookings.
- Admin: full access to users, resources, bookings, and approvals.
- Management: read-only visibility into dashboards and analytics.

## Tech stack

### Frontend

- React 18
- Vite
- Material UI
- React Router
- Zustand
- Formik + Yup
- Axios
- React Toastify
- Recharts
- html5-qrcode
- DarkVeil background with OGL

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- bcryptjs password hashing
- express-validator
- Helmet, CORS, Winston, Morgan

## Project layout

```text
UniServe/
├── docs/                      # Architecture and design documents
├── src/
│   ├── backend/               # Express API, models, controllers, routes
│   ├── frontend/              # React app, pages, components, state
│   └── database/              # Database notes and schema helpers
└── tests/                     # Test assets
```

## Getting started

### Prerequisites

- Node.js 18 or newer
- MongoDB running locally or remotely
- Git

### Backend

```bash
cd src/backend
npm install
```

Create a `.env` file in `src/backend` with the required MongoDB and JWT settings, then start the server:

```bash
npm run dev
```

### Frontend

```bash
cd src/frontend
npm install
npm run dev
```

The frontend runs on Vite and the backend serves the API under `/api/v1`.

## Useful scripts

### Backend

- `npm start` - run the API in production mode.
- `npm run dev` - run the API with nodemon.
- `npm test` - run backend tests.

### Frontend

- `npm run dev` - start the Vite dev server.
- `npm run build` - build production assets.
- `npm run preview` - preview the production build.
- `npm test` - run frontend tests.
- `npm run lint` - lint the frontend code.

## API snapshot

### Authentication

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `PUT /api/v1/auth/profile`
- `PUT /api/v1/auth/change-password`

### Resources

- `GET /api/v1/resources`
- `GET /api/v1/resources/:id`
- `POST /api/v1/resources`
- `PUT /api/v1/resources/:id`
- `DELETE /api/v1/resources/:id`

### Bookings

- `GET /api/v1/bookings`
- `GET /api/v1/bookings/:id`
- `POST /api/v1/bookings`
- `GET /api/v1/bookings/available`
- `PUT /api/v1/bookings/:id/approve`
- `PUT /api/v1/bookings/:id/reject`
- `PUT /api/v1/bookings/:id/cancel`
- `POST /api/v1/bookings/:id/checkin`
- `POST /api/v1/bookings/:id/checkout`

## Documentation

- [Architecture docs](docs/)
- [Database notes](src/database/README.md)

## Notes

- The current implementation uses MongoDB, not PostgreSQL.
- The frontend includes a dark-only glassmorphic UI with a full-screen animated background.
- Resources are seeded automatically when the backend starts and the collection is empty.
- QR Scanner access is intentionally limited to students and faculty in the UI and backend.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Run the relevant build or test command.
5. Open a pull request.

## License

MIT

