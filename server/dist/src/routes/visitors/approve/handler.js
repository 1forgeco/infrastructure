"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleApproveVisitor = void 0;
const prisma_1 = require("../../../lib/prisma");
const handleApproveVisitor = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const userId = req.user?.userId;
    const userRole = req.userOrgRole;
    const id = req.params.id;
    const { status } = req.body;
    if (!id) {
        return res.status(400).json({ error: "Missing visitor record ID parameter" });
    }
    if (!status || (status !== "approved" && status !== "rejected")) {
        return res.status(400).json({ error: "Invalid status. Must be 'approved' or 'rejected'." });
    }
    try {
        const visitor = await prisma_1.prisma.visitor.findFirst({
            where: {
                id,
                org_id: orgId,
            },
        });
        if (!visitor) {
            return res.status(404).json({ error: "Visitor record not found in this organization" });
        }
        if (visitor.status !== "pending") {
            return res.status(400).json({ error: `Cannot change status. Visitor status is currently '${visitor.status}'` });
        }
        // Check permissions: Owner/Warden can approve any; Tenant can only approve if they are the host
        const isOwnerOrWarden = userRole === "owner" || userRole === "warden";
        const isHostTenant = visitor.tenant_id === userId;
        if (!isOwnerOrWarden && !isHostTenant) {
            return res.status(403).json({ error: "Access denied. Only owners, wardens, or the host tenant can approve this request." });
        }
        const updatedVisitor = await prisma_1.prisma.visitor.update({
            where: { id },
            data: {
                status: status,
                approved_by: userId,
            },
        });
        return res.status(200).json({
            message: `Visitor successfully ${status}`,
            visitor: updatedVisitor,
        });
    }
    catch (error) {
        console.error("Approve visitor error:", error);
        return res.status(500).json({ error: "An error occurred during visitor approval" });
    }
};
exports.handleApproveVisitor = handleApproveVisitor;
