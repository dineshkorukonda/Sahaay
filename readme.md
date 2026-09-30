# fileshare

Sahaay is a comprehensive healthcare companion and **Smart Health Surveillance & Early Warning** platform. It simplifies medical management, supports community health reporting, and helps detect and prevent water-borne disease outbreaks in vulnerable communities.

## Problem Statement (Smart Health Surveillance & Early Warning)

This project addresses the development of a **Smart Health Surveillance and Early Warning System** that can:

- Collect health data from local clinics, ASHA workers, and community volunteers via mobile apps or SMS.
- Use AI/ML models to detect patterns and predict potential outbreaks based on symptoms, water quality reports, and seasonal trends.
- Integrate with water testing kits or IoT sensors to monitor water source contamination (turbidity, pH, bacterial presence).
- Provide real-time alerts to district health officials and local governance bodies.
- Include a multilingual mobile interface for community reporting and awareness (including tribal languages).
- Offer dashboards for health departments to visualize hotspots, track interventions, and allocate resources.

### How Sahaay Addresses This

| Requirement | Sahaay Feature |
|-------------|----------------|
| Collect health data from community | Community posts, health records, family health, **water quality reporting** |
| AI/ML outbreak prediction | **Outbreak risk engine** (symptoms + water quality + area aggregation); AI report analysis |
| Water quality integration | **Water Quality** page: manual test kit reporting (turbidity, pH, bacterial presence) |
| Alerts for officials | **Outbreak Risk** dashboard with risk levels by area; Alert schema for future push/email |
| Multilingual / tribal languages | **Language selection**: English, Hindi, **Assamese** (NER) |
| Dashboards for health depts | **Outbreak Risk** page: hotspots, risk by area, symptom and water-fail counts |

## Key Features

-   **AI Medical Report Analysis**: Upload medical PDFs to get detailed summaries, extracted vitals, and dietary recommendations using Google Gemini AI.
-   **Outbreak Risk & Surveillance**: AI-driven early warning by area using symptom and water quality data (last 14 days).
-   **Water Quality Reporting**: Submit and view water source test results (manual kits/sensors): turbidity, pH, bacterial presence.
-   **Nearby Care Finder**: Locate hospitals, clinics, and pharmacies near you with an interactive map interface.
-   **Health & Vitals Monitoring**: Track essential health metrics like Blood Pressure, Glucose, Heart Rate, and more.
-   **Family Health Management**: Manage health records and appointments for family members in one place.
-   **Community Support**: Join specific groups (e.g., Diabetes Support, Cardiac Care) to share experiences and get advice.
-   **Multilingual**: English, Hindi, Assamese for community and tribal language support.
-   **Secure Authentication**: Robust user authentication system using JWT.

## Tech Stack

-   **Framework**: Next.js 16 (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **Database**: Neon Postgres (Drizzle ORM)
-   **AI Integration**: Google Gemini (via `google-generative-ai` SDK)
-   **Maps**: Google Maps JavaScript API
-   **PDF Processing**: `pdf-parse`, `jspdf`

## Prerequisites

Before you begin, ensure you have the following installed:
-   [Node.js](https://nodejs.org/) (v18 or higher recommended)
-   A [Neon](https://neon.tech) Postgres database

## Local development (recommended)

Run the app against a **Neon Postgres** database.

1.  **Create a Neon project**
    - Sign in at [neon.tech](https://neon.tech) and create a project.
    - Copy the connection string from the Neon dashboard.

2.  **Use env from the app directory**
    Next.js loads `.env` from the **`my-app`** directory (where `next dev` runs). So you need a `.env` inside `my-app`:
    - Copy the example: `cp my-app/.env.example my-app/.env`
    - If your `.env` is at the repo root, copy it to `my-app/.env` or create `my-app/.env` with at least `DATABASE_URL` and `JWT_SECRET`.

3.  **Set the database URL**
    In `my-app/.env` set:
    ```env
    DATABASE_URL=postgresql://user:password@ep-example.region.aws.neon.tech/neondb?sslmode=require
    JWT_SECRET=your_secure_jwt_secret_key
    ```
    Add `GOOGLE_API_KEY` and SMTP vars only if you need AI reports or email OTP.

4.  **Apply migrations and run the dev server from `my-app`**
    ```bash
    cd my-app
    npm run db:migrate
    npm run dev
    ```
    Open **http://localhost:3000** (or the port shown if 3000 is in use).

## Installation & Setup (generic)

1.  **Clone the repository**
    ```bash
    git clone <repository_url>
    cd Sahaay
    ```

2.  **Install Dependencies**
    ```bash
    cd my-app
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the **`my-app`** directory (see `my-app/.env.example`). Set your Neon connection string:
    ```env
    DATABASE_URL=postgresql://user:password@ep-example.region.aws.neon.tech/neondb?sslmode=require
    JWT_SECRET=your_secure_jwt_secret_key
    ```
    Optionally set `GOOGLE_API_KEY`, `NEXT_PUBLIC_GOOGLE_API_KEY`, and SMTP variables for AI and email. Then apply the schema with `npm run db:migrate`.

4.  **Run the Development Server**
    ```bash
    cd my-app
    npm run dev
    ```
    The application will be available at `http://localhost:3000` (or another port if 3000 is busy).

## Testing (BDD)

Sahaay uses **Behavior-Driven Development (BDD)** with Cucumber for the surveillance and water quality API tests. Feature files are written in Gherkin (Given/When/Then).

| What’s tested | Location |
|---------------|----------|
| Outbreak Risk API (all areas, by PIN, risk levels) | `features/outbreak-risk.feature` |
| Water Quality API (list, filter, submit, validation) | `features/water-quality.feature` |
| Step definitions | `features/step_definitions/api.steps.js` |

**Run BDD tests** (dev server must be running):

1. **Terminal 1** – start the app:
   ```bash
   cd my-app
   npm run dev
   ```
2. **Terminal 2** – run the tests (default: `http://localhost:3000`):
   ```bash
   cd my-app
   npm run test:bdd
   ```
   If the app runs on another port (e.g. 3002), set the base URL:
   ```bash
   BASE_URL=http://localhost:3002 npm run test:bdd
   ```

**Expected result:** `7 scenarios (7 passed)`, `33 steps (33 passed)`.

This is a hackathon project by dineshkorukonda @pavankarthikgaraga @nithinkumark
