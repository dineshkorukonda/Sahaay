# Sahaay: Medical Intelligence

Sahaay is a **Smart Community Health Monitoring and Early Warning System** (Problem Statement ID 25001) designed to track, predict, and help contain water-borne disease outbreaks before they become epidemics.

By crowdsourcing symptom reports and tracking local water quality, Sahaay provides actionable, AI-driven intelligence to health officials in real time.

## 🌟 Key Features

### 1. The Outbreak Risk Risk Engine
Sahaay's backend continuously monitors a 14-day rolling window of health and environmental data. It cross-references patient symptoms (e.g., diarrhea, cholera) against local water quality tests to output an automated risk score per PIN Code. 

### 2. Live Hotspot Monitoring
A live Google Maps dashboard plots outbreak clusters geographically (Red = High Risk, Yellow = Warning, Green = Safe), allowing command centers to deploy medical supplies or clean water tankers precisely where they are needed.

### 3. Community Water Quality Surveillance
Citizens can report the safety of their local water sources directly in the app. The intuitive Water Quality dashboard tracks pH levels (using a dynamic visual scale) and bacterial presence for area-specific contamination alerts.

### 4. AI-Powered Insights
The platform integrates **Google Gemini AI** to automatically synthesize complex outbreak data clusters into clear, 2-to-3 sentence English summaries. This converts raw data into immediate, actionable advice for health workers.

### 5. Automated Alerting
When a district crosses the "High Risk" threshold, the system automatically triggers localized alert banners on the dashboard. This ensures critical threats are never missed and redundant alerts are prevented until resolved.

---
Built with Next.js, Tailwind CSS, MongoDB, and Gemini 1.5 Flash.
