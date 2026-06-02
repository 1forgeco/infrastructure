"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// Routes
const signup_1 = __importDefault(require("./routes/auth/signup"));
const login_1 = __importDefault(require("./routes/auth/login"));
const me_1 = __importDefault(require("./routes/auth/me"));
const create_1 = __importDefault(require("./routes/orgs/invites/create"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Request logging middleware (for development)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", time: new Date() });
});
// Register API Routes
app.use("/api/auth/signup", signup_1.default);
app.use("/api/auth/login", login_1.default);
app.use("/api/auth/me", me_1.default);
app.use("/api/orgs/invites", create_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong on the server" });
});
// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
