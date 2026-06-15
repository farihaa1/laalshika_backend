import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { sendResponse } from "../utils/sendResponse";
import { userServices } from "./user.service";
import config from "../../config";
import httpStatus from "http-status";
import User from "./user.model";



const registerUser = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    const data = await userServices.registerUser(payload);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "User created successfully",
        data,
    });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    const data = await userServices.loginUser(payload);

    res.cookie('accessToken', data.accessToken, {
        secure: config.node_env !== 'development',
        httpOnly: true,
        sameSite: 'lax',
    });

    res.cookie('refreshToken', data.refreshToken, {
        secure: config.node_env !== 'development',
        httpOnly: true,
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User Login Successfully',
        data,
    });
});

const getUser = catchAsync(async (req: Request, res: Response) => {
    const data = await User.find();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User retrieved Successfully',
        data,
    });
});
const refreshToken = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    const data = await userServices.refreshToken(refreshToken);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User Registered Successfully',
        data,
    });
});

export const userController = {
    registerUser,
    getUser,
    loginUser,
    refreshToken
};