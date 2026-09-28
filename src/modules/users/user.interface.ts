import { UserRole } from "./user.constrain";

export interface IUser {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  googleId?: string;
  authProvider: "local" | "google";
  role: UserRole;
}
