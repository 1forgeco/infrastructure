"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleVisitorCheckOut = void 0;
const prisma_1 = require("../../../lib/prisma");
const client_1 = require("../../../../generated/prisma/client");
const handleVisitorCheckOut = async (req, res) => {
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
        if (!visitor.actual_in_time) {
            return res.status(400).json({ error: "Cannot check out visitor. Visitor has not checked in yet." });
        }
        if (visitor.actual_out_time) {
            return res.status(400).json({ error: "Visitor has already checked out" });
        }
        const updatedVisitor = await prisma_1.prisma.visitor.update({
            where: { id },
            data: {
                actual_out_time: new Date(),
                status: client_1.VisitStatus.completed,
            },
        });
        return res.status(200).json({
            message: "Visitor check-out logged successfully",
            visitor: updatedVisitor,
        });
    }
    catch (error) {
        console.error("Visitor check-out error:", error);
        return res.status(500).json({ error: "An error occurred logging visitor check-out" });
    }
};
exports.handleVisitorCheckOut = handleVisitorCheckOut;
