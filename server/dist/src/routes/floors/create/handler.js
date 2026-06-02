"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCreateFloor = void 0;
const prisma_1 = require("../../../lib/prisma");
const handleCreateFloor = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const { floorNumber, floorName } = req.body;
    if (floorNumber === undefined || !floorName) {
        return res.status(400).json({ error: "Missing required fields (floorNumber, floorName)" });
    }
    const parsedFloorNum = parseInt(floorNumber, 10);
    if (isNaN(parsedFloorNum)) {
        return res.status(400).json({ error: "floorNumber must be a valid integer" });
    }
    try {
        // Check if floor number already exists in the organization
        const existingFloor = await prisma_1.prisma.floor.findUnique({
            where: {
                org_id_floor_number: {
                    org_id: orgId,
                    floor_number: parsedFloorNum,
                },
            },
        });
        if (existingFloor) {
            return res.status(400).json({
                error: `Floor number ${parsedFloorNum} already exists in this organization.`,
            });
        }
        // Create Floor
        const floor = await prisma_1.prisma.floor.create({
            data: {
                org_id: orgId,
                floor_number: parsedFloorNum,
                floor_name: floorName,
            },
        });
        return res.status(201).json({
            message: "Floor created successfully",
            floor,
        });
    }
    catch (error) {
        console.error("Create floor error:", error);
        return res.status(500).json({ error: "An error occurred during floor creation" });
    }
};
exports.handleCreateFloor = handleCreateFloor;
