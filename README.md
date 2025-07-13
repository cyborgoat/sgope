# sgope

sgope is a modern AI-powered chat application with a Next.js frontend and a Python backend. It features real-time streaming, intelligent suggestions, and a modular architecture for rapid development.

## Monorepo Structure

- `frontend/` – Next.js 14 app with modern UI, chat interface, and knowledge sidebar
- `backend/` – Python backend (FastAPI or similar) for LLM, memory, and API endpoints

## Quick Start

1. Clone the repository:
   ```bash
   git clone <this-repo-url>
   cd sgope
   ```
2. See `frontend/README.md` and `backend/README.md` for setup and usage instructions for each part.

## Building the App

To build the full desktop app (Next.js + Tauri):

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Build the Next.js frontend:
   ```bash
   npm run build
   ```

3. Build the Tauri desktop app:
   ```bash
   npx tauri build
   ```

The final Tauri app will be in `frontend/src-tauri/target/release/`.

## Features

- Real-time chat with streaming responses
- File and action suggestions
- Modular, extensible backend
- Modern, responsive frontend

---

*Created by cyborgoat*