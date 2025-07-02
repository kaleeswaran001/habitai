# HabitAI: Intelligent Habit Tracker

HabitAI is a modern, full-stack web application designed to help you build and maintain positive habits. It goes beyond simple tracking by leveraging the power of generative AI to provide personalized insights, motivation, and feedback on your progress.

## Key Features

*   **Secure User Authentication:** Create an account and log in securely using Firebase Authentication. All your data is tied to your account.
*   **Real-time Habit Syncing:** Habits are stored in Cloud Firestore, ensuring your data is always up-to-date and synced across all your devices.
*   **Intuitive Habit Management:** Easily add new habits, mark them as complete for the day, and see your current streak build up.
*   **AI-Powered Insights:** With the click of a button, get personalized feedback from an AI coach that analyzes your habit data. The AI provides:
    *   **Positive Reinforcement:** Celebrating your successes.
    *   **Gentle Nudges:** Suggesting areas for improvement.
    *   **Motivational Quotes:** To keep you inspired on your journey.
*   **Visual Progress Tracking:** A weekly bar chart visualizes your consistency, showing how many habits you've completed over the last 7 days.
*   **Modern & Responsive UI:** Built with ShadCN UI and Tailwind CSS for a clean, modern, and mobile-friendly user experience.

## Tech Stack

This project is built with a modern, production-ready tech stack:

*   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **UI:** [React](https://react.dev/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Component Library:** [ShadCN UI](https://ui.shadcn.com/)
*   **Backend & Database:** [Firebase](https://firebase.google.com/) (Authentication & Cloud Firestore)
*   **Generative AI:** [Genkit](https://firebase.google.com/docs/genkit) (with Google's Gemini models)
*   **Charting:** [Recharts](https://recharts.org/)

## Getting Started

To run this project locally, you will need to configure your Firebase credentials.

1.  **Create a Firebase Project:** If you don't have one already, create a new project at the [Firebase Console](https://console.firebase.google.com/).
2.  **Set up Authentication:** Enable Email/Password sign-in in the Authentication section.
3.  **Set up Firestore:** Create a new Cloud Firestore database.
4.  **Get Web App Credentials:** In your Firebase project settings, create a new Web App and copy the `firebaseConfig` object.
5.  **Create `.env` file:** Create a file named `.env` in the root of the project.
6.  **Populate `.env`:** Add your Firebase credentials to the `.env` file using the `NEXT_PUBLIC_` prefix:

    ```bash
    NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
    NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
    ```

7.  **Install dependencies and run:**
    ```bash
    npm install
    npm run dev
    ```

The application will now be running, connected to your Firebase backend.
