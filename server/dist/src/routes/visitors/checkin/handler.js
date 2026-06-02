"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleVisitorCheckIn = void 0;
const prisma_1 = require("../../../lib/prisma");
const handleVisitorCheckIn = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ error: "Missing visitor record ID parameter" });
    }
    try {
        const visitor = await prisma_1.prisma.visitor.findFirst({
            where: {
                id,
                org_id: orgId,
            },
        });
        if (!visitor) {
            return res.status(404).json({ error: "Visitor record not found in this organization" });
        }
        if (visitor.status !== "approved") {
            return res.status(400).json({
                error: `Cannot check in visitor. Status is currently '${visitor.status}' (must be 'approved').`,
            });
        }
        if (visitor.actual_in_time) {
            return res.status(400).json({ error: "Visitor has already checked in" });
        }
        const updatedVisitor = await prisma_1.prisma.visitor.update({
            where: { id },
            data: {
                actual_in_time: new Date(),
            },
        });
        return res.status(200).json({
            message: "Visitor check-in logged successfully",
            visitor: updatedVisitor,
        });
    }
    catch (error) {
        console.error("Visitor check-in error:", error);
        return res.status(500).json({ error: "An error occurred logging visitor check-in" });
    }
};
exports.handleVisitorCheckIn = handleVisitorCheckIn;
