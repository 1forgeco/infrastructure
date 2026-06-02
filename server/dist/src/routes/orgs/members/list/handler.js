"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleListMembers = void 0;
const prisma_1 = require("../../../../lib/prisma");
const handleListMembers = async (req, res) => {
    const orgId = req.params.orgId;
    if (!orgId) {
        return res.status(400).json({ error: "Missing orgId parameter" });
    }
    try {
        const members = await prisma_1.prisma.userOrgRole.findMany({
            where: {
                org_id: orgId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        phone: true,
                        profile_photo_url: true,
                        is_active: true,
                    },
                },
            },
            orderBy: {
                role: "asc",
            },
        });
        const formattedMembers = members.map((member) => ({
            userId: member.user_id,
            fullName: member.user.full_name,
            email: member.user.email,
            phone: member.user.phone,
            profilePhotoUrl: member.user.profile_photo_url,
            role: member.role,
            isRoleActive: member.is_active,
            isUserActive: member.user.is_active,
            assignedAt: member.created_at,
        }));
        return res.status(200).json({
            members: formattedMembers,
        });
    }
    catch (error) {
        console.error("List members error:", error);
        return res.status(500).json({ error: "An error occurred fetching members list" });
    }
};
exports.handleListMembers = handleListMembers;
