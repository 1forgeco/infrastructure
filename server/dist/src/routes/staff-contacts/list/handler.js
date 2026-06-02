"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleListStaffContacts = void 0;
const prisma_1 = require("../../../lib/prisma");
const handleListStaffContacts = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const isEmergencyQuery = req.query.isEmergency;
    try {
        const whereClause = {
            org_id: orgId,
            is_active: true,
        };
        if (isEmergencyQuery !== undefined) {
            whereClause.is_emergency = isEmergencyQuery === "true";
        }
        const staffContacts = await prisma_1.prisma.staffContact.findMany({
            where: whereClause,
            orderBy: {
                name: "asc",
            },
        });
        return res.status(200).json({
            staffContacts,
        });
    }
    catch (error) {
        console.error("List staff contacts error:", error);
        return res.status(500).json({ error: "An error occurred while listing staff contacts" });
    }
};
exports.handleListStaffContacts = handleListStaffContacts;
