"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCreateStaffContact = void 0;
const prisma_1 = require("../../../lib/prisma");
const client_1 = require("../../../../generated/prisma/client");
const handleCreateStaffContact = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const { name, phone, roleType, userId, isEmergency } = req.body;
    if (!name || !phone || !roleType) {
        return res.status(400).json({
            error: "Missing required fields (name, phone, roleType)",
        });
    }
    // Validate roleType enum
    const validRoleTypes = Object.values(client_1.StaffRoleType);
    if (!validRoleTypes.includes(roleType)) {
        return res.status(400).json({
            error: `Invalid roleType. Must be one of: ${validRoleTypes.join(", ")}`,
        });
    }
    try {
        // If userId is provided, verify the user exists
        if (userId) {
            const userExists = await prisma_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!userExists) {
                return res.status(400).json({ error: "Provided userId does not exist" });
            }
        }
        // Create Staff Contact
        const staffContact = await prisma_1.prisma.staffContact.create({
            data: {
                org_id: orgId,
                user_id: userId || null,
                name,
                phone,
                role_type: roleType,
                is_emergency: isEmergency || false,
                is_active: true,
            },
        });
        return res.status(201).json({
            message: "Staff contact created successfully",
            staffContact,
        });
    }
    catch (error) {
        console.error("Create staff contact error:", error);
        return res.status(500).json({ error: "An error occurred while creating staff contact" });
    }
};
exports.handleCreateStaffContact = handleCreateStaffContact;
