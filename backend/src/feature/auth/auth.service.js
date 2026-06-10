import bcrypt from "bcrypt";
import ApiError from "../../utils/ApiError.js";
import { HTTP_STATUS } from "../../constants/httpStatus.js";
import { APP_MESSAGES } from "../../constants/messages.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import {
  clearUserRefreshToken,
  createUser,
  findUserByEmail,
  findUserById,
  updateUserRefreshToken,
} from "./auth.repository.js";

const buildSafeUser = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    isOnline: user.isOnline,
    lastSeen: user.lastSeen,
  };
};

const createAuthTokens = async (user) => {
  const payload = { userId: user._id };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await updateUserRefreshToken(user._id, refreshToken);

  return { accessToken, refreshToken };
};

const buildAuthResponse = async (user) => {
  const tokens = await createAuthTokens(user);

  return {
    user: buildSafeUser(user),
    ...tokens,
  };
};

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new ApiError(HTTP_STATUS.CONFLICT, APP_MESSAGES.USER_ALREADY_EXISTS);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await createUser({
    name,
    email,
    password: hashedPassword,
  });

  return buildAuthResponse(user);
};

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email, true);

  if (!user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, APP_MESSAGES.INVALID_CREDENTIALS);
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, APP_MESSAGES.INVALID_CREDENTIALS);
  }

  return buildAuthResponse(user);
};

export const refreshUserTokens = async (incomingRefreshToken) => {
  let decodedToken;

  try {
    decodedToken = verifyRefreshToken(incomingRefreshToken);
  } catch (error) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, APP_MESSAGES.INVALID_REFRESH_TOKEN);
  }

  const user = await findUserById(decodedToken.userId, true);

  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, APP_MESSAGES.INVALID_REFRESH_TOKEN);
  }

  return buildAuthResponse(user);
};

export const logoutUser = async (userId) => {
  await clearUserRefreshToken(userId);
};

export const getCurrentUser = (user) => {
  return buildSafeUser(user);
};
