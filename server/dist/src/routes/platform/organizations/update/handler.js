"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpdateOrganization = void 0;
const prisma_1 = require("../../../../lib/prisma");
const client_1 = require("../../../../../generated/prisma/client");
const handleUpdateOrganization = async (req, res) => {
    const orgId = req.params.id;
    const { planId, planStatus, planExpiresAt, isActive, totalCapacity } = req.body;
    try {
        // 1. Verify organization exists
        const organization = await prisma_1.prisma.organization.findUnique({
            where: { id: orgId },
        });
        if (!organization) {
            return res.status(404).json({ error: "Organization not found" });
        }
        // 2. Validate update fields
        const updateData = {};
        if (planId !== undefined) {
            const planExists = await prisma_1.prisma.plan.findUnique({
                where: { id: planId },
            });
            if (!planExists) {
                return res.status(400).json({ error: "Selected plan does not exist" });
            }
            updateData.plan_id = planId;
        }
        if (planStatus !== undefined) {
            const validStatuses = Object.values(client_1.PlanStatus);
            if (!validStatuses.includes(planStatus)) {
                return res.status(400).json({
                    error: `Invalid planStatus. Must be one of: ${validStatuses.join(", ")}`,
                });
            }
            updateData.plan_status = planStatus;
        }
        if (planExpiresAt !== undefined) {
            updateData.plan_expires_at = planExpiresAt ? new Date(planExpiresAt) : null;
            if (updateData.plan_expires_at && isNaN(updateData.plan_expires_at.getTime())) {
                return res.status(400).json({ error: "Invalid date format for planExpiresAt" });
            }
        }
        if (isActive !== undefined)
            updateData.is_active = !!isActive;
        if (totalCapacity !== undefined) {
            const capacityInt = parseInt(totalCapacity, 10);
            if (isNaN(capacityInt) || capacityInt < 0) {
                return res.status(400).json({ error: "totalCapacity must be a non-negative integer" });
            }
            updateData.total_capacity = capacityInt;
        }
        // 3. Perform update
        const updatedOrg = await prisma_1.prisma.organization.update({
            where: {
                id: orgId,
            },
            data: updateData,
            include: {
                plan: true,
            },
        });
        return res.status(200).json({
            message: "Organization subscription updated successfully",
            organization: updatedOrg,
        });
    }
    catch (error) {
        console.error("Update organization error:", error);
        return res.status(500).json({ error: "An error occurred while updating organization settings" });
    }
};
exports.handleUpdateOrganization = handleUpdateOrganization;
