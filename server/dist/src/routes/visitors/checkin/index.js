"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const handler_1 = require("./handler");
const auth_1 = require("../../../middleware/auth");
const orgAccess_1 = require("../../../middleware/orgAccess");
const router = (0, express_1.Router)({ mergeParams: true });
router.post("/:id/check-in", auth_1.authenticateJWT, (0, orgAccess_1.checkOrgAccess)(["owner", "warden", "guard"]), handler_1.handleVisitorCheckIn);
exports.default = router;
