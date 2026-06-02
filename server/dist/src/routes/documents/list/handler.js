"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleListDocuments = void 0;
const prisma_1 = require("../../../lib/prisma");
const handleListDocuments = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const loggedInUserId = req.user?.userId;
    const queryTenantId = req.query.tenantId;
    try {
        const whereClause = {
            org_id: orgId,
        };
        if (req.userOrgRole === "tenant") {
            // Tenants can only view their own documents
            whereClause.tenant_id = loggedInUserId;
        }
        else {
            // Owners and wardens can view all or filter by tenantId
            if (queryTenantId) {
                whereClause.tenant_id = queryTenantId;
            }
        }
        const documents = await prisma_1.prisma.document.findMany({
            where: whereClause,
            orderBy: {
                created_at: "desc",
            },
        });
        return res.status(200).json({
            documents,
        });
    }
    catch (error) {
        console.error("List documents error:", error);
        return res.status(500).json({ error: "An error occurred while listing documents" });
    }
};
exports.handleListDocuments = handleListDocuments;
