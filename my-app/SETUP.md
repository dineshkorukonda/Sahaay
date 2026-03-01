# Sahaay Local Setup Guide

Follow these steps to run the Sahaay application on your local machine.

## Prerequisites
1. **Node.js** (v20 or higher recommended)
2. **MongoDB** (Local instance or MongoDB Atlas URL)
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
# Database
B_URL="mongodb://localhost:27017/sahaay" # Or your MongoDB Atlas URL

# AI & Maps
GOOGLE_API_KEY="your_gemini_api_key_here"
NEXT_PUBLIC_GOOGLE_API_KEY="your_google_maps_api_key_here"

# Authentication
JWT_SECRET="your_secure_random_string_here"
```

## Step 3: Run the Development Server
```bash
npm run dev
```

The application will start on `http://localhost:3000`. You can open this in your browser to view the app!

## Step 4 (Optional): Run Tests
To execute the local automated BDD test suite:
```bash
npm run test:bdd
```
