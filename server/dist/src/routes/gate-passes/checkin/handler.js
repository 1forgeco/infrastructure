"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCheckIn = void 0;
const prisma_1 = require("../../../lib/prisma");
const handleCheckIn = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const userId = req.user?.userId;
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ error: "Missing gate pass ID parameter" });
    }
    try {
        const gatePass = await prisma_1.prisma.gatePass.findFirst({
            where: {
                id,
                org_id: orgId,
            },
        });
        if (!gatePass) {
            return res.status(404).json({ error: "Gate pass not found in this organization" });
        }
        if (!gatePass.actual_out_time) {
            return res.status(400).json({ error: "Cannot check in. Tenant has not checked out yet." });
        }
        if (gatePass.actual_in_time) {
            return res.status(400).json({ error: "Tenant has already checked in on this gate pass" });
        }
        const updatedPass = await prisma_1.prisma.gatePass.update({
            where: { id },
            data: {
                actual_in_time: new Date(),
                status: "completed",
                checked_by: userId,
            },
        });
        return res.status(200).json({
            message: "Tenant checked in successfully",
            gatePass: updatedPass,
        });
    }
    catch (error) {
        console.error("Check in gate pass error:", error);
        return res.status(500).json({ error: "An error occurred during gate pass check-in" });
    }
};
exports.handleCheckIn = handleCheckIn;
