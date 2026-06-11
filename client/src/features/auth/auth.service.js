import httpClient from "../../config/httpClient.js";

const unwrapResponse = (response) => {
  return response.data.data;
};

export const registerRequest = async (payload) => {
  const response = await httpClient.post("/auth/register", payload);
  return unwrapResponse(response);
};

export const loginRequest = async (payload) => {
  const response = await httpClient.post("/auth/login", payload);
  return unwrapResponse(response);
};

export const getMeRequest = async () => {
  const response = await httpClient.get("/auth/me");
  return unwrapResponse(response);
};

export const refreshTokenRequest = async (refreshToken) => {
  const response = await httpClient.post("/auth/refresh-token", { refreshToken });
  return unwrapResponse(response);
};

export const logoutRequest = async () => {
  const response = await httpClient.post("/auth/logout");
  return response.data;
};
