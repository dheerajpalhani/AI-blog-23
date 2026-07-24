# AI Blog Platform

A modern, full-stack blog platform featuring AI-assisted content generation, rich text editing, and complete user analytics. This project is divided into two main parts: the frontend React client and the backend Node.js Express server.

## Features

- **AI Assistant Integration**: Generate blog ideas, titles, and content directly from the editor using Google Gemini.
- **Rich Text Editing**: Build and format articles using ReactQuill.
- **Full Authentication**: Secure JWT-based authentication system with session management.
- **Dashboard & Analytics**: Track your views, likes, and published/draft blogs, alongside a full Admin panel for moderation.
- **Image Uploads**: Custom cover image uploads via Multer and Cloudinary.
- **Bookmarks & Likes**: Social features to save and engage with content.

## Project Structure

This repository is organized as a monorepo containing:

- `/client/Ai-Blog` - The frontend React application built with Vite and Tailwind CSS.
- `/server` - The backend API built with Express, MongoDB, and Mongoose.

## Getting Started

To run this project locally, you will need to start both the client and the server. Please refer to their respective README files for setup and execution instructions.

- [Client Documentation](./client/Ai-Blog/README.md)
- [Server Documentation](./server/README.md)

## Tech Stack

**Client:** React, Vite, Tailwind CSS, Zustand, React Hook Form, Framer Motion, Axios  
**Server:** Node.js, Express, MongoDB (Mongoose), JWT, Google Generative AI (Gemini), Cloudinary
