"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetRoomHistory = void 0;
const prisma_1 = require("../../../lib/prisma");
const handleGetRoomHistory = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const roomId = req.params.id;
    try {
        // Verify room exists in organization
        const roomExists = await prisma_1.prisma.room.findFirst({
            where: {
                id: roomId,
                org_id: orgId,
            },
        });
        if (!roomExists) {
            return res.status(404).json({ error: "Room not found in this organization" });
        }
        // Fetch assignment history
        const history = await prisma_1.prisma.roomAssignmentHistory.findMany({
            where: {
                room_id: roomId,
                org_id: orgId,
            },
            orderBy: {
                assigned_at: "desc",
            },
            include: {
                tenant: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });
        return res.status(200).json({
            roomId,
            roomNumber: roomExists.room_number,
            history,
        });
    }
    catch (error) {
        console.error("Get room history error:", error);
        return res.status(500).json({ error: "An error occurred while fetching room assignment history" });
    }
};
exports.handleGetRoomHistory = handleGetRoomHistory;
