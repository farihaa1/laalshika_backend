import AppError from "../../error/AppError";
import { Category } from "./category.model";

interface CategoryQuery {
  search?: string;
  parent?: string;
  activeOnly?: string;
}

interface CreateCategoryPayload {
  name: string;
  slug: string;
  parent?: string | null;
  image?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

const createCategory = async (payload: CreateCategoryPayload) => {
  const existingSlug = await Category.findOne({
    slug: payload.slug,
  });

  if (existingSlug) {
    throw new AppError(409, "A category with this slug already exists");
  }

  const parentId = payload.parent ?? null;

  const existingName = await Category.findOne({
    name: payload.name.trim(),
    parent: parentId,
  });

  if (existingName) {
    throw new AppError(
      409,
      "A category with this name already exists in this level",
    );
  }

  if (parentId) {
    const parentCategory = await Category.findById(parentId);

    if (!parentCategory) {
      throw new AppError(404, "Parent category not found");
    }

    if (!parentCategory.isActive) {
      throw new AppError(
        400,
        "Cannot create a category under an inactive parent",
      );
    }
  }

  const category = await Category.create({
    ...payload,
    name: payload.name.trim(),
    parent: parentId,
  });

  return category;
};

const getCategories = async (query: CategoryQuery) => {
  const { search, parent, activeOnly = "true" } = query;

  const filter: {
    name?: {
      $regex: string;
      $options: string;
    };
    parent?: string | null;
    isActive?: boolean;
  } = {};

  if (search?.trim()) {
    filter.name = {
      $regex: search.trim(),
      $options: "i",
    };
  }

  if (parent === "root") {
    filter.parent = null;
  } else if (parent) {
    filter.parent = parent;
  }

  if (activeOnly === "true") {
    filter.isActive = true;
  }

  return Category.find(filter)
    .populate("parent", "name slug")
    .sort({
      sortOrder: 1,
      name: 1,
    })
    .lean();
};

const getCategoryById = async (categoryId: string) => {
  const category = await Category.findById(categoryId)
    .populate("parent", "name slug")
    .lean();

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  return category;
};

const updateCategory = async (
  categoryId: string,
  payload: UpdateCategoryPayload,
) => {
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  if (payload.slug) {
    const existingSlug = await Category.findOne({
      slug: payload.slug,
      _id: {
        $ne: categoryId,
      },
    });

    if (existingSlug) {
      throw new AppError(409, "A category with this slug already exists");
    }
  }

  if (payload.name !== undefined) {
    const parentId =
      payload.parent !== undefined
        ? payload.parent
        : (category.parent?.toString() ?? null);

    const existingName = await Category.findOne({
      name: payload.name.trim(),
      parent: parentId,
      _id: {
        $ne: categoryId,
      },
    });

    if (existingName) {
      throw new AppError(
        409,
        "A category with this name already exists in this level",
      );
    }
  }

  if (payload.parent !== undefined) {
    if (payload.parent && payload.parent === categoryId) {
      throw new AppError(400, "A category cannot be its own parent");
    }

    if (payload.parent) {
      const parentCategory = await Category.findById(payload.parent);

      if (!parentCategory) {
        throw new AppError(404, "Parent category not found");
      }

      if (!parentCategory.isActive) {
        throw new AppError(400, "Cannot use an inactive category as parent");
      }

      let currentParent = parentCategory.parent?.toString() ?? null;

      while (currentParent) {
        if (currentParent === categoryId) {
          throw new AppError(400, "Circular category hierarchy is not allowed");
        }

        const ancestor = await Category.findById(currentParent);

        if (!ancestor?.parent) {
          break;
        }

        currentParent = ancestor.parent.toString();
      }
    }
  }

  const updateData = {
    ...payload,
    ...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
  };

  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    updateData,
    {
      new: true,
      runValidators: true,
    },
  ).populate("parent", "name slug");

  return updatedCategory;
};

const deleteCategory = async (categoryId: string) => {
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  const childCategory = await Category.findOne({
    parent: categoryId,
    isActive: true,
  });

  if (childCategory) {
    throw new AppError(
      400,
      "Cannot delete a category that has active subcategories",
    );
  }

  category.isActive = false;

  await category.save();

  return category;
};

export const categoryService = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
