"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleListVisitors = void 0;
const prisma_1 = require("../../../lib/prisma");
const handleListVisitors = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const userId = req.user?.userId;
    const userRole = req.userOrgRole;
    const { status, tenantId } = req.query;
    const whereClause = {
        org_id: orgId,
    };
    // Enforce tenant isolation
    if (userRole === "tenant") {
        whereClause.tenant_id = userId;
    }
    else {
        if (tenantId) {
            whereClause.tenant_id = tenantId;
        }
    }
    if (status) {
        whereClause.status = status;
    }
    try {
        const visitors = await prisma_1.prisma.visitor.findMany({
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
            },
            orderBy: {
                expected_visit_time: "desc",
            },
        });
        return res.status(200).json({ visitors });
    }
    catch (error) {
        console.error("List visitors error:", error);
        return res.status(500).json({ error: "An error occurred fetching visitor logs" });
    }
};
exports.handleListVisitors = handleListVisitors;
