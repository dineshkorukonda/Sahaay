# Sahaay Local Setup Guide

Follow these steps to run the Sahaay application on your local machine.

## Prerequisites
1. **Node.js** (v20 or higher recommended)
2. A **Neon Postgres** database ([neon.tech](https://neon.tech))
3. A **Google Gemini API Key**
4. A **Google Maps API Key** (with Maps JavaScript API and Places API enabled)

## Step 1: Clone and Install
```bash
git clone https://github.com/dineshkorukonda/Sahaay.git
cd Sahaay/my-app
npm install
```

## Step 2: Environment Variables
Create a file named `.env` in the `my-app` directory and add the following keys:

```env
# Database — Neon connection string (Dashboard → Connect)
DATABASE_URL="postgresql://user:password@ep-example.region.aws.neon.tech/neondb?sslmode=require"

# AI & Maps
GOOGLE_API_KEY="your_gemini_api_key_here"
NEXT_PUBLIC_GOOGLE_API_KEY="your_google_maps_api_key_here"

# Authentication
JWT_SECRET="your_secure_random_string_here"
```

## Step 3: Apply the database schema
```bash
npm run db:migrate
```

## Step 4: Run the Development Server
```bash
npm run dev
```

The application will start on `http://localhost:3000`. You can open this in your browser to view the app!

Sign up again after this switch. Existing MongoDB accounts are not copied, and old login cookies will not match the new user ids.

## Step 5 (Optional): Run Tests
To execute the local automated BDD test suite:
```bash
npm run test:bdd
```
