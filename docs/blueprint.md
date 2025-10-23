# **App Name**: LumenAI

## Core Features:

- AI-Powered Roof Analysis: Analyze rooftop photos or satellite imagery using the Gemini Vision API to detect usable solar surface area, obstacles, and generate panel layout sketches.
- Solar Recommendation Engine: Utilize the Gemini API to calculate system size, type (on-grid, off-grid, hybrid), expected cost & ROI, and monthly savings based on rooftop analysis and energy consumption data.  The LLM acts as a tool which may incorporate climate & solar irradiance data to optimize recommendations.
- Installer & Dealer Connection: Display verified nearby solar installers and dealers on a map using geolocation, including ratings, completed projects, and pricing.
- Feasibility Report Generation: Combine rooftop analysis, recommendations, and financial data to generate a human-readable feasibility report using Gemini. Output a PDF report stored in Firebase Storage.
- Community Discussion Forum: Enable users to ask questions, share photos, and rate installations in a Firestore-based discussion forum. Use Gemini moderation to filter spam and offensive text.
- AI Chat Assistant: Integrate the Gemini API as a conversational chatbot to answer user questions, explain ROI, and provide subsidy information, pulling data from the user's Firestore profile.
- User Authentication and Role Selection: Implement Firebase Authentication for user sign-up (Google/Email) and allow users to select roles (Homeowner, Installer/Dealer, Advisor/Consultant). Store role and metadata in Firestore.

## Style Guidelines:

- Primary color: Solar Yellow (#FFC107), symbolizing the sun's energy.
- Accent color: Sunset Orange (#FF9800), highlighting key CTAs and interactive elements to enhance user engagement.
- Secondary color: Eco Green (#4CAF50), representing sustainability and environmental friendliness.
- Background color: White (#FFFFFF), providing a clean and modern backdrop.
- Headline font: 'Poppins', a geometric sans-serif for a contemporary and fashionable look.
- Body font: 'PT Sans', a humanist sans-serif, balancing modernity with a touch of warmth for comfortable reading.
- Use clean and modern icons representing solar energy, locations, and financial data.
- Maintain a clean and intuitive layout with clear information hierarchy and visual cues to guide users through the app's functionalities.