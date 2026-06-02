"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleReadNotification = void 0;
const prisma_1 = require("../../../lib/prisma");
const handleReadNotification = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const userId = req.user?.userId;
    const notificationId = req.params.id;
    try {
        // Verify notification belongs to the user and the org
        const notification = await prisma_1.prisma.notification.findFirst({
            where: {
                id: notificationId,
                org_id: orgId,
                user_id: userId,
            },
        });
        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }
        // Update status to read
        const updatedNotification = await prisma_1.prisma.notification.update({
            where: {
                id: notificationId,
            },
            data: {
                status: "read",
                read_at: new Date(),
            },
        });
        return res.status(200).json({
            message: "Notification marked as read",
            notification: updatedNotification,
        });
    }
    catch (error) {
        console.error("Read notification error:", error);
        return res.status(500).json({ error: "An error occurred while marking notification as read" });
    }
};
exports.handleReadNotification = handleReadNotification;
