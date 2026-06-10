import { APP_MESSAGES } from "../constants/messages.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { findUserById } from "../feature/users/user.repository.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, APP_MESSAGES.AUTH_TOKEN_REQUIRED);
  }

  const token = authHeader.split(" ")[1];
  let decodedToken;

  try {
    decodedToken = verifyAccessToken(token);
  } catch (error) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, APP_MESSAGES.INVALID_ACCESS_TOKEN);
  }

  const user = await findUserById(decodedToken.userId);

  if (!user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, APP_MESSAGES.USER_NOT_FOUND);
  }

  req.user = user;
  next();
});
