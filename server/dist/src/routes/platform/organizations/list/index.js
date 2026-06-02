"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const handler_1 = require("./handler");
const platformAuth_1 = require("../../../../middleware/platformAuth");
const router = (0, express_1.Router)();
router.get("/", platformAuth_1.authenticatePlatformJWT, handler_1.handleListOrganizations);
exports.default = router;
