export interface ICartVariant {
  color?: string;
  size?: string;
  sku?: string;
}

export interface ICartItem {
  productId: string;
  name: string;
  slug: string;

  // Always a string.
  // If no image exists, use "".
  image: string;

  price: number;
  quantity: number;

  variant?: ICartVariant;
}

export interface ICart {
  user: string;
  items: ICartItem[];
}
