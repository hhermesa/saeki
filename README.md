# Saeki 3D Parts Ordering Portal

This is my full-stack demonstration project for a 3D parts ordering workflow, built as part of a technical assignment. It showcases a multistep wizard interface, file uploads, material configuration, payment options, and admin question management.

---

## 🔗 Live Demo

* **Frontend (Next.js + Vercel)**
  [https://saeki-web.vercel.app](https://saeki-web.vercel.app)
* **API (Express + Render)** (no default /GET, so the page will show nothing)
  [https://saeki.onrender.com](https://saeki.onrender.com)

---

## 🛠️ Features & Implementation

### 1. File Upload & Preview

* **Drag & drop** or click-to-select IGES/.STEP files.
* **Server-side storage:** Express forwards files to BunnyCDN (via its REST API).
* **Upload feedback:** Buttons disable/turn green on success, errors shown inline.

### 2. Material Configuration

* **Materials** fetched from `/materials` via a custom `useMaterials` hook.
* **Selector UI:** Grid of cards—click to choose—no dropdowns or external libs.

### 3. Order Wizard

* **Three steps:**

    1. **UploadStep**—file uploader
    2. **ConfigureStep**—choose material per part
    3. **CheckoutStep**—customer info + payment
* **Stepper bar** remains sticky, shows completed (teal), active (coral), upcoming (gray).
* **Validation** centralized in `lib/validation.ts` (unit-tested).

### 4. Customer & Payment

* **CustomerInfoSection** collects name/email/company.
* **PaymentSection** toggles between:

    * **Credit Card** (number, holder, CVV)
    * **Purchase Order** (PDF upload)
* **Confirmation modal** before final submission.

### 5. Chat & Admin Q\&A

* **ChatWidget** on the Thank-You page polls `/orders/:id/questions` every 8 s.
* **Admin UI** at `/admin/questions` to view/respond (no auth).
* **Persistence** via PostgreSQL under the hood.

---

## 📦 Monorepo Structure

```
/
├─ packages/
│  ├─ api/       ← Express + PostgreSQL
│  └─ web/       ← Next.js + React + Tailwind
├─ pnpm-workspace.yaml
└─ README.md
```

---

## 🚀 Local Setup

1. **Clone & bootstrap**

   ```bash
   git clone https://github.com/your-org/saeki.git
   cd saeki
   pnpm install
   ```

2. **Backend** (`packages/api`)

   ```bash
   cd packages/api
   pnpm install
   # create .env with DATABASE_URL, BUNNY_API_KEY, BUNNY_STORAGE_ZONE, BUNNY_PULL_ZONE
   pnpm run dev
   ```

3. **Frontend** (`packages/web`)

   ```bash
   cd ../web
   pnpm install
   # create .env with NEXT_PUBLIC_API_URL=http://localhost:4000
   pnpm run dev
   ```

4. **Browse**

    * Frontend: [http://localhost:3000](http://localhost:3000)
    * API health: [http://localhost:4000/](http://localhost:4000)

---

## 🧪 Testing

### Smoke End-to-End Test (Playwright)

A quick “smoke” test that runs through the core happy path (upload → configure → checkout → confirm → thank‑you) using Playwright. Don't forget that you need to have web and api up and running locally.

```bash
cd packages/web
pnpm exec playwright test  # headless smoke E2E suite
# or run with UI to observe the browser:
pnpm exec playwright test --headed
```

> **Tip:** This suite exercises the full UI flow in a real browser. It should pass within 30 seconds on a healthy local or CI environment.

### Component & Unit Tests (Jest)

These cover smaller slices:

* **Unit tests** for pure functions (e.g. `validateOrder` logic).
* **Component tests** for UI pieces (e.g. `Stepper` renders correct classes and labels).

```bash
cd packages/web
pnpm test         # runs all Jest suites (unit + component)
pnpm test:watch   # rerun on file changes
```

### 🧪 API & Integration Tests (Jest + Supertest)

These tests live in `packages/api` and verify your Express routes and business logic end-to-end (in memory):

- **Integration tests** for each REST endpoint
    - e.g.
        - `POST /orders` returns `400` on invalid payload
    - located under `src/__tests__/*.test.ts`

**Run them with:**

```bash
cd packages/api
pnpm test       # runs Jest against your API code
pnpm test --watch  # rerun on changes
```


#### Available test scripts (in `packages/web/package.json`)

```jsonc
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",

    // Jest component & unit tests
    "test": "jest --config jest.config.ts",
    "test:watch": "jest --watch --config jest.config.ts",

    // Playwright smoke E2E test
    "e2e": "playwright test",
    "e2e:headed": "playwright test --headed"
  }
}
```


---

## 📤 Deployment

* **Frontend**: Vercel (auto-deploy from GitHub, `packages/web`).
* **Backend**: Render (auto-deploy from GitHub, `packages/api`, build=`pnpm run build`, start=`pnpm start`).
* **Env vars** set in respective dashboards for API URLs, BunnyCDN keys, CORS origins.

---

## 💡 Implementation Notes

* **Local state** with React hooks; in prod you might swap to a state machine.
* **Separation of concerns**: Each wizard step is its own component under `components/wizardSteps/`.
* **TypeScript** end-to-end: Frontend, backend, and tests.
* **TailwindCSS** for a rapid, responsive UI.
* **Error handling** surfaces both client-side validation and backend errors distinctly.

---

> *Note: The free-tier Render server will sleep — the very first request can take \~30–50 s.*

