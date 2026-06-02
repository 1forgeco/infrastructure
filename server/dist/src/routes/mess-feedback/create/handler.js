"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCreateMessFeedback = void 0;
const prisma_1 = require("../../../lib/prisma");
const client_1 = require("../../../../generated/prisma/client");
const handleCreateMessFeedback = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const tenantId = req.user?.userId;
    const { menuItemId, rating, note } = req.body;
    if (!menuItemId || !rating) {
        return res.status(400).json({
            error: "Missing required fields (menuItemId, rating)",
        });
    }
    // Validate rating enum
    const validRatings = Object.values(client_1.FeedbackRating);
    if (!validRatings.includes(rating)) {
        return res.status(400).json({
            error: `Invalid rating. Must be one of: ${validRatings.join(", ")}`,
        });
    }
    try {
        // Verify menu item exists and belongs to the current org
        const menuItem = await prisma_1.prisma.messMenuItem.findFirst({
            where: {
                id: menuItemId,
                menu: {
                    org_id: orgId,
                },
            },
        });
        if (!menuItem) {
            return res.status(404).json({ error: "Mess menu item not found in this organization" });
        }
        // Upsert feedback
        const feedback = await prisma_1.prisma.messFeedback.upsert({
            where: {
                tenant_id_menu_item_id: {
                    tenant_id: tenantId,
                    menu_item_id: menuItemId,
                },
            },
            create: {
                org_id: orgId,
                tenant_id: tenantId,
                menu_item_id: menuItemId,
                rating: rating,
                note: note || null,
            },
            update: {
                rating: rating,
                note: note || null,
            },
        });
        return res.status(200).json({
            message: "Feedback submitted successfully",
            feedback,
        });
    }
    catch (error) {
        console.error("Submit mess feedback error:", error);
        return res.status(500).json({ error: "An error occurred while submitting feedback" });
    }
};
exports.handleCreateMessFeedback = handleCreateMessFeedback;
