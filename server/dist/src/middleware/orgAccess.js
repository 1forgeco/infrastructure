"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOrgAccess = void 0;
const prisma_1 = require("../lib/prisma");
const checkOrgAccess = (allowedRoles) => {
    return async (req, res, next) => {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        // Try to retrieve orgId from header, request params, body, or query params
        const orgId = req.headers["x-org-id"] ||
            req.params.orgId ||
            req.body.orgId ||
            req.query.orgId;
        if (!orgId) {
            return res.status(400).json({ error: "Missing x-org-id header or orgId parameter" });
        }
        try {
            // Look up user role in this organization
            const userOrgRole = await prisma_1.prisma.userOrgRole.findFirst({
                where: {
                    user_id: userId,
                    org_id: orgId,
                    is_active: true,
                },
            });
            if (!userOrgRole) {
                return res.status(403).json({ error: "Access denied. You do not belong to this organization." });
            }
            // Check if user's role is allowed
            if (!allowedRoles.includes(userOrgRole.role)) {
                return res.status(403).json({
                    error: `Access denied. Requires one of the following roles: ${allowedRoles.join(", ")}`,
                });
            }
            // Set/normalize headers and attach the role to the request
            req.headers["x-org-id"] = orgId;
            req.userOrgRole = userOrgRole.role;
            next();
        }
        catch (error) {
            console.error("Organization access check error:", error);
            return res.status(500).json({ error: "Internal server error during authorization check" });
        }
    };
};
exports.checkOrgAccess = checkOrgAccess;
