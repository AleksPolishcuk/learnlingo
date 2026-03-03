# LearnLingo — Full-Stack Language Tutoring Platform

## Project Structure

```
learnlingo/
├── backend/          # Node.js + Express + MongoDB API
└── frontend/         # Next.js 14 + TypeScript + CSS Modules
```

---

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in your MONGO_URI and JWT_SECRET
npm run seed            # seed 30 teachers into MongoDB
npm run dev             # dev server on http://localhost:5000
```

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | — | Register (client or business) |
| POST | /api/auth/login | — | Login → returns JWT |
| GET | /api/auth/me | ✓ | Get current user |
| POST | /api/auth/logout | ✓ | Logout |
| GET | /api/teachers | — | List teachers (filter + paginate) |
| GET | /api/teachers/:id | — | Single teacher |
| GET | /api/favorites | ✓ | Get user's favorites |
| POST | /api/favorites/:id | ✓ | Add to favorites |
| DELETE | /api/favorites/:id | ✓ | Remove from favorites |
| GET | /api/bookings | ✓ | Get user's bookings |
| POST | /api/bookings | ✓ | Create booking |
| PATCH | /api/bookings/:id | ✓ | Update booking |
| DELETE | /api/bookings/:id | ✓ | Cancel booking |
| GET | /api/users | ✓ | List users |
| PUT | /api/users/me | ✓ | Update own profile |
| DELETE | /api/users/me | ✓ | Delete own account |

### Query params for GET /api/teachers
- `language` — filter by language
- `level` — filter by level  
- `price` — max price per hour
- `page` — page number (default 1)
- `limit` — items per page (default 4)

---

## Frontend Setup

```bash
cd frontend
npm install
# .env.local is already set to http://localhost:5000/api
npm run dev             # Next.js on http://localhost:3000
```

### Pages

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Home page with hero + stats |
| `/teachers` | Public | Filtered, paginated teacher list |
| `/favorites` | Private | Saved teacher cards |
| `/reservations` | Private | Booked trial lessons |

### Features
- ✅ JWT auth stored in localStorage, rehydrated on page load
- ✅ Register with role toggle (Client / Business)
- ✅ Business role shows language multi-select
- ✅ Heart button — unauthorized → auth warning modal
- ✅ Heart button — authorized → optimistic toggle with server sync
- ✅ Favorites persisted server-side + localStorage
- ✅ Read more / collapse on teacher cards
- ✅ Book trial lesson modal with full validation
- ✅ Avatar with initials replaces Login/Register buttons
- ✅ Profile edit modal (different fields per role)
- ✅ Account deletion from Danger Zone
- ✅ Toast notifications for all actions
- ✅ Esc + backdrop close on all modals
- ✅ CSS Modules throughout (no Tailwind, no styled-components)
