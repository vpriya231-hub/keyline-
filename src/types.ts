export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Application {
  id: string;
  userId: string;
  name: string;
  clientId: string;
  clientSecret: string;
  redirectUris: string[];
  allowedOrigins: string[];
  createdAt: string;
  status: "active" | "inactive";
}

export type ViewState = "landing" | "signup" | "signin" | "dashboard";
export type DashboardTab = "overview" | "applications" | "auth" | "database" | "storage" | "settings";
