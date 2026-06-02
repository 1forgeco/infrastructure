"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRequestPass = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../../../lib/prisma");
const handleRequestPass = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const userId = req.user?.userId;
    const { purpose, destination, expectedOutTime, expectedReturnTime } = req.body;
    if (!purpose || !destination || !expectedOutTime || !expectedReturnTime) {
        return res.status(400).json({
            error: "Missing required fields (purpose, destination, expectedOutTime, expectedReturnTime)",
        });
    }
    // Validate dates
    const outTime = new Date(expectedOutTime);
    const returnTime = new Date(expectedReturnTime);
    if (isNaN(outTime.getTime()) || isNaN(returnTime.getTime())) {
        return res.status(400).json({ error: "Invalid date format for out/return times" });
    }
    if (returnTime <= outTime) {
        return res.status(400).json({ error: "expectedReturnTime must be after expectedOutTime" });
    }
    try {
        // Check if the user is a tenant in the organization
        const tenantProfile = await prisma_1.prisma.tenantProfile.findFirst({
            where: {
                user_id: userId,
                org_id: orgId,
                is_active: true,
            },
        });
        if (!tenantProfile) {
            return res.status(403).json({ error: "Only active tenants can request a gate pass" });
        }
        const qrCode = `GP-${crypto_1.default.randomUUID()}`;
        // Create GatePass record
        const gatePass = await prisma_1.prisma.gatePass.create({
            data: {
                org_id: orgId,
                tenant_id: userId,
                purpose,
                destination,
                expected_out_time: outTime,
                expected_return_time: returnTime,
                status: "pending",
                qr_code: qrCode,
            },
        });
        return res.status(201).json({
            message: "Gate pass requested successfully",
            gatePass,
        });
    }
    catch (error) {
        console.error("Request gate pass error:", error);
        return res.status(500).json({ error: "An error occurred during gate pass request" });
    }
};
exports.handleRequestPass = handleRequestPass;
