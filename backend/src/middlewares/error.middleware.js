import { HTTP_STATUS } from "../constants/httpStatus.js";
import { APP_MESSAGES } from "../constants/messages.js";
import logger from "../utils/logger.js";

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;   //agar error me status code hai to use karenge, warna internal server error ka status code use karenge
  const message = err.message || APP_MESSAGES.INTERNAL_SERVER_ERROR;        //agar error me message hai to use karenge, warna internal server error ka message use karenge

  logger.error({ err }, message);   //error ko log karenge, taki pata chale ki kya error hua hai, aur uska stack trace bhi mile, taki debugging me help mile

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorMiddleware;



// // this is a app centralized error handling middleware, jo app ke har error ko handle karega, aur client ko ek consistent error response bhejega, taki client ko pata chale ki kya error hua hai, aur uska status code kya hai, taki client uske according handle kar sake
// service throws ApiError
// -> asyncHandler catches it
// -> next(error)
// -> errorMiddleware sends JSON response to client with error message and status code