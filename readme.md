# Sahaay - Healthcare Companion App

Sahaay is a comprehensive healthcare companion application designed to simplify medical management and support. It integrates advanced AI features to analyze medical reports, helps users locate nearby healthcare facilities, and fosters a supportive community.

##  Key Features

-   **AI Medical Report Analysis**: Upload medical PDFs to get detailed summaries, extracted vitals, and dietary recommendations using Google Gemini AI.
-   **Nearby Care Finder**: Locate hospitals, clinics, and pharmacies near you with an interactive map interface.
-   **Health & Vitals Monitoring**: Track essential health metrics like Blood Pressure, Glucose, Heart Rate, and more.
-   **Family Health Management**: Manage health records and appointments for family members in one place.
-   **Community Support**: Join specific groups (e.g., Diabetes Support, Cardiac Care) to share experiences and get advice.
-   **Secure Authentication**: Robust user authentication system using JWT.

## Tech Stack

-   **Framework**: Next.js 16 (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **Database**: MongoDB (Mongoose)
-   **AI Integration**: Google Gemini (via `google-generative-ai` SDK)
-   **Maps**: Google Maps JavaScript API
-   **PDF Processing**: `pdf-parse`, `jspdf`

## Prerequisites

Before you begin, ensure you have the following installed:
-   [Node.js](https://nodejs.org/) (v18 or higher recommended)
-   [MongoDB](https://www.mongodb.com/) (Local or Atlas)

## Installation & Setup

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
    Create a `.env` file in the `my-app` directory and add the following variables:

    ```env
    # Database
    DB_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/sahaay
    # Or use B_URL as fallback if configured
    # B_URL=...
    
    # Google AI & Maps
    GOOGLE_API_KEY=your_google_api_key_here
    NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key_here
    
    # Authentication
    JWT_SECRET=your_secure_jwt_secret_key
    
    # Email Service (SMTP)
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=your_email@gmail.com
    SMTP_PASS=your_email_app_password
    ```

4.  **Run the Development Server**
    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:3000`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
