"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUploadDocument = void 0;
const prisma_1 = require("../../../lib/prisma");
const client_1 = require("../../../../generated/prisma/client");
const handleUploadDocument = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const loggedInUserId = req.user?.userId;
    const { docType, fileUrl, fileName, tenantId } = req.body;
    if (!docType || !fileUrl || !fileName) {
        return res.status(400).json({
            error: "Missing required fields (docType, fileUrl, fileName)",
        });
    }
    // Validate docType enum
    const validDocTypes = Object.values(client_1.DocType);
    if (!validDocTypes.includes(docType)) {
        return res.status(400).json({
            error: `Invalid docType. Must be one of: ${validDocTypes.join(", ")}`,
        });
    }
    let targetTenantId = tenantId;
    // Enforce role-based tenant target rules
    if (req.userOrgRole === "tenant") {
        // Tenants can only upload documents for themselves
        targetTenantId = loggedInUserId;
    }
    else {
        // Owners and wardens must specify a tenantId and verify the tenant belongs to the org
        if (!targetTenantId) {
            return res.status(400).json({
                error: "tenantId is required when uploading as a warden or owner",
            });
        }
    }
    try {
        // Verify target user is a tenant in the current organization
        const tenantOrgRole = await prisma_1.prisma.userOrgRole.findFirst({
            where: {
                user_id: targetTenantId,
                org_id: orgId,
                role: "tenant",
                is_active: true,
            },
        });
        if (!tenantOrgRole) {
            return res.status(400).json({
                error: "The specified user is not an active tenant in this organization",
            });
        }
        // Create Document record
        const document = await prisma_1.prisma.document.create({
            data: {
                org_id: orgId,
                tenant_id: targetTenantId,
                doc_type: docType,
                file_url: fileUrl,
                file_name: fileName,
                uploaded_by: loggedInUserId,
                is_verified: false,
            },
        });
        return res.status(201).json({
            message: "Document uploaded successfully",
            document,
        });
    }
    catch (error) {
        console.error("Upload document error:", error);
        return res.status(500).json({ error: "An error occurred while uploading the document" });
    }
};
exports.handleUploadDocument = handleUploadDocument;
