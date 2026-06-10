import ApiError from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { APP_MESSAGES } from "../constants/messages.js";

const notFoundMiddleware = (req, res, next) => {
  next(                                                 //agar koi route match nahi karta hai to not found error throw karenge, taki error handling middleware me handle ho jaye
    new ApiError(
      HTTP_STATUS.NOT_FOUND,
      `${APP_MESSAGES.NOT_FOUND}: ${req.originalUrl}`    //error message me original url bhi bhejenge, taki pata chale ki kaunsa url not found hai
    )
  );
};

export default notFoundMiddleware;