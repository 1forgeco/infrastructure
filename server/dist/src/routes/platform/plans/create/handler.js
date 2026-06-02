"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCreateOrUpdatePlan = void 0;
const prisma_1 = require("../../../../lib/prisma");
const client_1 = require("../../../../../generated/prisma/client");
const handleCreateOrUpdatePlan = async (req, res) => {
    const { name, tier, maxTenants, priceMonthly, features, isActive } = req.body;
    if (!name || !tier || maxTenants === undefined || priceMonthly === undefined) {
        return res.status(400).json({
            error: "Missing required fields (name, tier, maxTenants, priceMonthly)",
        });
    }
    // Validate tier enum
    const validTiers = Object.values(client_1.PlanTier);
    if (!validTiers.includes(tier)) {
        return res.status(400).json({
            error: `Invalid tier. Must be one of: ${validTiers.join(", ")}`,
        });
    }
    try {
        const plan = await prisma_1.prisma.plan.upsert({
            where: { name },
            create: {
                name,
                tier: tier,
                max_tenants: parseInt(maxTenants, 10),
                price_monthly: parseFloat(priceMonthly),
                features: features || {},
                is_active: isActive !== undefined ? !!isActive : true,
            },
            update: {
                tier: tier,
                max_tenants: parseInt(maxTenants, 10),
                price_monthly: parseFloat(priceMonthly),
                features: features || {},
                is_active: isActive !== undefined ? !!isActive : true,
            },
        });
        return res.status(200).json({
            message: "Subscription plan saved successfully",
            plan,
        });
    }
    catch (error) {
        console.error("Create or update plan error:", error);
        return res.status(500).json({ error: "An error occurred while saving the subscription plan" });
    }
};
exports.handleCreateOrUpdatePlan = handleCreateOrUpdatePlan;
