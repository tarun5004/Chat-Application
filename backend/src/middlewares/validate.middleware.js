//controller tak bad data nahi jana chyie

import {HTTP_STATUS} from '../constants/httpStatus.js'; //use karenge status code ke liye
import {APP_MESSAGES} from '../constants/messages.js';  //use karenge messages ke liye, taki har jagah same message mile, aur agar change karna ho to ek jagah se kar sake

export const validateRequest = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse({  //zod ka method hai, jo schema ke against data ko validate karta hai, aur result me success ya error deta hai
            body: req.body,
            params: req.params,
            query: req.query
            
        });

        if (!result.success) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: APP_MESSAGES.VALIDATION_ERROR,
                errors: result.error.flatten(), //zod ka method hai, jo error ko flatten karta hai, taki easily samajh me aaye ki kya error hai, aur kis field me hai
            });
        }
        req.validated = result.data; //agar validation successful hai to validated data ko req me attach kar denge, taki controller me use kar sake
        next();
    }
}


// env = config guard
// logger = app diary
// morgan = request watcher
// constants = shared dictionary
// zod middleware = request gatekeeper
