"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleListRooms = void 0;
const prisma_1 = require("../../../lib/prisma");
const handleListRooms = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const { floorId, status, roomType } = req.query;
    // Build filters dynamically
    const whereClause = {
        org_id: orgId,
        is_active: true,
    };
    if (floorId) {
        whereClause.floor_id = floorId;
    }
    if (status) {
        whereClause.status = status;
    }
    if (roomType) {
        whereClause.room_type = roomType;
    }
    try {
        const rooms = await prisma_1.prisma.room.findMany({
            where: whereClause,
            orderBy: { room_number: "asc" },
            include: {
                floor: {
                    select: {
                        floor_number: true,
                        floor_name: true,
                    },
                },
            },
        });
        return res.status(200).json({ rooms });
    }
    catch (error) {
        console.error("List rooms error:", error);
        return res.status(500).json({ error: "An error occurred fetching rooms list" });
    }
};
exports.handleListRooms = handleListRooms;
