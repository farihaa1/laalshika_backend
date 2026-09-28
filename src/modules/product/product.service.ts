import AppError from "../../error/AppError";
import { IProductVariant, IProductSpecification } from "./product.interface";
import Product from "./product.model";

interface ProductQuery {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
  limit?: string;
  isActive?: string;
  isFeatured?: string;
}

interface CreateProductPayload {
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  discountPrice?: number;
  images: string[];
  variants?: IProductVariant[];
  stock: number;
  specifications?: IProductSpecification[];
  isFeatured?: boolean;
  isActive?: boolean;
}

type UpdateProductPayload = Partial<CreateProductPayload>;

const createProduct = async (payload: CreateProductPayload) => {
  const existingProduct = await Product.findOne({
    $or: [
      {
        slug: payload.slug,
      },
      {
        name: payload.name,
      },
    ],
  });

  if (existingProduct) {
    if (existingProduct.slug === payload.slug) {
      throw new AppError(409, "A product with this slug already exists");
    }

    throw new AppError(409, "A product with this name already exists");
  }

  const product = await Product.create(payload);

  return product;
};

const getProducts = async (query: ProductQuery) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    sort = "newest",
    page = "1",
    limit = "12",
    isActive,
    isFeatured,
  } = query;

  const pageNumber = Math.max(Number(page) || 1, 1);

  const limitNumber = Math.min(Math.max(Number(limit) || 12, 1), 50);

  const skip = (pageNumber - 1) * limitNumber;

  const filter: {
    isActive?: boolean;
    isFeatured?: boolean;
    $or?: Array<Record<string, unknown>>;
    $and?: Array<Record<string, unknown>>;
    category?: string;
  } = {};

  /*
   * ACTIVE FILTER
   *
   * Public shop normally sends nothing,
   * so we keep active products by default.
   *
   * Admin can explicitly request:
   * ?isActive=true
   * ?isActive=false
   */
  if (isActive === "true") {
    filter.isActive = true;
  } else if (isActive === "false") {
    filter.isActive = false;
  } else {
    // Default for public product listing
    filter.isActive = true;
  }

  /*
   * FEATURED FILTER
   *
   * ?isFeatured=true
   * ?isFeatured=false
   */
  if (isFeatured === "true") {
    filter.isFeatured = true;
  } else if (isFeatured === "false") {
    filter.isFeatured = false;
  }

  /*
   * SEARCH
   */
  if (search?.trim()) {
    const searchRegex = search.trim();

    filter.$or = [
      {
        name: {
          $regex: searchRegex,
          $options: "i",
        },
      },
      {
        description: {
          $regex: searchRegex,
          $options: "i",
        },
      },
      {
        category: {
          $regex: searchRegex,
          $options: "i",
        },
      },
    ];
  }

  /*
   * CATEGORY
   */
  if (category?.trim()) {
    filter.category = category.trim();
  }

  /*
   * PRICE FILTER
   */
  if (minPrice || maxPrice) {
    filter.$and = [];

    if (minPrice) {
      filter.$and.push({
        $or: [
          {
            discountPrice: {
              $gte: Number(minPrice),
            },
          },
          {
            discountPrice: {
              $exists: false,
            },
            price: {
              $gte: Number(minPrice),
            },
          },
        ],
      });
    }

    if (maxPrice) {
      filter.$and.push({
        $or: [
          {
            discountPrice: {
              $lte: Number(maxPrice),
            },
          },
          {
            discountPrice: {
              $exists: false,
            },
            price: {
              $lte: Number(maxPrice),
            },
          },
        ],
      });
    }
  }

  /*
   * SORTING
   */
  let sortOption: Record<string, 1 | -1> = {
    createdAt: -1,
  };

  switch (sort) {
    case "price-low":
      sortOption = {
        price: 1,
      };
      break;

    case "price-high":
      sortOption = {
        price: -1,
      };
      break;

    case "rating":
      sortOption = {
        rating: -1,
      };
      break;

    case "popular":
      sortOption = {
        reviewCount: -1,
      };
      break;

    case "newest":
    default:
      sortOption = {
        createdAt: -1,
      };
      break;
  }

  /*
   * FETCH PRODUCTS
   */
  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortOption).skip(skip).limit(limitNumber).lean(),

    Product.countDocuments(filter),
  ]);

  return {
    products,

    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

const getProductBySlug = async (slug: string) => {
  const product = await Product.findOne({
    slug,
    isActive: true,
  });

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  return product;
};

const getRelatedProducts = async (productId: string, category: string) => {
  return Product.find({
    _id: {
      $ne: productId,
    },

    category,

    isActive: true,
  })
    .limit(8)
    .sort({
      createdAt: -1,
    });
};

const updateProduct = async (
  productId: string,
  payload: UpdateProductPayload,
) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  /*
   * CHECK SLUG DUPLICATE
   */
  if (payload.slug) {
    const existingProduct = await Product.findOne({
      slug: payload.slug,

      _id: {
        $ne: productId,
      },
    });

    if (existingProduct) {
      throw new AppError(409, "A product with this slug already exists");
    }
  }

  /*
   * CHECK DISCOUNT PRICE
   */
  const finalPrice = payload.price ?? product.price;

  const finalDiscountPrice = payload.discountPrice ?? product.discountPrice;

  if (finalDiscountPrice !== undefined && finalDiscountPrice >= finalPrice) {
    throw new AppError(400, "Discount price must be less than regular price");
  }

  const updatedProduct = await Product.findByIdAndUpdate(productId, payload, {
    new: true,
    runValidators: true,
  });

  return updatedProduct;
};

const deleteProduct = async (productId: string) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  product.isActive = false;

  await product.save();

  return product;
};

export const productService = {
  createProduct,
  getProducts,
  getProductBySlug,
  getRelatedProducts,
  updateProduct,
  deleteProduct,
};
