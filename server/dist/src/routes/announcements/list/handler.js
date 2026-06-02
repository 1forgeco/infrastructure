"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleListAnnouncements = void 0;
const prisma_1 = require("../../../lib/prisma");
const client_1 = require("../../../../generated/prisma/client");
const handleListAnnouncements = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const userId = req.user?.userId;
    const userRole = req.userOrgRole;
    try {
        const whereClause = {
            org_id: orgId,
        };
        if (userRole === "tenant") {
            // Find tenant's profile to resolve their room and floor
            const tenantProfile = await prisma_1.prisma.tenantProfile.findFirst({
                where: {
                    user_id: userId,
                    org_id: orgId,
                    is_active: true,
                },
                include: {
                    room: true,
                },
            });
            const orConditions = [
                { target_type: client_1.AnnouncementTargetType.all },
                { target_type: client_1.AnnouncementTargetType.tenant, target_id: userId },
            ];
            if (tenantProfile) {
                // Target specific room
                orConditions.push({
                    target_type: client_1.AnnouncementTargetType.room,
                    target_id: tenantProfile.room_id,
                });
                // Target specific floor
                orConditions.push({
                    target_type: client_1.AnnouncementTargetType.floor,
                    target_id: tenantProfile.room.floor_id,
                });
            }
            whereClause.OR = orConditions;
        }
        const announcements = await prisma_1.prisma.announcement.findMany({
            where: whereClause,
            include: {
                created_by_user: {
                    select: {
                        full_name: true,
                        profile_photo_url: true,
                    },
                },
                reads: {
                    where: {
                        user_id: userId,
                    },
                    select: {
                        read_at: true,
                    },
                },
            },
            orderBy: {
                created_at: "desc",
            },
        });
        const formattedAnnouncements = announcements.map((ann) => ({
            id: ann.id,
            title: ann.title,
            body: ann.body,
            targetType: ann.target_type,
            targetId: ann.target_id,
            createdAt: ann.created_at,
            publisherName: ann.created_by_user.full_name,
            publisherPhoto: ann.created_by_user.profile_photo_url,
            isRead: ann.reads.length > 0,
            readAt: ann.reads.length > 0 ? ann.reads[0].read_at : null,
        }));
        return res.status(200).json({
            announcements: formattedAnnouncements,
        });
    }
    catch (error) {
        console.error("List announcements error:", error);
        return res.status(500).json({ error: "An error occurred fetching announcements feed" });
    }
};
exports.handleListAnnouncements = handleListAnnouncements;
