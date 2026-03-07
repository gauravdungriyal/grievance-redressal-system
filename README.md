# CS Redressal System 🚀

A modern, fast, and secure Grievance Redressal System designed for students and administrators to manage and resolve academic and campus-related complaints efficiently.

**Live Demo:** [grievance-redressal-system-udzc.onrender.com](https://grievance-redressal-system-udzc.onrender.com)

---

## ✨ Features

### 🎓 For Students
- **Smart Dashboard:** View status of all submitted grievances at a glance.
- **Easy Submission:** Submit complaints with detailed descriptions and categories.
- **Real-time Notifications:** Get notified immediately when your grievance is addressed or resolved.
- **History Tracking:** Track the entire lifecycle of your complaints from "Pending" to "Resolved".

### 🛠️ For Administrators
- **Centralized Management:** View and manage all student grievances from a single interface.
- **Status Updates:** Update complaint status (Pending, In-Progress, Resolved) with resolution notes.
- **Secure Authentication:** Robust role-based access control.
- **Student Audit:** Monitor student activities and profiles.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3 (Custom Design System), Vanilla JavaScript (ES6+).
- **Backend:** Node.js, Express.js.
- **Database & Auth:** Supabase (PostgreSQL, Auth, Storage).
- **Icons:** Lucide Icons.
- **Deployment:** Render (Server), Vercel (Client Alternative).

---

## 📂 Project Structure

```text
├── client/              # Frontend application
│   ├── assets/          # Static assets (images, icons)
│   ├── components/      # UI components (Navbar, Sidebar, Auth)
│   ├── css/             # Styling (Modern, responsive UI)
│   ├── js/              # Application logic and API wrappers
│   ├── pages/           # Dashboard and notification views
│   └── index.html       # Single Page Application entry
├── server/              # Backend Express.js server
│   ├── routes/          # API endpoints (Auth, Complaints)
│   ├── middleware/      # Auth and security logic
│   ├── utils/           # Helper functions
│   ├── server.js        # Main server entry point
│   └── .env.example     # Template for environment variables
└── README.md            # You are here!
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Supabase Project (Database URL & Service Role Key)

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gauravdungriyal/grievance-redressal-system.git
   cd grievance-redressal-system
   ```

2. **Server Configuration:**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Fill in your Supabase credentials in .env
   npm start
   ```

3. **Client Configuration:**
   The client is served statically by the server, or can be opened directly via Live Server. Ensure `client/js/api.js` points to your backend URL.

---

## 🔒 Environment Variables

Required variables in `server/.env`:
- `PORT`: Server port (default 5000)
- `SUPABASE_URL`: Your Supabase Project URL
- `SUPABASE_KEY`: Your Supabase Service Role Key
- `JWT_SECRET`: Secret for signing tokens

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.
