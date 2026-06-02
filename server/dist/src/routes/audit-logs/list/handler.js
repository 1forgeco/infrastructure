"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleListAuditLogs = void 0;
const prisma_1 = require("../../../lib/prisma");
const handleListAuditLogs = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const { userId, entityType } = req.query;
    try {
        const whereClause = {
            org_id: orgId,
        };
        if (userId) {
            whereClause.user_id = userId;
        }
        if (entityType) {
            whereClause.entity_type = entityType;
        }
        const auditLogs = await prisma_1.prisma.auditLog.findMany({
            where: whereClause,
            orderBy: {
                created_at: "desc",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                    },
                },
            },
        });
        return res.status(200).json({
            auditLogs,
        });
    }
    catch (error) {
        console.error("List audit logs error:", error);
        return res.status(500).json({ error: "An error occurred while listing audit logs" });
    }
};
exports.handleListAuditLogs = handleListAuditLogs;
