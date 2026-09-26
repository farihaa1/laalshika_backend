import AppError from "../../error/AppError";
import { Product } from "./product.model";

interface ProductQuery {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
  limit?: string;
}

const createProduct = async (payload: any) => {
  const existingProduct = await Product.findOne({
    $or: [{ slug: payload.slug }, { name: payload.name }],
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
  } = query;

  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.min(Math.max(Number(limit) || 12, 1), 50);

  const skip = (pageNumber - 1) * limitNumber;

  const filter: Record<string, any> = {
    isActive: true,
  };

  // Search
  if (search?.trim()) {
    filter.$or = [
      {
        name: {
          $regex: search.trim(),
          $options: "i",
        },
      },
      {
        description: {
          $regex: search.trim(),
          $options: "i",
        },
      },
      {
        category: {
          $regex: search.trim(),
          $options: "i",
        },
      },
    ];
  }

  // Category
  if (category?.trim()) {
    filter.category = category.trim();
  }

  // Price
  if (minPrice || maxPrice) {
    filter.$and = filter.$and || [];

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

  // Sorting
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
  }

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

const getCategories = async () => {
  return Product.distinct("category", {
    isActive: true,
  });
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

const updateProduct = async (productId: string, payload: any) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError(404, "Product not found");
  }

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

  // Soft delete
  product.isActive = false;

  await product.save();

  return product;
};

export const productService = {
  createProduct,
  getProducts,
  getCategories,
  getProductBySlug,
  getRelatedProducts,
  updateProduct,
  deleteProduct,
};
