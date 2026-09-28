import { Types } from "mongoose";

export interface ICategory {
  name: string;
  slug: string;
  parent: Types.ObjectId | null;
  image?: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}
