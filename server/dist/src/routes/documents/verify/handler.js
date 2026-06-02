"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleVerifyDocument = void 0;
const prisma_1 = require("../../../lib/prisma");
const handleVerifyDocument = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const verifiedByUserId = req.user?.userId;
    const documentId = req.params.id;
    const { isVerified } = req.body;
    // Default to true if isVerified isn't explicitly provided
    const targetVerificationStatus = isVerified === undefined ? true : !!isVerified;
    try {
        // Verify document exists and belongs to the current org
        const document = await prisma_1.prisma.document.findFirst({
            where: {
                id: documentId,
                org_id: orgId,
            },
        });
        if (!document) {
            return res.status(404).json({ error: "Document not found" });
        }
        // Update document verification fields
        const updatedDocument = await prisma_1.prisma.document.update({
            where: {
                id: documentId,
            },
            data: {
                is_verified: targetVerificationStatus,
                verified_by: targetVerificationStatus ? verifiedByUserId : null,
                verified_at: targetVerificationStatus ? new Date() : null,
            },
        });
        return res.status(200).json({
            message: targetVerificationStatus ? "Document verified successfully" : "Document verification removed",
            document: updatedDocument,
        });
    }
    catch (error) {
        console.error("Verify document error:", error);
        return res.status(500).json({ error: "An error occurred while verifying the document" });
    }
};
exports.handleVerifyDocument = handleVerifyDocument;
