# AI Agent Handbook: DevOps AutoTools

> **To All Future AI Agents (Claude, Gemini, ChatGPT, etc.):**
> If you are reading this file, you have been summoned to continue the development of this project. Please read this context carefully before modifying the source code.

## 1. Project Overview
- **Name:** DevOps AutoTools Dashboard
- **Goal:** A centralized React (Vite) application containing various DevOps automation utilities.
- **Tech Stack:** React 18, React Router v6, Vanilla CSS, Lucide React (Icons), Vite, Docker, Nginx.
- **Styling:** Premium Dark/Slate Theme using CSS Variables in `src/index.css`. No TailwindCSS is used. Do NOT add TailwindCSS without the user's explicit request.

## 2. Architecture & File Structure
This project has transitioned from a Single-Page App to a Multi-Page Dashboard.
- `src/App.jsx`: The root component containing the `<BrowserRouter>` and `<Routes>`.
- `src/components/Layout.jsx`: The main layout wrapper providing the left `Sidebar` and the main `Outlet` content area.
- `src/pages/Dashboard.jsx`: The homepage (`/`). It displays a CSS Grid of "Tool Cards".
- `src/pages/HelmConverter.jsx`: The first fully functional tool (`/helm-converter`).
- `src/utils/parser.js`: Contains pure JavaScript logic (Regex, formatting) decoupled from the React UI. **Rule of thumb:** Always decouple heavy logic from UI components into the `utils` directory.

## 3. How to add a new Tool
When the user asks you to implement a new tool (e.g., Kubeconfig Merger):
1. **Create the Component:** Create a new file `src/pages/ToolName.jsx`.
2. **Add Route:** Import and add the component to the `<Routes>` in `src/App.jsx`.
3. **Update Sidebar:** Add a new `<NavLink>` in `src/components/Layout.jsx`.
4. **Update Dashboard Grid:** Go to `src/pages/Dashboard.jsx`, locate the `tools` array, and change the `status` of your tool from `'coming-soon'` to `'active'`, and set its `path` correctly.

## 4. UI/UX Guidelines
- **Premium Aesthetics:** The user expects WOW-factor designs. Always use the CSS variables defined in `src/index.css` (e.g., `var(--bg-dark)`, `var(--accent)`, `var(--text-secondary)`).
- **Icons:** Use `lucide-react` for all iconography.
- **Glassmorphism & Shadows:** Use hover effects `transform: translateY(-2px)` and subtle box-shadows to make elements feel alive.

## 5. Current State
As of May 2026:
- **15 Tools** are fully functional, including Helm Converter, Dockerfile Linter (with auto-fix), K8s Resource Calculator, and SSH Key Generator.
- The project follows a strict **Dark/Slate Premium** design system.
- Zero-dependency logic (where possible) is preferred to maintain speed and privacy.
- All heavy logic is abstracted into `src/utils` or handled via standard Web APIs (SubtleCrypto).

*Good luck, Agent! The user is a DevOps professional who appreciates clean, high-performance code.*
