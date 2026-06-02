"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const handler_1 = require("./handler");
const auth_1 = require("../../../middleware/auth");
const router = (0, express_1.Router)();
router.get("/", auth_1.authenticateJWT, handler_1.handleMe);
exports.default = router;
