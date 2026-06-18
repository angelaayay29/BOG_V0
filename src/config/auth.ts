import type { UserRole } from "../types/issue";

// Simulated demo credentials — replace with real auth backend later.
export const DEMO_CREDENTIALS: Record<UserRole, { email: string; password: string }> = {
  editor: {
    email: "editor@guest360.local",
    password: "guest360-edit",
  },
  viewer: {
    email: "viewer@guest360.local",
    password: "guest360-view",
  },
};

export const SESSION_STORAGE_KEY = "bog360-auth-session";
