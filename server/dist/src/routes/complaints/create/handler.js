"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCreateComplaint = void 0;
const prisma_1 = require("../../../lib/prisma");
const client_1 = require("../../../../generated/prisma/client");
const handleCreateComplaint = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const userId = req.user?.userId;
    const { category, title, description, priority, photoUrls } = req.body;
    if (!category || !title || !description) {
        return res.status(400).json({
            error: "Missing required fields (category, title, description)",
        });
    }
    // Validate category
    const validCategories = Object.values(client_1.ComplaintCategory);
    if (!validCategories.includes(category)) {
        return res.status(400).json({ error: `Invalid category. Must be one of: ${validCategories.join(", ")}` });
    }
    // Validate priority
    if (priority) {
        const validPriorities = Object.values(client_1.ComplaintPriority);
        if (!validPriorities.includes(priority)) {
            return res.status(400).json({ error: `Invalid priority. Must be one of: ${validPriorities.join(", ")}` });
        }
    }
    try {
        // Verify user is an active tenant in the organization
        const tenant = await prisma_1.prisma.tenantProfile.findFirst({
            where: {
                user_id: userId,
                org_id: orgId,
                is_active: true,
            },
        });
        if (!tenant) {
            return res.status(403).json({ error: "Only active tenants can file complaints" });
        }
        // Create Complaint
        const complaint = await prisma_1.prisma.complaint.create({
            data: {
                org_id: orgId,
                tenant_id: userId,
                category: category,
                title,
                description,
                priority: priority || "medium",
                photo_urls: photoUrls || [],
                status: "open",
            },
        });
        return res.status(201).json({
            message: "Complaint registered successfully",
            complaint,
        });
    }
    catch (error) {
        console.error("Create complaint error:", error);
        return res.status(500).json({ error: "An error occurred creating the complaint" });
    }
};
exports.handleCreateComplaint = handleCreateComplaint;
