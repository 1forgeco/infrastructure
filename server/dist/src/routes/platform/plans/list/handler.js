"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleListPlans = void 0;
const prisma_1 = require("../../../../lib/prisma");
const handleListPlans = async (req, res) => {
    try {
        const plans = await prisma_1.prisma.plan.findMany({
            orderBy: {
                price_monthly: "asc",
            },
        });
        return res.status(200).json({
            plans,
        });
    }
    catch (error) {
        console.error("List plans error:", error);
        return res.status(500).json({ error: "An error occurred while listing subscription plans" });
    }
};
exports.handleListPlans = handleListPlans;
