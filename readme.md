# Sahaay

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

## Quick Start (Local Setup)

1. **Clone the repository**
   ```bash
   git clone <repository_url>
   cd Sahaay
   ```

2. **Use env from the app directory**
   Next.js loads `.env` from the **`my-app`** directory (where `next dev` runs). So you need a `.env` inside `my-app`:
   - Copy the example: `cp my-app/.env.example my-app/.env`
   - If your `.env` is at the repo root, copy it to `my-app/.env` or create `my-app/.env` with at least `DATABASE_URL` and `JWT_SECRET`.

3. **Set the database URL**
   In `my-app/.env` set:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/sahaay
   JWT_SECRET=your_secure_jwt_secret_key
   ```
   Add `GOOGLE_API_KEY` and SMTP vars only if you need AI reports or email OTP.

4. **Apply migrations and run the dev server from `my-app`**
   ```bash
   cd my-app
   npm run db:migrate
   npm run dev
   ```
   Open **http://localhost:3000** (or the port shown if 3000 is in use).

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

## Deployment Monitoring & CARF Integration

Sahaay integrates with the **Change-Aware Rollback Framework (CARF)** to provide automated, risk-aware continuous deployment and runtime health surveillance:

- **Static Vector Classification**: Analyzes incoming Git commit diffs to categorize changes across code, configuration, dependency, infrastructure, data, and test vectors.
- **Dynamic Risk-Adaptive Thresholds**: Tightens or relaxes health thresholds and soak windows based on Tree-sitter AST complexity and blast radius.
- **PM2 Zero-Downtime Reloads**: Integrates with PM2 process manager for continuous application reloads and seamless automated rollback on error threshold breach.
- **Soak Window Health Probing**: Continuously evaluates application response codes, error rates, and latency during the post-deployment soak duration.

This is a hackathon project by dineshkorukonda @pavankarthikgaraga @nithinkumark
