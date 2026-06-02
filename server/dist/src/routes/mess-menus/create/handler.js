"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCreateMessMenu = void 0;
const prisma_1 = require("../../../lib/prisma");
const client_1 = require("../../../../generated/prisma/client");
const handleCreateMessMenu = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const createdBy = req.user?.userId;
    const { weekStartDate, items } = req.body;
    if (!weekStartDate || !items || !Array.isArray(items)) {
        return res.status(400).json({
            error: "Missing required fields (weekStartDate, items as Array)",
        });
    }
    const date = new Date(weekStartDate);
    if (isNaN(date.getTime())) {
        return res.status(400).json({ error: "Invalid weekStartDate" });
    }
    // Normalize to UTC date to prevent timezone shifts
    const normalizedDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    // Validate items
    const validDays = Object.values(client_1.DayOfWeek);
    const validMeals = Object.values(client_1.MealType);
    for (const item of items) {
        if (!item.dayOfWeek || !item.mealType || !Array.isArray(item.items)) {
            return res.status(400).json({
                error: "Each item must have dayOfWeek, mealType, and items as an array of strings",
            });
        }
        if (!validDays.includes(item.dayOfWeek)) {
            return res.status(400).json({
                error: `Invalid dayOfWeek: ${item.dayOfWeek}. Must be one of: ${validDays.join(", ")}`,
            });
        }
        if (!validMeals.includes(item.mealType)) {
            return res.status(400).json({
                error: `Invalid mealType: ${item.mealType}. Must be one of: ${validMeals.join(", ")}`,
            });
        }
        if (item.items.some((i) => typeof i !== "string")) {
            return res.status(400).json({ error: "Meal items must be strings" });
        }
    }
    try {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            // Upsert the weekly menu
            const menu = await tx.messMenu.upsert({
                where: {
                    org_id_week_start_date: {
                        org_id: orgId,
                        week_start_date: normalizedDate,
                    },
                },
                create: {
                    org_id: orgId,
                    week_start_date: normalizedDate,
                    created_by: createdBy,
                    is_published: false,
                },
                update: {
                // Keep current status, but mark updated_at
                },
            });
            // Upsert all the meal items in the menu
            for (const item of items) {
                await tx.messMenuItem.upsert({
                    where: {
                        menu_id_day_of_week_meal_type: {
                            menu_id: menu.id,
                            day_of_week: item.dayOfWeek,
                            meal_type: item.mealType,
                        },
                    },
                    create: {
                        menu_id: menu.id,
                        day_of_week: item.dayOfWeek,
                        meal_type: item.mealType,
                        items: item.items,
                    },
                    update: {
                        items: item.items,
                    },
                });
            }
            // Fetch complete menu with all its items
            return tx.messMenu.findUnique({
                where: { id: menu.id },
                include: {
                    items: true,
                },
            });
        });
        return res.status(200).json({
            message: "Mess menu saved successfully",
            menu: result,
        });
    }
    catch (error) {
        console.error("Create mess menu error:", error);
        return res.status(500).json({ error: "An error occurred while saving the mess menu" });
    }
};
exports.handleCreateMessMenu = handleCreateMessMenu;
