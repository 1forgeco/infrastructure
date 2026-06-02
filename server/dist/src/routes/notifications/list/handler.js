"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleListNotifications = void 0;
const prisma_1 = require("../../../lib/prisma");
const client_1 = require("../../../../generated/prisma/client");
const handleListNotifications = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const userId = req.user?.userId;
    const statusQuery = req.query.status;
    try {
        const whereClause = {
            org_id: orgId,
            user_id: userId,
        };
        if (statusQuery) {
            const validStatuses = Object.values(client_1.NotificationStatus);
            if (!validStatuses.includes(statusQuery)) {
                return res.status(400).json({
                    error: `Invalid status filter. Must be one of: ${validStatuses.join(", ")}`,
                });
            }
            whereClause.status = statusQuery;
        }
        const notifications = await prisma_1.prisma.notification.findMany({
            where: whereClause,
            orderBy: {
                created_at: "desc",
            },
        });
        return res.status(200).json({
            notifications,
        });
    }
    catch (error) {
        console.error("List notifications error:", error);
        return res.status(500).json({ error: "An error occurred while listing notifications" });
    }
};
exports.handleListNotifications = handleListNotifications;
