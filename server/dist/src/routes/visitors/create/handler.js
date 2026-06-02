"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCreateVisitor = void 0;
const prisma_1 = require("../../../lib/prisma");
const client_1 = require("../../../../generated/prisma/client");
const handleCreateVisitor = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const userId = req.user?.userId;
    const userRole = req.userOrgRole;
    const { tenantId, visitorName, visitorPhone, visitorRelation, visitorIdProof, purpose, expectedVisitTime } = req.body;
    if (!tenantId || !visitorName || !visitorPhone || !visitorRelation || !purpose || !expectedVisitTime) {
        return res.status(400).json({
            error: "Missing required fields (tenantId, visitorName, visitorPhone, visitorRelation, purpose, expectedVisitTime)",
        });
    }
    // Tenant restriction check
    if (userRole === "tenant" && tenantId !== userId) {
        return res.status(403).json({ error: "Access denied. Tenants can only request visitors for themselves." });
    }
    const visitTime = new Date(expectedVisitTime);
    if (isNaN(visitTime.getTime())) {
        return res.status(400).json({ error: "Invalid expectedVisitTime date format" });
    }
    try {
        // Verify target tenant belongs to the organization
        const tenantProfile = await prisma_1.prisma.tenantProfile.findFirst({
            where: {
                user_id: tenantId,
                org_id: orgId,
                is_active: true,
            },
        });
        if (!tenantProfile) {
            return res.status(400).json({ error: "The host tenant does not have an active profile in this organization" });
        }
        // Set initial status
        // If registered by tenant -> pending (requires warden approval)
        // If registered by owner/warden/guard -> approved
        const initialStatus = userRole === "owner" || userRole === "warden" || userRole === "guard"
            ? client_1.VisitStatus.approved
            : client_1.VisitStatus.pending;
        // Create Visitor record
        const visitor = await prisma_1.prisma.visitor.create({
            data: {
                org_id: orgId,
                tenant_id: tenantId,
                visitor_name: visitorName,
                visitor_phone: visitorPhone,
                visitor_relation: visitorRelation,
                visitor_id_proof: visitorIdProof || null,
                purpose,
                expected_visit_time: visitTime,
                status: initialStatus,
                approved_by: initialStatus === client_1.VisitStatus.approved ? userId : null,
            },
        });
        return res.status(201).json({
            message: "Visitor record created successfully",
            visitor,
        });
    }
    catch (error) {
        console.error("Create visitor record error:", error);
        return res.status(500).json({ error: "An error occurred creating the visitor record" });
    }
};
exports.handleCreateVisitor = handleCreateVisitor;
