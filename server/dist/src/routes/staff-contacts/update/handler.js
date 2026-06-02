"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpdateStaffContact = void 0;
const prisma_1 = require("../../../lib/prisma");
const client_1 = require("../../../../generated/prisma/client");
const handleUpdateStaffContact = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const contactId = req.params.id;
    const { name, phone, roleType, userId, isEmergency, isActive } = req.body;
    try {
        // Verify contact exists and belongs to the current organization
        const existingContact = await prisma_1.prisma.staffContact.findFirst({
            where: {
                id: contactId,
                org_id: orgId,
            },
        });
        if (!existingContact) {
            return res.status(404).json({ error: "Staff contact not found" });
        }
        // Build update payload
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (phone !== undefined)
            updateData.phone = phone;
        if (roleType !== undefined) {
            // Validate roleType enum
            const validRoleTypes = Object.values(client_1.StaffRoleType);
            if (!validRoleTypes.includes(roleType)) {
                return res.status(400).json({
                    error: `Invalid roleType. Must be one of: ${validRoleTypes.join(", ")}`,
                });
            }
            updateData.role_type = roleType;
        }
        if (userId !== undefined) {
            if (userId !== null) {
                const userExists = await prisma_1.prisma.user.findUnique({
                    where: { id: userId },
                });
                if (!userExists) {
                    return res.status(400).json({ error: "Provided userId does not exist" });
                }
            }
            updateData.user_id = userId;
        }
        if (isEmergency !== undefined)
            updateData.is_emergency = isEmergency;
        if (isActive !== undefined)
            updateData.is_active = isActive;
        // Perform update
        const updatedContact = await prisma_1.prisma.staffContact.update({
            where: {
                id: contactId,
            },
            data: updateData,
        });
        return res.status(200).json({
            message: "Staff contact updated successfully",
            staffContact: updatedContact,
        });
    }
    catch (error) {
        console.error("Update staff contact error:", error);
        return res.status(500).json({ error: "An error occurred while updating the staff contact" });
    }
};
exports.handleUpdateStaffContact = handleUpdateStaffContact;
