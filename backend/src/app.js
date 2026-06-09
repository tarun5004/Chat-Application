import express from "express";

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Welcome to the Real-Time Chat API!' });
});

export default app;









// app.use(
//   morgan("dev", {
//     stream: {
//       write: (message) => logger.info(message.trim()),
//     },
//   })
// );
