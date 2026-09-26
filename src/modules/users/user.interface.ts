import { UserRole } from "./user.constrain";

export interface IUser {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}
