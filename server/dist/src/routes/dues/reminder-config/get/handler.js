"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetDueReminderConfig = void 0;
const prisma_1 = require("../../../../lib/prisma");
const handleGetDueReminderConfig = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    try {
        const config = await prisma_1.prisma.dueReminderConfig.findUnique({
            where: {
                org_id: orgId,
            },
        });
        if (!config) {
            // Return system defaults if no custom config has been saved yet
            return res.status(200).json({
                config: {
                    org_id: orgId,
                    reminder_days: [1, 5, 10],
                    send_whatsapp: true,
                    send_push: true,
                    send_sms: false,
                    send_to_parent: true,
                    is_active: true,
                },
            });
        }
        return res.status(200).json({
            config,
        });
    }
    catch (error) {
        console.error("Get due reminder config error:", error);
        return res.status(500).json({ error: "An error occurred while fetching due reminder config" });
    }
};
exports.handleGetDueReminderConfig = handleGetDueReminderConfig;
