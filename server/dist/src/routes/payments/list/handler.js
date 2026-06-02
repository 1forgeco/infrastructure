"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleListPayments = void 0;
const prisma_1 = require("../../../lib/prisma");
const handleListPayments = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const userId = req.user?.userId;
    const userRole = req.userOrgRole;
    const { tenantId, dueId } = req.query;
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
    if (dueId) {
        whereClause.due_id = dueId;
    }
    try {
        const payments = await prisma_1.prisma.payment.findMany({
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
                due: {
                    select: {
                        due_type: true,
                        amount: true,
                        due_date: true,
                    },
                },
                paid_by_user: {
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
        return res.status(200).json({ payments });
    }
    catch (error) {
        console.error("List payments error:", error);
        return res.status(500).json({ error: "An error occurred fetching payments list" });
    }
};
exports.handleListPayments = handleListPayments;
