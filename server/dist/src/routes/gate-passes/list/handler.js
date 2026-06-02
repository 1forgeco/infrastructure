"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleListPasses = void 0;
const prisma_1 = require("../../../lib/prisma");
const handleListPasses = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const userId = req.user?.userId;
    const userRole = req.userOrgRole;
    const { status, tenantId } = req.query;
    // Build filter dynamically
    const whereClause = {
        org_id: orgId,
    };
    // If the user is a tenant, restrict query to their own passes
    if (userRole === "tenant") {
        whereClause.tenant_id = userId;
    }
    else {
        // Admins/Guards can filter by a specific tenant
        if (tenantId) {
            whereClause.tenant_id = tenantId;
        }
    }
    if (status) {
        whereClause.status = status;
    }
    try {
        const gatePasses = await prisma_1.prisma.gatePass.findMany({
            where: whereClause,
            include: {
                tenant: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        phone: true,
                    },
                },
                approved_by_user: {
                    select: {
                        id: true,
                        full_name: true,
                    },
                },
                checked_by_user: {
                    select: {
                        id: true,
                        full_name: true,
                    },
                },
            },
            orderBy: {
                created_at: "desc",
            },
        });
        return res.status(200).json({ gatePasses });
    }
    catch (error) {
        console.error("List gate passes error:", error);
        return res.status(500).json({ error: "An error occurred fetching gate passes list" });
    }
};
exports.handleListPasses = handleListPasses;
