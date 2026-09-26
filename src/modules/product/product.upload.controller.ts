import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import cloudinary from "../../config/cloudinary";
import config from "../../config";

const getUploadSignature = catchAsync(async (_req: Request, res: Response) => {
  const timestamp = Math.round(new Date().getTime() / 1000);

  const folder = "laalshika/products";

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
    },
    config.cloudinary.api_secret,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Upload signature generated successfully",
    data: {
      signature,
      timestamp,
      folder,
      cloudName: config.cloudinary.cloud_name,
      apiKey: config.cloudinary.api_key,
    },
  });
});

export const productUploadController = {
  getUploadSignature,
};
