import { Router } from "express";
import { handleSearchOrgs } from "./handler";

const router = Router();

// GET /api/public/orgs/search?q=<query>
router.get("/", handleSearchOrgs);

export default router;
