import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import authRoutes from "./src/modules/auth/auth.routes.js";
import checkboxRoutes from "./src/modules/checkbox/checkbox.routes.js"
import { errorHandler } from "./src/common/middleware/errorHandler.middleware.js";
import { notFound } from "./src/common/middleware/notFound.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()

// CORS Configuration
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost"],
    credentials: true
}))

app.use(express.json())

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use("/auth", authRoutes)
app.use("/checkbox", checkboxRoutes)

// Serve index.html for all unknown routes (SPA fallback)
app.get(/^(?!\/auth|\/auction|\/bid|\/api).*$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(errorHandler);
app.use(notFound);

export default app