"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetMessMenu = void 0;
const prisma_1 = require("../../../lib/prisma");
// Helper to get the Monday of the week for a given date in UTC
const getUTCWeekMonday = (d) => {
    const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const day = date.getUTCDay();
    const diff = date.getUTCDate() - day + (day === 0 ? -6 : 1); // Monday is 1, Sunday is 0 -> shift Sunday to -6
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), diff));
};
const handleGetMessMenu = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const dateStr = req.query.date;
    const date = dateStr ? new Date(dateStr) : new Date();
    if (isNaN(date.getTime())) {
        return res.status(400).json({ error: "Invalid date query parameter" });
    }
    const normalizedMonday = getUTCWeekMonday(date);
    try {
        const isPrivileged = req.userOrgRole === "owner" || req.userOrgRole === "warden";
        const menu = await prisma_1.prisma.messMenu.findFirst({
            where: {
                org_id: orgId,
                week_start_date: normalizedMonday,
                ...(isPrivileged ? {} : { is_published: true }),
            },
            include: {
                items: true,
            },
        });
        if (!menu) {
            return res.status(404).json({
                message: "No mess menu found for the requested week",
                weekStartDate: normalizedMonday,
            });
        }
        return res.status(200).json({
            menu,
        });
    }
    catch (error) {
        console.error("Get mess menu error:", error);
        return res.status(500).json({ error: "An error occurred while fetching the mess menu" });
    }
};
exports.handleGetMessMenu = handleGetMessMenu;
