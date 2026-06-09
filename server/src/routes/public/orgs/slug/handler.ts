import { Request, Response } from "express";
import { prisma } from "../../../../lib/prisma";

/**
 * GET /api/public/orgs/:slug
 * Unauthenticated — returns a single org's public branding info for the tenant login page.
 */
export const handleGetOrgBySlug = async (req: Request, res: Response) => {
  const slug = req.params.slug as string;

  if (!slug) {
    return res.status(400).json({ error: "Slug is required" });
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        city_state: true,
        logo_url: true,
        brand_color: true,
        tagline: true,
        is_active: true,
      },
    });

    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    if (!org.is_active) {
      return res.status(403).json({ error: "Organization is not active" });
    }

    return res.status(200).json({ organization: org });
  } catch (error) {
    console.error("Get org by slug error:", error);
    return res.status(500).json({ error: "An error occurred" });
  }
};
