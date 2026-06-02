"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpdateComplaintStatus = void 0;
const prisma_1 = require("../../../lib/prisma");
const client_1 = require("../../../../generated/prisma/client");
const handleUpdateComplaintStatus = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const userId = req.user?.userId;
    const userRole = req.userOrgRole;
    const id = req.params.id;
    const { status, note } = req.body;
    if (!id) {
        return res.status(400).json({ error: "Missing complaint ID parameter" });
    }
    if (!status) {
        return res.status(400).json({ error: "Missing status in request body" });
    }
    // Validate status
    const validStatuses = Object.values(client_1.ComplaintStatus);
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }
    try {
        // Check if complaint exists
        const complaint = await prisma_1.prisma.complaint.findFirst({
            where: {
                id,
                org_id: orgId,
            },
        });
        if (!complaint) {
            return res.status(404).json({ error: "Complaint not found in this organization" });
        }
        // Check authorization: Must be owner, warden, OR the assigned user of this complaint
        const isOwnerOrWarden = userRole === "owner" || userRole === "warden";
        const isAssignedToMe = complaint.assigned_to === userId;
        if (!isOwnerOrWarden && !isAssignedToMe) {
            return res.status(403).json({
                error: "Access denied. Only owners, wardens, or the assigned staff member can update status.",
            });
        }
        // Process update in a transaction
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            // 1. Update status
            const updatedComplaint = await tx.complaint.update({
                where: { id },
                data: {
                    status: status,
                    resolved_at: status === "resolved" ? new Date() : complaint.resolved_at,
                },
            });
            // 2. Create history log
            await tx.complaintUpdate.create({
                data: {
                    complaint_id: id,
                    updated_by: userId,
                    status: status,
                    note: note || null,
                },
            });
            return updatedComplaint;
        });
        return res.status(200).json({
            message: "Complaint status updated successfully",
            complaint: result,
        });
    }
    catch (error) {
        console.error("Update complaint status error:", error);
        return res.status(500).json({ error: "An error occurred updating the complaint status" });
    }
};
exports.handleUpdateComplaintStatus = handleUpdateComplaintStatus;
