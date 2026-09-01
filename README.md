# 🤖 AI BlogForge

A full-stack, AI-powered blogging platform where writers can create, manage, and publish articles with the help of Google Gemini. Built with a React (Vite) frontend and an Express + MongoDB backend.
 and 
---

## ✨ Features

| Feature | Details |
|---|---|
| **AI Content Generation** | Generate blog titles, ideas, and full article drafts via Google Gemini |
| **Premium Modern UI** | Beautiful glassmorphic design, ambient gradients, floating cards, and micro-animations |
| **Rich Text Editor** | Format posts with ReactQuill (bold, headings, lists, links, and more) |
| **JWT Authentication** | Secure, cookie-based auth with register, login, and logout flows |
| **Role-based Access** | Standard users and Admin users with separate permissions |
| **Image Uploads** | Cover image uploads handled by Multer → Cloudinary |
| **Bookmarks & Likes** | Save posts and show appreciation with one click |
| **Comments** | Threaded comments on every blog post |
| **View Tracking** | Automatic view counter on each post |
| **Author Dashboard** | Personal analytics: total views, likes, published vs. draft count |
| **Admin Panel** | Manage all users, posts, and comments from one interface |
| **Skeleton Loading** | Polished loading states with animated skeleton cards |
| **Error Boundaries** | Graceful UI error handling with React Error Boundary |

---

## 🗂️ Project Structure

```
ai-blog-platform/
├── client/
│   └── Ai-Blog/                  # React + Vite frontend
│       ├── src/
│       │   ├── components/       # Shared UI components
│       │   │   ├── AnalyticsChart.jsx
│       │   │   ├── ErrorBoundary.jsx
│       │   │   ├── Navbar.jsx
│       │   │   ├── Footer.jsx
│       │   │   ├── ProtectedRoute.jsx
│       │   │   └── SkeletonCard.jsx
│       │   ├── pages/            # Route-level page components
│       │   │   ├── Home.jsx
│       │   │   ├── BlogDetails.jsx
│       │   │   ├── CreatePost.jsx
│       │   │   ├── Dashboard.jsx
│       │   │   ├── Login.jsx
│       │   │   └── Register.jsx
│       │   ├── services/         # Axios API service layer
│       │   ├── store/            # Zustand global state
│       │   ├── App.jsx
│       │   └── main.jsx
│       ├── vite.config.js
│       └── package.json
│
└── server/                       # Node.js + Express backend
    ├── config/
    │   └── db.js                 # MongoDB connection
    ├── controllers/
    │   ├── authController.js
    │   └── postController.js
    ├── middleware/
    │   ├── authMiddleware.js      # JWT protect & admin guards
    │   ├── errorHandler.js
    │   └── uploadMiddleware.js   # Multer memory storage
    ├── models/
    │   ├── User.js
    │   ├── Post.js
    │   └── Comment.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── postRoutes.js
    │   └── aiRoutes.js
    ├── services/                 # Cloudinary & Gemini integrations
    ├── utils/
    ├── index.js                  # Server entry point
    └── package.json
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI library |
| Vite 8 | Build tool & dev server |
| Tailwind CSS 4 | Utility-first styling |
| Zustand | Lightweight global state management |
| React Router DOM 7 | Client-side routing |
| React Hook Form | Form handling & validation |
| React Quill | Rich text editor |
| Framer Motion | Animations & transitions |
| Lucide React | Icon library |
| Axios | HTTP client |
| React Hot Toast | Toast notifications |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JSON Web Tokens | Authentication |
| bcryptjs | Password hashing |
| Multer | Multipart file upload handling |
| Cloudinary | Cloud image storage |
| Google Gemini (`@google`) | AI content generation |
| cookie-parser | HttpOnly cookie management |
| dotenv | Environment variable loading |
| nodemon | Dev server auto-restart |

---

### Prerequisites

- Node.js v18+
- npm v9+
- A MongoDB Atlas cluster (or local MongoDB)
- Cloudinary account
- Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/dheerajpalhani/AI-blog-23
cd ai-blog-23
```

### 2. Set up the Server

```bash
cp .env.example .env
```

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ai-blogforge
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5003

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GEMINI_API_KEY=your_gemini_api_key
```

Start the development server:

```bash
npm run dev        # uses nodemon for auto-reload
# or
npm start          # plain node
```

The API will be running at `http://localhost:5000`.

### 3. Set up the Client

```bash
cd ../client/Ai-Blog
npm install
npm run dev
```