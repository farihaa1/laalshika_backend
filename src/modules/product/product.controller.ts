import { Request, Response } from "express";

import { productService } from "./product.service";
import { catchAsync } from "../utils/catchAsync";
import { sendResponse } from "../utils/sendResponse";


const createProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Product created successfully",
    data: product,
  });
});

const getProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await productService.getProducts(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Products retrieved successfully",
    data: result,
  });
});

const getCategories = catchAsync(async (_req: Request, res: Response) => {
  const categories = await productService.getCategories();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Categories retrieved successfully",
    data: categories,
  });
});

const getProductBySlug = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.getProductBySlug(
    req.params.slug as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product retrieved successfully",
    data: product,
  });
});

const getRelatedProducts = catchAsync(async (req: Request, res: Response) => {
  const products = await productService.getRelatedProducts(
    req.params.id as string,
    req.query.category as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Related products retrieved successfully",
    data: products,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.updateProduct(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product updated successfully",
    data: product,
  });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.deleteProduct(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product deleted successfully",
    data: product,
  });
});

export const productController = {
  createProduct,
  getProducts,
  getCategories,
  getProductBySlug,
  getRelatedProducts,
  updateProduct,
  deleteProduct,
};
