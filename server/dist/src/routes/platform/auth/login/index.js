"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const handler_1 = require("./handler");
const router = (0, express_1.Router)();
router.post("/login", handler_1.handlePlatformLogin);
exports.default = router;
