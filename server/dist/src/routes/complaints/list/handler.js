"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleListComplaints = void 0;
const prisma_1 = require("../../../lib/prisma");
const handleListComplaints = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const userId = req.user?.userId;
    const userRole = req.userOrgRole;
    const { status, category, priority } = req.query;
    const whereClause = {
        org_id: orgId,
    };
    // Enforce tenant isolation
    if (userRole === "tenant") {
        whereClause.tenant_id = userId;
    }
    if (status) {
        whereClause.status = status;
    }
    if (category) {
        whereClause.category = category;
    }
    if (priority) {
        whereClause.priority = priority;
    }
    try {
        const complaints = await prisma_1.prisma.complaint.findMany({
            where: whereClause,
            include: {
                tenant: {
                    select: {
                        id: true,
                        full_name: true,
                    },
                },
                assigned_to_user: {
                    select: {
                        id: true,
                        full_name: true,
                    },
                },
                updates: {
                    orderBy: { created_at: "desc" },
                    include: {
                        updated_by_user: {
                            select: {
                                full_name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                created_at: "desc",
            },
        });
        return res.status(200).json({ complaints });
    }
    catch (error) {
        console.error("List complaints error:", error);
        return res.status(500).json({ error: "An error occurred fetching complaints list" });
    }
};
exports.handleListComplaints = handleListComplaints;
