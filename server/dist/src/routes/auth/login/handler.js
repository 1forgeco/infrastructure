"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLogin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../../../lib/prisma");
const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_key";
const JWT_EXPIRES_IN = "1d"; // 1 day access token
const REFRESH_TOKEN_EXPIRES_DAYS = 7;
const handleLogin = async (req, res) => {
    const { username, password } = req.body; // username can be email or phone
    if (!username || !password) {
        return res.status(400).json({ error: "Username (email/phone) and password are required" });
    }
    try {
        // Find user by email or phone
        const user = await prisma_1.prisma.user.findFirst({
            where: {
                OR: [{ email: username }, { phone: username }],
            },
        });
        if (!user) {
            return res.status(401).json({ error: "Invalid username or password" });
        }
        if (!user.is_active) {
            return res.status(403).json({ error: "User account is deactivated" });
        }
        // Verify password
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid username or password" });
        }
        // Fetch user roles
        const roles = await prisma_1.prisma.userOrgRole.findMany({
            where: { user_id: user.id, is_active: true },
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });
        // Update last login
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { last_login_at: new Date() },
        });
        // Generate JWT access token
        const accessToken = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        // Generate refresh token
        const refreshRawToken = crypto_1.default.randomBytes(40).toString("hex");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);
        // Save refresh token to database
        await prisma_1.prisma.refreshToken.create({
            data: {
                user_id: user.id,
                token: refreshRawToken,
                device: req.headers["user-agent"] || "unknown",
                ip_address: req.ip || "unknown",
                expires_at: expiresAt,
            },
        });
        // Format roles output
        const userRoles = roles.map((r) => ({
            orgId: r.org_id,
            orgName: r.organization.name,
            orgSlug: r.organization.slug,
            role: r.role,
        }));
        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                fullName: user.full_name,
                profilePhotoUrl: user.profile_photo_url,
            },
            roles: userRoles,
            accessToken,
            refreshToken: refreshRawToken,
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "An error occurred during login" });
    }
};
exports.handleLogin = handleLogin;
