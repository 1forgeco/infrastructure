"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticatePlatformJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_key";
const authenticatePlatformJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        jsonwebtoken_1.default.verify(token, JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: "Invalid or expired token" });
            }
            if (!decoded || !decoded.isPlatformUser) {
                return res.status(403).json({ error: "Access denied. Platform superadmin permissions required." });
            }
            try {
                const platformUser = await prisma_1.prisma.platformUser.findFirst({
                    where: {
                        id: decoded.userId,
                        is_active: true,
                    },
                });
                if (!platformUser) {
                    return res.status(403).json({ error: "Platform account is inactive or not found" });
                }
                req.platformUser = {
                    id: platformUser.id,
                    email: platformUser.email,
                    fullName: platformUser.full_name,
                };
                next();
            }
            catch (error) {
                console.error("Platform authorization middleware error:", error);
                return res.status(500).json({ error: "Internal server error during authorization check" });
            }
        });
    }
    else {
        res.status(401).json({ error: "Authorization token required" });
    }
};
exports.authenticatePlatformJWT = authenticatePlatformJWT;
