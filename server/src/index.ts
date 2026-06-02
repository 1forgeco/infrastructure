import "dotenv/config";
import express from "express";
import cors from "cors";

// Routes
import signupRoutes from "./routes/auth/signup";
import loginRoutes from "./routes/auth/login";
import meRoutes from "./routes/auth/me";
import inviteRoutes from "./routes/orgs/invites/create";
import createFloorRoutes from "./routes/floors/create";
import listFloorRoutes from "./routes/floors/list";
import createRoomRoutes from "./routes/rooms/create";
import listRoomRoutes from "./routes/rooms/list";
import roomDetailsRoutes from "./routes/rooms/details";
import listMembersRoutes from "./routes/orgs/members/list";
import listTenantsRoutes from "./routes/tenants/list";
import vacateTenantRoutes from "./routes/tenants/vacate";

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());

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
app.use("/api/auth/signup", signupRoutes);
app.use("/api/auth/login", loginRoutes);
app.use("/api/auth/me", meRoutes);
app.use("/api/orgs/invites", inviteRoutes);
app.use("/api/orgs/:orgId", listMembersRoutes);
app.use("/api/floors", createFloorRoutes);
app.use("/api/floors", listFloorRoutes);
app.use("/api/rooms", createRoomRoutes);
app.use("/api/rooms", listRoomRoutes);
app.use("/api/rooms", roomDetailsRoutes);
app.use("/api/tenants", listTenantsRoutes);
app.use("/api/tenants", vacateTenantRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong on the server" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
