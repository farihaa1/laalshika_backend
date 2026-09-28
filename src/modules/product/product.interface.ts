export interface IProductVariantAttribute {
  name: string;
  value: string;
}

export interface IProductVariant {
  attributes: IProductVariantAttribute[];
  sku?: string;
  stock: number;
  price?: number;
  images?: string[];
}

export interface IProductSpecification {
  name: string;
  value: string;
}

export interface IProduct {
  _id?: string;

  name: string;

  slug: string;

  description: string;

  category: string;

  price: number;

  discountPrice?: number;

  images: string[];

  variants: IProductVariant[];

  stock: number;

  rating: number;

  reviewCount: number;

  specifications: IProductSpecification[];

  isFeatured: boolean;

  isActive: boolean;

  createdAt?: Date;

  updatedAt?: Date;
}
