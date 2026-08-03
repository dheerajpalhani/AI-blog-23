# AI Blog Platform - Client

This is the frontend for the AI Blog Platform, built with React and Vite. It provides a sleek, modern, and highly responsive user interface for reading, writing, and managing blog posts.

## Features

- **Rich Text Editor**: Integrated `react-quill` for comprehensive post formatting.
- **AI Integration**: A dedicated side-panel in the Dashboard to generate summaries, titles, or entire content blocks using Google Gemini (via the backend API).
- **Authentication**: JWT session handling, login/registration forms, and protected routing.
- **Dynamic Dashboard**:
  - **Overview**: View your drafts and published posts.
  - **Analytics**: Beautiful charts to track views and likes on your content.
  - **Admin Panel**: For users with the `admin` role, moderate platform users, posts, and comments globally.
- **User Engagement**: Fully functioning comment sections, post liking, and bookmarking.
- **Styling**: Uses Tailwind CSS with a custom Cyber Violet/Slate color theme, glassmorphism UI elements, and sleek skeleton loaders.

## Prerequisites

- Node.js (v18+ recommended)
- A running instance of the Server API (see `../server/README.md`)

## Getting Started

1. Navigate to the client directory:
   ```bash
   cd client/Ai-Blog
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Ensure you have a `.env` file or rely on Vite's default environment variables pointing to your backend. By default, the app is configured (via `api.js`) to point to `http://localhost:5000/api`.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Tech Stack

- **Framework**: React 18
- **Bundler**: Vite
- **Styling**: Tailwind CSS, Framer Motion
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Forms**: React Hook Form
- **Network Requests**: Axios, React Hot Toast