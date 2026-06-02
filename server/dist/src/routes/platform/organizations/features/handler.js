"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleToggleOrgFeatures = void 0;
const prisma_1 = require("../../../../lib/prisma");
const handleToggleOrgFeatures = async (req, res) => {
    const orgId = req.params.id;
    const { featureKey, isEnabled } = req.body;
    if (!featureKey || isEnabled === undefined) {
        return res.status(400).json({ error: "Missing required fields (featureKey, isEnabled)" });
    }
    try {
        // 1. Verify organization exists
        const organization = await prisma_1.prisma.organization.findUnique({
            where: { id: orgId },
        });
        if (!organization) {
            return res.status(404).json({ error: "Organization not found" });
        }
        // 2. Fetch the owner of the organization to satisfy User foreign key constraint on updated_by
        const ownerRole = await prisma_1.prisma.userOrgRole.findFirst({
            where: {
                org_id: orgId,
                role: "owner",
                is_active: true,
            },
        });
        if (!ownerRole) {
            return res.status(400).json({
                error: "Cannot toggle features. No active owner account was found for this organization to log updates.",
            });
        }
        // 3. Upsert feature toggle
        const orgFeature = await prisma_1.prisma.orgFeature.upsert({
            where: {
                org_id_feature_key: {
                    org_id: orgId,
                    feature_key: featureKey,
                },
            },
            create: {
                org_id: orgId,
                feature_key: featureKey,
                is_enabled: !!isEnabled,
                updated_by: ownerRole.user_id,
            },
            update: {
                is_enabled: !!isEnabled,
                updated_by: ownerRole.user_id,
            },
        });
        return res.status(200).json({
            message: "Organization feature toggled successfully",
            orgFeature,
        });
    }
    catch (error) {
        console.error("Toggle org features error:", error);
        return res.status(500).json({ error: "An error occurred while toggling the organization feature" });
    }
};
exports.handleToggleOrgFeatures = handleToggleOrgFeatures;
