"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const handler_1 = require("./handler");
const auth_1 = require("../../../middleware/auth");
const orgAccess_1 = require("../../../middleware/orgAccess");
const router = (0, express_1.Router)();
router.post("/", auth_1.authenticateJWT, (0, orgAccess_1.checkOrgAccess)(["tenant"]), handler_1.handleCreateMessFeedback);
exports.default = router;
