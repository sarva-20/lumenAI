# LumenAI - Your AI-Powered Solar Journey

LumenAI is a comprehensive web application designed to simplify the process of transitioning to solar energy. By leveraging cutting-edge AI, LumenAI provides homeowners and landowners with the tools they need to make informed decisions, from initial feasibility analysis to connecting with professional installers.

## Features

### 1. AI-Powered Roof Analysis
- **Interactive Map Interface**: Users can locate their property on an interactive map.
- **Area Selection**: A simple drawing tool allows users to outline their roof or land area for analysis.
- **Instant AI Insights**: After capturing the selected area, our AI analyzes the image to provide:
  - **Usable Surface Area**: An estimation of the viable area for solar panel installation (in square meters).
  - **Obstruction Detection**: Identifies potential obstructions like chimneys, vents, or shadows from trees.
  - **Layout Sketch**: A textual description of a suggested solar panel layout.

### 2. Dynamic Energy & Cost Estimation
- **Personalized Inputs**: The estimation process begins by asking whether the installation is for a home or land.
- **Contextual Form**: Based on the property type, the form dynamically requests relevant information:
  - **For Homes**: Roof type (e.g., sloped, flat), and installation type.
  - **For Land**: Installation is automatically set to ground-mounted.
- **Customized Recommendations**: The AI combines the roof analysis with user preferences (e.g., budget, standard, or premium panels) to generate a tailored estimation, including:
  - Recommended System Size (kW)
  - System Type (On-grid, Off-grid, Hybrid)
  - Estimated Cost (in INR)
  - Estimated Monthly Savings (in INR)
  - Return on Investment (ROI) Period
- **Editable Results**: Users have the flexibility to review and edit the AI-generated estimations to match their budget or specific requirements.

### 3. Comprehensive Feasibility Report
- **Generate PDF**: With a single click, users can generate a comprehensive, human-readable feasibility report that consolidates the AI roof analysis and the customized cost estimations.

### 4. Installer & Dealer Connection
- **Find Local Professionals**: Browse a curated list of verified solar installers and dealers.
- **Map View**: Visualize the location of installers in your area on a map.
- **Ratings & Pricing**: View installer ratings, number of completed projects, and average pricing to make an informed choice.

### 5. Community Forum
- **Connect & Share**: A dedicated space for users to ask questions, share their experiences, and learn from a community of solar enthusiasts and experts.
- **Moderated Content**: The forum is moderated by an AI to ensure a safe and productive environment by filtering out spam and inappropriate content.

### 6. AI Chat Assistant
- **Instant Support**: A friendly chatbot is available on every page to answer questions about solar energy, ROI, subsidies, and how to use the application.
- **Context-Aware**: The chatbot can leverage user profile information to provide more personalized answers.

### 7. User Dashboard
- **Central Hub**: A personalized dashboard welcomes users and provides quick links to all the major features of the application, streamlining their solar journey.

### 8. Authentication
- **Secure Access**: Users can sign up for a new account or log in to access their dashboard and saved information.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **UI**: shadcn/ui, Tailwind CSS
- **Mapping**: Google Maps Platform APIs
- **Generative AI**: Google's Gemini models via Genkit
- **Hosting**: Firebase App Hosting