# ScreenMate AI 👁️🤖
> Real-time Visual AI Assistant & Computer-Use Copilot

ScreenMate AI is a production-ready visual AI assistant that understands what is currently happening on your computer screen and provides step-by-step guidance whenever you get stuck.

---

## 🌟 Key Features

- **Real-Time Visual Copilot**: Analyzes visible UI elements, applications, form fields, menus, dialogs, and errors.
- **Structured Guidance Engine**: Outputs precise instructions in a clear `Current screen` / `Next step` / `Why` format referencing exact visible UI labels.
- **Voice & Text Interaction**: Supports hands-free voice commands (e.g. *"Help"*, *"Hey ScreenMate, help me"*) via Web Speech API with optional Text-to-Speech (TTS).
- **Multiple Screen Capture Modes**: Supports Browser Tab, Application Window, or Full Monitor capture using native `getDisplayMedia()`, plus manual screenshot fallback upload.
- **Continuous Screen Monitoring**: Optional background monitoring mode with pixel diff change detection.
- **Floating Assistant Mode**: Minimizes into a compact floating widget (`[ScreenMate] 🎤 Help 💬 Ask ⏸ Pause`) with an expandable side drawer.
- **Chrome Manifest V3 Extension**: Integrated browser extension with Chrome Side Panel support.
- **Privacy & Security First**: Zero raw secret exposure, local in-memory frame processing, instant Privacy Mode toggle, and emergency **"Stop Everything"** panic button.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│               ScreenMate AI Web Application            │
│  (React 18 + TypeScript + Vite + Tailwind CSS + Lucide)│
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│ Screen & Voice Engine    │   │ Extension Connector      │
│ (DisplayMedia + Speech)  │   │ (window.postMessage)     │
└──────────────┬───────────┘   └──────────┬───────────────┘
               │                          │
               ▼                          ▼
┌────────────────────────────────────────────────────────┐
│               ScreenMate Node.js Backend API           │
│      (Express + TypeScript + Rate Limiting + CORS)     │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│               AI Vision Provider Abstraction           │
│   (OpenAI GPT-4o / GPT-4o-mini + Intelligent Fallback) │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### 1. Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Browser**: Modern Chromium-based browser (Chrome, Edge, Brave) supporting `getDisplayMedia()` and Web Speech API.

---

### 2. Installation

Clone or extract the repository and install dependencies:

```bash
cd "c:/Users/ASUS/Desktop/new app"
npm install
```

---

### 3. Environment Variables Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` to configure your server port and OpenAI API Key:

```env
PORT=3001
CORS_ORIGIN=http://localhost:5173
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
VITE_API_URL=http://localhost:3001
```

> **Note**: If `OPENAI_API_KEY` is left blank, ScreenMate AI automatically activates its local vision fallback engine, allowing you to test the complete application UI and structured guidance flows without an active key!

---

### 4. Running the Application

To start both the Frontend development server and Node.js Backend server concurrently:

```bash
cmd.exe /c npm run dev
```

Or run them individually in separate terminal windows:

```bash
# Terminal 1: Backend Server (Port 3001)
cmd.exe /c npm run dev:server

# Terminal 2: Frontend App (Port 5173)
cmd.exe /c npm run dev:client
```

Open your browser and navigate to **`http://localhost:5173`**.

---

### 5. Installing the Chrome Extension (Manifest V3)

1. Open Google Chrome and go to `chrome://extensions`.
2. Enable **Developer mode** using the toggle switch in the top right corner.
3. Click **Load unpacked**.
4. Select the `/extension` directory inside the ScreenMate project folder (`c:\Users\ASUS\Desktop\new app\extension`).
5. The extension will install and display a **Connected** status badge when you open the ScreenMate web application!

---

## 🎤 Granting Permissions

When opening ScreenMate AI for the first time, the onboarding flow will guide you through permissions:

1. **Microphone Access**: Click **Grant Microphone Permission** to allow speech recognition for voice commands.
2. **Screen Access**: Click **Start Screen Sharing**. When the browser prompt appears, select your entire screen, a window, or Chrome tab.
3. **Privacy Assurance**: ScreenMate never records audio continuously or stores raw video streams.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Shift + H` (or `Cmd + Shift + H`) | Trigger **Help** screen capture & analysis |
| `Ctrl + Shift + S` (or `Cmd + Shift + S`) | Capture current screen frame |
| `Escape` | Close modals / Return from Floating Assistant mode |

---

## 🔒 Privacy & Security Architecture

- **No Secret Storage in Frontend**: API keys remain exclusively on the Node.js backend server.
- **In-Memory Frame Processing**: Screenshot images are processed in-memory (RAM) and compressed before transmission.
- **Privacy Mode**: Toggling Privacy Mode immediately pauses screen capture, stops microphone listeners, and clears transient preview frames.
- **Emergency Stop**: Clicking **"Stop Everything"** instantly terminates all media streams and purges context.

---

## 🛠️ Production Deployment

### Frontend (Vercel / Netlify)
1. Build client bundle: `npm run build:client`
2. Set environment variable: `VITE_API_URL=https://your-backend-api.onrender.com`

### Backend (Render / Railway / AWS / Docker)
1. Build server bundle: `npm run build:server`
2. Set production environment variables (`PORT`, `CORS_ORIGIN`, `OPENAI_API_KEY`, `OPENAI_MODEL`).
3. Start command: `node dist/server/index.js`
