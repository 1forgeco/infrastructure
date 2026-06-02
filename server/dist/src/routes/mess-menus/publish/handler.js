"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePublishMessMenu = void 0;
const prisma_1 = require("../../../lib/prisma");
const handlePublishMessMenu = async (req, res) => {
    const orgId = req.headers["x-org-id"];
    const menuId = req.params.id;
    try {
        const existingMenu = await prisma_1.prisma.messMenu.findFirst({
            where: {
                id: menuId,
                org_id: orgId,
            },
        });
        if (!existingMenu) {
            return res.status(404).json({ error: "Mess menu not found" });
        }
        const updatedMenu = await prisma_1.prisma.messMenu.update({
            where: {
                id: menuId,
            },
            data: {
                is_published: true,
            },
        });
        return res.status(200).json({
            message: "Mess menu published successfully",
            menu: updatedMenu,
        });
    }
    catch (error) {
        console.error("Publish mess menu error:", error);
        return res.status(500).json({ error: "An error occurred while publishing the mess menu" });
    }
};
exports.handlePublishMessMenu = handlePublishMessMenu;
