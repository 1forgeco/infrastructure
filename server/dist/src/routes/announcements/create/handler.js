"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCreateAnnouncement = void 0;
const prisma_1 = require("../../../lib/prisma");
const client_1 = require("../../../../generated/prisma/client");
const handleCreateAnnouncement = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const createdBy = req.user?.userId;
    const { title, body, targetType, targetId, sendPush, sendWhatsapp } = req.body;
    if (!title || !body || !targetType) {
        return res.status(400).json({
            error: "Missing required fields (title, body, targetType)",
        });
    }
    // Validate targetType enum
    const validTargetTypes = Object.values(client_1.AnnouncementTargetType);
    if (!validTargetTypes.includes(targetType)) {
        return res.status(400).json({ error: `Invalid targetType. Must be one of: ${validTargetTypes.join(", ")}` });
    }
    if (targetType !== "all" && !targetId) {
        return res.status(400).json({ error: "targetId is required when targetType is not 'all'" });
    }
    try {
        // Create Announcement
        const announcement = await prisma_1.prisma.announcement.create({
            data: {
                org_id: orgId,
                created_by: createdBy,
                title,
                body,
                target_type: targetType,
                target_id: targetId || null,
                send_push: sendPush || false,
                send_whatsapp: sendWhatsapp || false,
            },
        });
        return res.status(201).json({
            message: "Announcement published successfully",
            announcement,
        });
    }
    catch (error) {
        console.error("Create announcement error:", error);
        return res.status(500).json({ error: "An error occurred publishing the announcement" });
    }
};
exports.handleCreateAnnouncement = handleCreateAnnouncement;
