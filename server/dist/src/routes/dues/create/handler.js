"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCreateDue = void 0;
const prisma_1 = require("../../../lib/prisma");
const client_1 = require("../../../../generated/prisma/client");
const handleCreateDue = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const createdBy = req.user?.userId;
    const { tenantId, dueType, amount, description, dueDate, billingMonth } = req.body;
    if (!tenantId || !dueType || amount === undefined || !dueDate || !billingMonth) {
        return res.status(400).json({
            error: "Missing required fields (tenantId, dueType, amount, dueDate, billingMonth)",
        });
    }
    // Validate dueType enum
    const validDueTypes = Object.values(client_1.DueType);
    if (!validDueTypes.includes(dueType)) {
        return res.status(400).json({ error: `Invalid dueType. Must be one of: ${validDueTypes.join(", ")}` });
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: "amount must be a positive number" });
    }
    const parsedDueDate = new Date(dueDate);
    const parsedBillingMonth = new Date(billingMonth);
    if (isNaN(parsedDueDate.getTime()) || isNaN(parsedBillingMonth.getTime())) {
        return res.status(400).json({ error: "Invalid date format for dueDate or billingMonth" });
    }
    try {
        // Verify tenant exists and has active role in organization
        const tenantRole = await prisma_1.prisma.userOrgRole.findFirst({
            where: {
                user_id: tenantId,
                org_id: orgId,
                role: "tenant",
                is_active: true,
            },
        });
        if (!tenantRole) {
            return res.status(400).json({ error: "Selected user is not an active tenant in this organization" });
        }
        // Create Due
        const due = await prisma_1.prisma.due.create({
            data: {
                org_id: orgId,
                tenant_id: tenantId,
                due_type: dueType,
                amount: parsedAmount,
                amount_paid: 0,
                description: description || null,
                due_date: parsedDueDate,
                billing_month: parsedBillingMonth,
                status: "unpaid",
                created_by: createdBy,
            },
        });
        return res.status(201).json({
            message: "Due generated successfully",
            due,
        });
    }
    catch (error) {
        console.error("Create due error:", error);
        return res.status(500).json({ error: "An error occurred during due creation" });
    }
};
exports.handleCreateDue = handleCreateDue;
