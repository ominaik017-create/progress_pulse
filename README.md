# ProgressPulse 🚀
## Smart Goal, Productivity & Task Tracking System

---

## 🛠️ Tech Stack
- **Frontend:** React.js, Chart.js, Socket.io-client, Tailwind-inspired CSS
- **Backend:** Node.js, Express.js, Socket.io
- **Database:** MongoDB Atlas
- **AI:** Ollama (Llama 3.2:3b) with curated fallback quotes
- **Auth:** JWT + bcrypt

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js v18+ → https://nodejs.org
- MongoDB Atlas account (already configured ✅)
- Ollama (optional for AI) → https://ollama.ai

### 2. Clone / Extract Project
```bash
cd progresspulse
```

### 3. Install All Dependencies
```bash
# Install server dependencies
cd server && npm install

# Install client dependencies  
cd ../client && npm install
```

### 4. Create Admin Account
```bash
cd server && node createAdmin.js
```
This creates:
- **Email:** admin@progresspulse.com  
- **Password:** admin123

### 5. Start the App

**Terminal 1 — Backend:**
```bash
cd server
node index.js
# or for auto-reload:
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm start
```

### 6. Open in Browser
```
http://localhost:3000
```

---

## 🤖 Optional: Enable AI Motivation (Ollama)

```bash
# Install Ollama from https://ollama.ai
# Then pull the model:
ollama pull llama3.2:3b

# Start Ollama (runs on port 11434):
ollama serve
```
If Ollama is not running, the app uses curated motivational quotes automatically.

---

## 🔑 Environment Variables (server/.env)

```env
MONGO_URI=mongodb+srv://naikomkar106_db_user:UatKsYqjJWVaM5Qz@cluster0.29eac6z.mongodb.net/progresspulse?appName=Cluster0
JWT_SECRET=progresspulse_secret_omkar_2024
PORT=5000
CLIENT_URL=http://localhost:3000
```

---

## 📱 Features

### Mode 1 — Personal Productivity
- ✅ Task management with categories & priorities
- 🔥 Habit tracker with streak visualization
- ⏰ Countdown timers for exams/events
- 📊 Analytics with charts (weekly/monthly/category)
- 📄 PDF export of productivity reports
- 🤖 AI motivational quotes (Ollama/fallback)

### Mode 2 — Academic Competition
- 👥 Create/join groups (invite codes)
- 💬 Real-time group chat (Socket.io)
- 🏆 Leaderboard rankings
- 🎯 Group challenges with point system

### Mode 3 — Public Challenges
- 🌍 Browse expert-created challenges
- 🎓 Verified creator system
- ✅ Admin approval workflow
- 📈 Participant leaderboards

### Admin Panel
- 👁️ View all users
- ✅ Verify creators
- 🔍 Approve/reject public challenges

---

## 🗂️ Project Structure

```
progresspulse/
├── server/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/       # Auth middleware
│   ├── socket/          # Socket.io chat
│   ├── createAdmin.js   # Admin seeder
│   └── index.js         # Server entry
└── client/
    └── src/
        ├── components/  # Sidebar, Topbar
        ├── context/     # Auth context
        ├── pages/
        │   ├── Auth/    # Login, Register
        │   ├── Personal/ # Dashboard, Tasks, Habits, Analytics, Countdown
        │   ├── Academic/ # Groups, GroupDetail
        │   ├── Public/  # Challenges, ChallengeDetail
        │   └── Admin/   # AdminPanel
        └── utils/       # API axios instance
```

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/tasks | Get tasks |
| POST | /api/tasks | Create task |
| GET | /api/habits | Get habits |
| GET | /api/groups | Get user groups |
| POST | /api/groups/join | Join via invite code |
| GET | /api/challenges/public | Public challenges |
| GET | /api/analytics/weekly | Weekly stats |
| GET | /api/ai/motivation | AI quote |
| GET | /api/admin/users | (Admin) All users |

---

## 👤 Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@progresspulse.com | admin123 |

Register any email for normal user account.

---

Built with ❤️ — ProgressPulse Smart Productivity Ecosystem
