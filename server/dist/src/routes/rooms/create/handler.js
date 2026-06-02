"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCreateRoom = void 0;
const prisma_1 = require("../../../lib/prisma");
const client_1 = require("../../../../generated/prisma/client");
const handleCreateRoom = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const { floorId, roomNumber, roomType, capacity, monthlyRent } = req.body;
    if (!floorId || !roomNumber || !roomType || capacity === undefined || monthlyRent === undefined) {
        return res.status(400).json({
            error: "Missing required fields (floorId, roomNumber, roomType, capacity, monthlyRent)",
        });
    }
    // Validate room type enum
    const validRoomTypes = Object.values(client_1.RoomType);
    if (!validRoomTypes.includes(roomType)) {
        return res.status(400).json({ error: `Invalid roomType. Must be one of: ${validRoomTypes.join(", ")}` });
    }
    const parsedCapacity = parseInt(capacity, 10);
    const parsedRent = parseFloat(monthlyRent);
    if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
        return res.status(400).json({ error: "capacity must be a positive integer" });
    }
    if (isNaN(parsedRent) || parsedRent < 0) {
        return res.status(400).json({ error: "monthlyRent must be a valid non-negative number" });
    }
    try {
        // Check if the floor exists and belongs to the organization
        const floor = await prisma_1.prisma.floor.findFirst({
            where: {
                id: floorId,
                org_id: orgId,
            },
        });
        if (!floor) {
            return res.status(400).json({ error: "The selected floor does not exist in this organization" });
        }
        // Check if room number already exists in this organization
        const existingRoom = await prisma_1.prisma.room.findUnique({
            where: {
                org_id_room_number: {
                    org_id: orgId,
                    room_number: roomNumber,
                },
            },
        });
        if (existingRoom) {
            return res.status(400).json({
                error: `Room number ${roomNumber} already exists in this organization.`,
            });
        }
        // Create Room
        const room = await prisma_1.prisma.room.create({
            data: {
                org_id: orgId,
                floor_id: floorId,
                room_number: roomNumber,
                room_type: roomType,
                capacity: parsedCapacity,
                monthly_rent: parsedRent,
                current_occupancy: 0,
                status: "available",
                is_active: true,
            },
        });
        return res.status(201).json({
            message: "Room created successfully",
            room,
        });
    }
    catch (error) {
        console.error("Create room error:", error);
        return res.status(500).json({ error: "An error occurred during room creation" });
    }
};
exports.handleCreateRoom = handleCreateRoom;
