# LearnLingo — API Documentation

Powered by **[@redocly/cli](https://redocly.com/docs/cli/)** and **OpenAPI 3.0**.

## Directory layout

```
docs/
├── openapi/
│   ├── openapi.yaml                    ← root spec (entry point)
│   ├── components/
│   │   ├── schemas/
│   │   │   ├── common.yaml             ← Error, ObjectId
│   │   │   ├── user.yaml               ← User, Auth*, UpdateUser*
│   │   │   ├── teacher.yaml            ← Teacher, Review, Favorites*
│   │   │   └── booking.yaml            ← Booking, CreateBooking*, UpdateBooking*
│   │   ├── responses/
│   │   │   └── responses.yaml          ← Unauthorized, NotFound, BadRequest
│   │   └── parameters/
│   │       └── pagination.yaml         ← PageParam, LimitParam
│   └── paths/
│       ├── auth.yaml                   ← /api/health, /api/auth/*
│       ├── users.yaml                  ← /api/users/*
│       ├── teachers.yaml               ← /api/teachers/*
│       ├── favorites.yaml              ← /api/favorites/*
│       └── bookings.yaml               ← /api/bookings/*
└── README.md                           ← this file
```

## Available npm scripts

| Script | Command | What it does |
|---|---|---|
| `npm run docs:lint` | `redocly lint` | Validates the spec for errors and rule violations |
| `npm run docs:build` | `redocly build-docs` | Bundles everything into `docs/index.html` (standalone) |
| `npm run docs:preview` | `redocly preview-docs` | Starts a local live-reload server at **http://127.0.0.1:8080** |

## Quick start

```bash
# 1. Install dependencies (including @redocly/cli)
cd backend
npm install

# 2. Preview the docs in the browser
npm run docs:preview
# → open http://127.0.0.1:8080

# 3. Lint the spec before committing
npm run docs:lint

# 4. Build a single self-contained HTML file for deployment
npm run docs:build
# → docs/index.html
```

## Linting rules

Rules are configured in `../redocly.yaml` (backend root).  
Key rules enforced:

| Rule | Level |
|---|---|
| `operation-summary` | error |
| `operation-operationId` | error |
| `security-defined` | error |
| `no-invalid-schema-examples` | error |
| `operation-description` | warn |
| `tag-description` | warn |
| `no-unused-components` | warn |

## Deploying the docs

After `npm run docs:build` the generated `docs/index.html` is a **self-contained
single file** — no external dependencies.  Drop it on any static host
(GitHub Pages, Netlify, S3, etc.).
