// Public branding data for an organization — returned by unauthenticated APIs
export interface OrgPublic {
  id: string;
  name: string;
  slug: string;
  city_state: string;
  logo_url: string | null;
  brand_color: string | null;
  tagline: string | null;
}

// Credentials sent to POST /api/auth/login
export interface LoginCredentials {
  username: string; // email or phone
  password: string;
}

// A role entry attached to the logged-in user
export interface UserRole {
  orgId: string;
  orgName: string;
  orgSlug: string;
  role: "owner" | "warden" | "guard" | "staff" | "tenant" | "parent";
}

// Logged-in user object
export interface AuthUser {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  profilePhotoUrl: string | null;
}

// Full login API response
export interface LoginResponse {
  message: string;
  user: AuthUser;
  roles: UserRole[];
  accessToken: string;
  refreshToken: string;
}
