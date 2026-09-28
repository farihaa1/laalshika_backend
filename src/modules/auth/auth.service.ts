import bcrypt from "bcrypt";

import AppError from "../../error/AppError";
import User from "../users/user.model";
import config from "../../config";

const changePassword = async (
  email: string,
  newPassword: string,
  oldPassword: string,
) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordMatched) {
    throw new AppError(403, "Current password is incorrect");
  }

  user.password = await bcrypt.hash(newPassword, config.password_salt_round);

  await user.save();

  return {
    email: user.email,
    phone: user.phone,
  };
};

const resetPassword = async (
  email: string,
  phone: string,
  password: string,
) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.phone !== phone) {
    throw new AppError(403, "Wrong phone number");
  }

  user.password = await bcrypt.hash(password, config.password_salt_round);

  await user.save();

  return {
    email: user.email,
    phone: user.phone,
  };
};

export const authService = {
  changePassword,
  resetPassword,
};
