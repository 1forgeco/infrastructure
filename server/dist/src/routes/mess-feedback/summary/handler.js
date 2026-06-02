"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetMessFeedbackSummary = void 0;
const prisma_1 = require("../../../lib/prisma");
const handleGetMessFeedbackSummary = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const menuId = req.query.menuId;
    if (!menuId) {
        return res.status(400).json({ error: "Missing required query parameter: menuId" });
    }
    try {
        // Verify menu exists and belongs to the current org
        const menu = await prisma_1.prisma.messMenu.findFirst({
            where: {
                id: menuId,
                org_id: orgId,
            },
        });
        if (!menu) {
            return res.status(404).json({ error: "Mess menu not found in this organization" });
        }
        // Fetch menu items along with their feedback ratings
        const menuItems = await prisma_1.prisma.messMenuItem.findMany({
            where: {
                menu_id: menuId,
            },
            include: {
                feedback: {
                    select: {
                        rating: true,
                    },
                },
            },
            orderBy: [
                { day_of_week: "asc" },
            ],
        });
        const summary = menuItems.map((item) => {
            let likes = 0;
            let dislikes = 0;
            item.feedback.forEach((f) => {
                if (f.rating === "up")
                    likes++;
                else if (f.rating === "down")
                    dislikes++;
            });
            const total = likes + dislikes;
            const satisfactionRate = total > 0 ? Math.round((likes / total) * 100) : 0;
            return {
                menuItemId: item.id,
                dayOfWeek: item.day_of_week,
                mealType: item.meal_type,
                items: item.items,
                stats: {
                    likes,
                    dislikes,
                    totalFeedback: total,
                    satisfactionRate, // percentage
                },
            };
        });
        return res.status(200).json({
            menuId,
            weekStartDate: menu.week_start_date,
            summary,
        });
    }
    catch (error) {
        console.error("Get mess feedback summary error:", error);
        return res.status(500).json({ error: "An error occurred while generating the feedback summary" });
    }
};
exports.handleGetMessFeedbackSummary = handleGetMessFeedbackSummary;
