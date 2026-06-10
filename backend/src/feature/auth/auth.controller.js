import { APP_MESSAGES } from "../../constants/messages.js";
import { HTTP_STATUS } from "../../constants/httpStatus.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshUserTokens,
  registerUser,
} from "./auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.validated.body);

  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, result, APP_MESSAGES.REGISTER_SUCCESS));
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.validated.body);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, APP_MESSAGES.LOGIN_SUCCESS));
});

export const refreshToken = asyncHandler(async (req, res) => {
  const result = await refreshUserTokens(req.validated.body.refreshToken);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, APP_MESSAGES.TOKEN_REFRESH_SUCCESS));
});

export const logout = asyncHandler(async (req, res) => {
  await logoutUser(req.user._id);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, APP_MESSAGES.LOGOUT_SUCCESS));
});

export const me = asyncHandler(async (req, res) => {
  const currentUser = getCurrentUser(req.user);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, currentUser, APP_MESSAGES.CURRENT_USER_SUCCESS));
});
