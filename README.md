# DevOps Helm Image Converter

Helm Image Converter is a web-based utility designed for DevOps engineers to automate the process of migrating public container images declared in Helm chart `values.yaml` files to a private container registry. 

It provides a high-performance, real-time, 3-column interface to analyze YAML configuration, modify image locations, and generate automated migration scripts.

## ✨ Key Features

- **Line-by-Line Regex Parser**: Safely parses `values.yaml` without destroying the original file structure, comments (`#`), or formatting indentations.
- **Support for Complex Charts**: Handles simple `repository: tag` formats (like `podinfo` or `nginx`) as well as global `imageRegistry` definitions (like `cert-manager`).
- **3-Column Interface**:
  - **Column 1 (Original Values)**: Paste your original `values.yaml`.
  - **Column 2 (Configuration & Images)**: Input your Private Registry URL, review all discovered images and global registries, and get an automatically generated `docker pull/tag/push` bash script.
  - **Column 3 (Converted Values)**: Instantly view, copy, or download the modified `values.yaml`.
- **Search Capabilities**: Find specific configurations effortlessly using the integrated Search functionality across the original and converted YAML files.
- **Premium Design**: Modern Slate/Dark mode UI built with React.

## 🚀 Deployment

The project is fully containerized and uses a multi-stage Docker build with Nginx for optimal production performance.

### Using Docker Compose (Recommended)

1. Ensure Docker and Docker Compose are installed on your machine.
2. Run the application in the background:
   ```bash
   docker compose up -d --build
   ```
3. Open your browser and navigate to: `http://localhost:8080`

## 💻 Local Development

If you want to run the project in development mode with Hot Module Replacement (HMR):

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Access the app locally via `http://localhost:5173` (or the port specified by Vite).

## 🛠 Technology Stack

- **Frontend**: React (Vite)
- **Styling**: Vanilla CSS (CSS Grid, Variables, Premium Aesthetics)
- **Deployment**: Docker, Nginx, Docker Compose
- **Runtime**: Node.js 22 (Alpine)

## 📝 Usage

1. Open the application.
2. Paste the contents of your target `values.yaml` into the left column.
3. Enter your private registry domain (e.g., `harbor.mycompany.com`) in the middle column.
4. The tool will automatically update the YAML and provide a migration script to pull the images from the public registries and push them to your private one.
5. Click **Download** or **Copy** to grab your updated `values.yaml`.

---
*Built to simplify Kubernetes and Helm deployments in isolated/private environments.*
