"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCreateInvite = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../../../../lib/prisma");
const client_1 = require("../../../../../generated/prisma/client");
const handleCreateInvite = async (req, res) => {
    const userId = req.user?.userId;
    const { orgId, emailOrPhone, role } = req.body;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (!orgId || !emailOrPhone || !role) {
        return res.status(400).json({ error: "Missing required fields (orgId, emailOrPhone, role)" });
    }
    // Validate role
    const validRoles = Object.values(client_1.OrgRole);
    if (!validRoles.includes(role)) {
        return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(", ")}` });
    }
    try {
        // Check if the requesting user has a role in the organization
        const requesterRole = await prisma_1.prisma.userOrgRole.findFirst({
            where: {
                user_id: userId,
                org_id: orgId,
                is_active: true,
            },
        });
        if (!requesterRole) {
            return res.status(403).json({ error: "You do not have access to this organization" });
        }
        // Only 'owner' or 'warden' can invite
        if (requesterRole.role !== "owner" && requesterRole.role !== "warden") {
            return res.status(403).json({ error: "Only owners and wardens can invite new members" });
        }
        // Wardens cannot invite owners
        if (requesterRole.role === "warden" && role === "owner") {
            return res.status(403).json({ error: "Wardens cannot invite owner accounts" });
        }
        // Generate unique token
        const token = crypto_1.default.randomBytes(32).toString("hex");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // expires in 7 days
        // Create onboarding invite
        const invite = await prisma_1.prisma.onboardingInvite.create({
            data: {
                org_id: orgId,
                invited_by: userId,
                email_phone: emailOrPhone,
                role: role,
                token: token,
                expires_at: expiresAt,
                status: "pending",
            },
            include: {
                organization: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        return res.status(201).json({
            message: "Onboarding invite created successfully",
            invite: {
                id: invite.id,
                orgId: invite.org_id,
                orgName: invite.organization.name,
                emailOrPhone: invite.email_phone,
                role: invite.role,
                token: invite.token,
                status: invite.status,
                expiresAt: invite.expires_at,
            },
        });
    }
    catch (error) {
        console.error("Create onboarding invite error:", error);
        return res.status(500).json({ error: "An error occurred creating onboarding invite" });
    }
};
exports.handleCreateInvite = handleCreateInvite;
