"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAssignComplaint = void 0;
const prisma_1 = require("../../../lib/prisma");
const handleAssignComplaint = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const id = req.params.id;
    const { assignedToUserId } = req.body;
    if (!id) {
        return res.status(400).json({ error: "Missing complaint ID parameter" });
    }
    if (!assignedToUserId) {
        return res.status(400).json({ error: "Missing assignedToUserId in request body" });
    }
    try {
        // Check if complaint exists in this organization
        const complaint = await prisma_1.prisma.complaint.findFirst({
            where: {
                id,
                org_id: orgId,
            },
        });
        if (!complaint) {
            return res.status(404).json({ error: "Complaint not found in this organization" });
        }
        // Verify assigned user is part of the organization
        const assignedUserRole = await prisma_1.prisma.userOrgRole.findFirst({
            where: {
                user_id: assignedToUserId,
                org_id: orgId,
                is_active: true,
            },
        });
        if (!assignedUserRole) {
            return res.status(400).json({ error: "The assigned user does not belong to this organization" });
        }
        // Update Complaint assignment
        const updatedComplaint = await prisma_1.prisma.complaint.update({
            where: { id },
            data: {
                assigned_to: assignedToUserId,
            },
        });
        return res.status(200).json({
            message: "Complaint successfully assigned",
            complaint: updatedComplaint,
        });
    }
    catch (error) {
        console.error("Assign complaint error:", error);
        return res.status(500).json({ error: "An error occurred assigning the complaint" });
    }
};
exports.handleAssignComplaint = handleAssignComplaint;
