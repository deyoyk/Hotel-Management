# Grand Horizon — Hotel Reservation & Management System

Single-hotel management platform built with Next.js (App Router), TypeScript, MongoDB (native driver), Better Auth, Tailwind CSS, Recharts, Zod and date-fns. One app serves the public site, customer dashboard, staff dashboard and admin dashboard, plus all backend APIs.

## Roles

| Role | Access |
| ---- | ------ |
| Customer | Browse, search availability, book, cancel, reviews, profile |
| Staff | Reservations, walk-in bookings, check-in, check-out, guests, rooms, housekeeping, payments |
| Admin | Everything staff can do, plus rooms, room types, staff accounts, payments, reports, activity logs, hotel settings |

## Quick start

```bash
cp .env.example .env
npm install
npm run seed
npm run dev
```

Required environment:

```text
MONGODB_URI=mongodb://127.0.0.1:27017/hotel_hrms
MONGODB_DB=hotel_hrms
BETTER_AUTH_SECRET=replace-with-a-long-random-string
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Set `MONGODB_TRANSACTIONS=off` for standalone MongoDB servers, remove it on replica sets or Atlas to use multi-document transactions.

Open `http://localhost:3000`, register an account, then promote it to admin directly in MongoDB:

```js
db.user.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

Admins create staff accounts from `/admin/staff`.

## Availability guarantee

Each booked night creates a document in `room_nights` with a unique compound index on `(roomId, date)`. Bookings are written inside a MongoDB transaction where supported, with a fallback to ordered inserts plus compensating deletes, so two guests can never hold the same room on overlapping dates. Checkout on the same day as another check-in is allowed.

## Key routes

Public: `/`, `/rooms`, `/rooms/[id]`, `/search`, `/booking/[roomId]`, `/booking/confirmation/[id]`, `/about`, `/contact`.
Customer: `/dashboard`, `/dashboard/bookings/[id]`, `/dashboard/profile`.
Staff: `/staff`, `/staff/reservations`, `/staff/check-in`, `/staff/check-out`, `/staff/walk-in`, `/staff/guests`, `/staff/rooms`, `/staff/housekeeping`.
Admin: `/admin`, `/admin/rooms`, `/admin/room-types`, `/admin/reservations`, `/admin/staff`, `/admin/housekeeping`, `/admin/payments`, `/admin/reports`, `/admin/logs`, `/admin/settings`.

APIs live under `/api`: `rooms`, `availability`, `bookings`, `housekeeping`, `guests`, `payments`, `reviews`, `staff/dashboard`, `staff/walk-in`, `admin/*`.
