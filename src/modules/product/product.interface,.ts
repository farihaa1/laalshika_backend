export interface IProductVariant {
  name: string;
  value: string;
  stock: number;
}

export interface IProduct {
  name: string;
  slug: string;
  description: string;
  category: string;

  price: number;
  discountPrice?: number;

  images: string[];

  variants?: IProductVariant[];

  stock: number;

  rating: number;
  reviewCount: number;

  specifications?: {
    key: string;
    value: string;
  }[];

  isFeatured: boolean;
  isActive: boolean;
}
