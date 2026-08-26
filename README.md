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
cd server
npm install
```

Copy the example env file and fill in your values:

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

The frontend will be running at `http://localhost:5173`.

---

## 📡 API Reference

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Create a new user account |
| `POST` | `/login` | Public | Login and receive an HttpOnly JWT cookie |
| `POST` | `/logout` | Public | Clear auth cookie |
| `GET` | `/me` | 🔒 User | Get the currently authenticated user |
| `PUT` | `/profile` | 🔒 User | Update profile (name, bio, avatar) |
| `GET` | `/users` | 🔒 Admin | List all users |
| `PUT` | `/users/:id/role` | 🔒 Admin | Change a user's role |
| `DELETE` | `/users/:id` | 🔒 Admin | Delete a user |

### Posts — `/api/posts`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Public | Get all published posts (with filters) |
| `GET` | `/:id` | Public | Get a single post by ID |
| `POST` | `/` | 🔒 User | Create a new post |
| `PUT` | `/:id` | 🔒 User | Update a post |
| `DELETE` | `/:id` | 🔒 User | Delete a post |
| `PUT` | `/:id/view` | Public | Increment post view count |
| `POST` | `/:id/like` | 🔒 User | Toggle like on a post |
| `POST` | `/:id/bookmark` | 🔒 User | Toggle bookmark on a post |
| `POST` | `/upload` | 🔒 User | Upload a cover image to Cloudinary |
| `POST` | `/:id/comments` | 🔒 User | Add a comment to a post |
| `GET` | `/:id/comments` | Public | Get all comments for a post |
| `DELETE` | `/comments/:commentId` | 🔒 User | Delete a comment |
| `GET` | `/analytics/my-stats` | 🔒 User | Get author's personal analytics |
| `GET` | `/analytics/admin-stats` | 🔒 Admin | Get platform-wide analytics |
| `GET` | `/comments/admin/all` | 🔒 Admin | Get all comments across the platform |

### AI — `/api/ai`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/generate` | 🔒 User | Generate AI content (title, ideas, or full draft) using Gemini |

### Health Check

```
GET /api/health
```

---

## 🔐 Authentication Flow

1. On login/register, the server creates a signed JWT and sets it as an **HttpOnly cookie**.
2. The client sends subsequent requests with `credentials: 'include'` (Axios `withCredentials: true`).
3. The `protect` middleware reads the cookie, verifies the token, and attaches `req.user` to the request.
4. The `admin` middleware additionally checks that `req.user.role === 'admin'`.

---

## 📝 License

This project is open-source and available under the [ISC License](./server/package.json).
