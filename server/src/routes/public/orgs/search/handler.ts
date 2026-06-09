import { Request, Response } from "express";
import { prisma } from "../../../../lib/prisma";

/**
 * GET /api/public/orgs/search?q=<name>
 * Unauthenticated — returns matching active organizations for the landing page search.
 */
export const handleSearchOrgs = async (req: Request, res: Response) => {
  const q = (req.query.q as string || "").trim();

  if (!q || q.length < 2) {
    return res.status(200).json({ organizations: [] });
  }

  try {
    const organizations = await prisma.organization.findMany({
      where: {
        is_active: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
          { city_state: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        city_state: true,
        logo_url: true,
        brand_color: true,
        tagline: true,
      },
      orderBy: { name: "asc" },
      take: 10,
    });

    return res.status(200).json({ organizations });
  } catch (error) {
    console.error("Public org search error:", error);
    return res.status(500).json({ error: "An error occurred during search" });
  }
};
