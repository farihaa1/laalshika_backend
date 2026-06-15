import { catchAsync } from "../modules/utils/catchAsync";
import { sendResponse } from "../modules/utils/sendResponse";
import { authService } from "./auth.service";

const changePassword = catchAsync(async (req, res) => {
    const { email } = req.user;
    const { newPassword, oldPassword } = req.body;

    const result = await authService.changePassword(email, newPassword, oldPassword)

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "changed password successfully",
        data: result
    })
})


const resetPassword = catchAsync(async (req, res) => {
    const { email, phone, password } = req.body;

    const result = await authService.resetPassword(email, phone, password);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Password Reseed successfully',
        data: result,
    });
});

const logout = catchAsync(async (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Logout successfully',
        data: null,
    });
});

export const authController = {
    changePassword,
    resetPassword,
    logout,
};