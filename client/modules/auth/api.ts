import api from "@/lib/axios";
import type { LoginCredentials, LoginResponse, OrgPublic } from "./types";

/**
 * Search organizations by name/slug for the landing page search box.
 * GET /api/public/orgs/search?q=<query>
 */
export async function searchOrgs(q: string): Promise<OrgPublic[]> {
  const res = await api.get<{ organizations: OrgPublic[] }>(
    "/api/public/orgs/search",
    { params: { q } }
  );
  return res.data.organizations;
}

/**
 * Fetch a single org's public branding by slug.
 * GET /api/public/orgs/:slug
 * Returns null if the org doesn't exist.
 */
export async function getOrgBySlug(slug: string): Promise<OrgPublic | null> {
  try {
    const res = await api.get<{ organization: OrgPublic }>(
      `/api/public/orgs/${slug}`
    );
    return res.data.organization;
  } catch {
    return null;
  }
}

/**
 * Authenticate a user (email or phone + password).
 * POST /api/auth/login
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/api/auth/login", credentials);
  return res.data;
}
