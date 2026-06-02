"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const handler_1 = require("./handler");
const auth_1 = require("../../../../middleware/auth");
const router = (0, express_1.Router)();
router.post("/", auth_1.authenticateJWT, handler_1.handleCreateInvite);
exports.default = router;
