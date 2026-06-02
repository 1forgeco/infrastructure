"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePlatformLogin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../../../lib/prisma");
const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_key";
const handlePlatformLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    try {
        const platformUser = await prisma_1.prisma.platformUser.findFirst({
            where: {
                email,
                is_active: true,
            },
        });
        if (!platformUser) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, platformUser.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        // Update last login
        await prisma_1.prisma.platformUser.update({
            where: { id: platformUser.id },
            data: { last_login_at: new Date() },
        });
        const token = jsonwebtoken_1.default.sign({
            userId: platformUser.id,
            email: platformUser.email,
            isPlatformUser: true,
        }, JWT_SECRET, { expiresIn: "24h" });
        return res.status(200).json({
            message: "Platform login successful",
            token,
            user: {
                id: platformUser.id,
                email: platformUser.email,
                fullName: platformUser.full_name,
            },
        });
    }
    catch (error) {
        console.error("Platform login error:", error);
        return res.status(500).json({ error: "An error occurred during platform login" });
    }
};
exports.handlePlatformLogin = handlePlatformLogin;
