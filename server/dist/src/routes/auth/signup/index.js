"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const handler_1 = require("./handler");
const router = (0, express_1.Router)();
router.post("/", handler_1.handleSignup);
exports.default = router;
