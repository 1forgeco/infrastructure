"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleListFloors = void 0;
const prisma_1 = require("../../../lib/prisma");
const handleListFloors = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    try {
        const floors = await prisma_1.prisma.floor.findMany({
            where: { org_id: orgId },
            orderBy: { floor_number: "asc" },
            include: {
                rooms: {
                    where: { is_active: true },
                    select: {
                        id: true,
                        room_number: true,
                        room_type: true,
                        capacity: true,
                        current_occupancy: true,
                        status: true,
                        monthly_rent: true,
                    },
                },
            },
        });
        // Enriched floors list with summary statistics
        const enrichedFloors = floors.map((floor) => {
            let totalCapacity = 0;
            let currentOccupancy = 0;
            let totalRooms = floor.rooms.length;
            floor.rooms.forEach((room) => {
                totalCapacity += room.capacity;
                currentOccupancy += room.current_occupancy;
            });
            return {
                id: floor.id,
                floorNumber: floor.floor_number,
                floorName: floor.floor_name,
                createdAt: floor.created_at,
                statistics: {
                    totalRooms,
                    totalCapacity,
                    currentOccupancy,
                    availableBeds: Math.max(0, totalCapacity - currentOccupancy),
                },
                rooms: floor.rooms,
            };
        });
        return res.status(200).json({
            floors: enrichedFloors,
        });
    }
    catch (error) {
        console.error("List floors error:", error);
        return res.status(500).json({ error: "An error occurred fetching floors list" });
    }
};
exports.handleListFloors = handleListFloors;
