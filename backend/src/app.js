import express from "express";
import notFoundMiddleware from "./middlewares/notFound.middleware.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Welcome to the Real-Time Chat API!' });
});

// app routes



app.use(notFoundMiddleware); //agar koi route match nahi karta hai to not found middleware ko use karenge, taki not found error throw ho jaye
app.use(errorMiddleware); //error handling middleware ko use karenge, taki app ke har error ko handle kar sake, aur client ko ek consistent error response bhej sake



export default app;




