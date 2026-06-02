"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleReadAnnouncement = void 0;
const prisma_1 = require("../../../lib/prisma");
const handleReadAnnouncement = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const userId = req.user?.userId;
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ error: "Missing announcement ID parameter" });
    }
    try {
        // Check if the announcement exists in this organization
        const announcement = await prisma_1.prisma.announcement.findFirst({
            where: {
                id,
                org_id: orgId,
            },
        });
        if (!announcement) {
            return res.status(404).json({ error: "Announcement not found in this organization" });
        }
        // Register read receipt
        await prisma_1.prisma.announcementRead.upsert({
            where: {
                announcement_id_user_id: {
                    announcement_id: id,
                    user_id: userId,
                },
            },
            update: {}, // if exists, do nothing
            create: {
                announcement_id: id,
                user_id: userId,
            },
        });
        return res.status(200).json({
            message: "Announcement marked as read",
        });
    }
    catch (error) {
        console.error("Read announcement error:", error);
        return res.status(500).json({ error: "An error occurred marking the announcement as read" });
    }
};
exports.handleReadAnnouncement = handleReadAnnouncement;
