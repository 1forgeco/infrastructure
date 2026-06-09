import { Router } from "express";
import { handleGetOrgBySlug } from "./handler";

const router = Router();

// GET /api/public/orgs/:slug
router.get("/:slug", handleGetOrgBySlug);

export default router;
