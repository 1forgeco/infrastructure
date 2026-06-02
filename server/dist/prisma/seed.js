"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("../generated/prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("Seeding plans...");
    const plans = [
        {
            name: "Starter Plan",
            tier: "starter",
            max_tenants: 20,
            price_monthly: 0.0,
            features: {
                gate_pass: true,
                visitor_log: true,
                complaints: true,
                mess_menu: false,
                analytics: false,
            },
        },
        {
            name: "Growth Plan",
            tier: "growth",
            max_tenants: 100,
            price_monthly: 49.0,
            features: {
                gate_pass: true,
                visitor_log: true,
                complaints: true,
                mess_menu: true,
                analytics: true,
            },
        },
        {
            name: "Pro Plan",
            tier: "pro",
            max_tenants: 500,
            price_monthly: 149.0,
            features: {
                gate_pass: true,
                visitor_log: true,
                complaints: true,
                mess_menu: true,
                analytics: true,
                multi_property: true,
            },
        },
    ];
    for (const plan of plans) {
        await prisma.plan.upsert({
            where: { name: plan.name },
            update: {},
            create: {
                name: plan.name,
                tier: plan.tier,
                max_tenants: plan.max_tenants,
                price_monthly: plan.price_monthly,
                features: plan.features,
                is_active: true,
            },
        });
    }
    console.log("Plans seeded successfully!");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
