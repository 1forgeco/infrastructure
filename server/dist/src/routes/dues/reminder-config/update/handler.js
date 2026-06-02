"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpdateDueReminderConfig = void 0;
const prisma_1 = require("../../../../lib/prisma");
const handleUpdateDueReminderConfig = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const { reminderDays, sendWhatsapp, sendPush, sendSms, sendToParent, isActive } = req.body;
    // Validate reminderDays array if provided
    if (reminderDays !== undefined) {
        if (!Array.isArray(reminderDays)) {
            return res.status(400).json({ error: "reminderDays must be an array of integers" });
        }
        for (const day of reminderDays) {
            if (!Number.isInteger(day) || day < 1 || day > 31) {
                return res.status(400).json({ error: "Each day in reminderDays must be an integer between 1 and 31" });
            }
        }
    }
    try {
        // Build update/create payload
        const dataCreate = {
            org_id: orgId,
            reminder_days: reminderDays || [1, 5, 10],
            send_whatsapp: sendWhatsapp !== undefined ? !!sendWhatsapp : true,
            send_push: sendPush !== undefined ? !!sendPush : true,
            send_sms: sendSms !== undefined ? !!sendSms : false,
            send_to_parent: sendToParent !== undefined ? !!sendToParent : true,
            is_active: isActive !== undefined ? !!isActive : true,
        };
        const dataUpdate = {};
        if (reminderDays !== undefined)
            dataUpdate.reminder_days = reminderDays;
        if (sendWhatsapp !== undefined)
            dataUpdate.send_whatsapp = !!sendWhatsapp;
        if (sendPush !== undefined)
            dataUpdate.send_push = !!sendPush;
        if (sendSms !== undefined)
            dataUpdate.send_sms = !!sendSms;
        if (sendToParent !== undefined)
            dataUpdate.send_to_parent = !!sendToParent;
        if (isActive !== undefined)
            dataUpdate.is_active = !!isActive;
        const config = await prisma_1.prisma.dueReminderConfig.upsert({
            where: {
                org_id: orgId,
            },
            create: dataCreate,
            update: dataUpdate,
        });
        return res.status(200).json({
            message: "Due reminder configurations updated successfully",
            config,
        });
    }
    catch (error) {
        console.error("Update due reminder config error:", error);
        return res.status(500).json({ error: "An error occurred while updating due reminder config" });
    }
};
exports.handleUpdateDueReminderConfig = handleUpdateDueReminderConfig;
