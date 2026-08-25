# AI Blog Platform - Server API

This is the Express backend for the AI Blog Platform. It provides a robust REST API serving data to the client, handling everything from user authentication to AI-powered post generation.

## Core Features

- **Authentication System**: JWT-based auth with secure cookie storage and specific admin/user roles.
- **Database**: MongoDB paired with Mongoose for data modeling (Users, Posts, Comments).
- **AI Integration**: Endpoints to stream data directly from Google Gemini (`@google/genai`) for summaries and content generation.
- **File Uploads**: Image handling using Multer (memory storage) and Cloudinary for blog post covers and user avatars.
- **Global Error Handling**: Comprehensive catching of asynchronous errors, Mongoose validations, and JWT token expirations.


## Environment Setup

Create a `.env` file in the root of the `server/` directory and populate it according to the `.env.example` file.

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development


# Google Gemini AI Setup
GEMINI_API_KEY=your_gemini_api_key
```

## Running the Server

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server (uses nodemon):
   ```bash
   npm run dev
   ```

3. Start in production mode:
   ```bash
   npm start
   ```

The server will typically run on `http://localhost:5000`.
