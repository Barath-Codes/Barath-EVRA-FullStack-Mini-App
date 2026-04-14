# EVRA Session Management Console - Frontend

## Getting Started (Local Development)

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: (v18.x or higher)
- **npm** (comes with Node.js) or **yarn**

### Installation & Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd apps/web
   ```

2. **Install all dependencies:**
   Dependencies are now managed at the root level via npm workspaces. Ensure you've run `npm install` in the project's root folder.

3. **Configure Environment Variables (Optional):**
   If you have backend configuration values like the API base URL, create a `.env` file in the root of the `apps/web` directory mirroring any necessary backend URL specifics. By default, Axios is usually configured to expect the backend on a local port if running concurrently.

   > **Important:** Ensure the backend application is actively running on its specified port (e.g., `4000`) to avoid API connection issues.

4. **Start the local development server:**
   ```bash
   npm run dev
   ```

5. **View the basic application:**
   Open your browser and navigate to `http://localhost:5173` (or the local port provided in your terminal).

---

## Available Scripts

In the project directory, you can run:

- `npm run dev`: Runs the app in development mode using Vite. The page will reload if you make edits.
- `npm run build`: Compiles TypeScript files and builds the app for production to the `dist` folder.
- `npm run lint`: Runs ESLint to check for stylistic and logical errors in the codebase.
- `npm run preview`: Locally previews the built production-ready `dist` folder.

---

## Overview

This is the frontend application for the EVRA Session Management Console. It provides an intuitive, responsive user interface to interact with and manage Electric Vehicle (EV) charging sessions and charger summaries powered by the EVRA Backend API. 

The web application is built for performance and maintainability, leveraging a modern React-based stack.

## Tech Stack

- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI Component Library:** [Material UI (MUI)](https://mui.com/) + Emotion
- **Data Fetching:** [Axios](https://axios-http.com/)

---

## Troubleshooting Guide

Here are some common issues and their solutions when running the project locally:

**1. The application fails to compile due to missing dependencies.**
- **Details:** Can occur after pulling new changes or updating Node.
- **Fix:** Run `rm -rf node_modules package-lock.json` followed by `npm install` to perform a clean installation of dependencies.

**2. The backend data is not displaying on the frontend.**
- **Details:** The app loads but session or charger lists are empty, or you see network errors in your browser console.
- **Fix:** Ensure the EVRA Backend application is actively running locally (e.g., on port `3000` or `4000`). Make sure your API calls (using Axios) are pointed correctly to the backend's address `http://localhost:<PORT>`. You might also need to ensure the Backend has `cors` properly configured or enabled so that the browser allows frontend requests.

**3. "Port is already in use" Error (`npm run dev`)**
- **Details:** Vite throws an error that port `5173` is taken.
- **Fix:** This means another process is using Vite's default port. You can kill the rogue process, or simply let Vite assign the next available port for you (e.g., `5174`). Add a `--port` flag to your package.json script if you want a guaranteed specific port.

**4. TypeScript Compilation / ESLint Errors blocking build**
- **Details:** Running `npm run build` throws terminal errors based on typings or code style.
- **Fix:** Make sure you've typed all newly created React components properly. Use `npm run lint` periodically to catch syntactic issues before the build step.
