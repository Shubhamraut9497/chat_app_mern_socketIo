import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connect from './src/connect/connect.js';
import userRoutes from './src/routes/userRoutes.js'
import chatRoutes from './src/routes/chatRoutes.js';
import { errorHandler, notFound } from './src/middleware/errorMiddleware.js';
dotenv.config();
const PORT = process.env.PORT || 4500;

const app = express();

app.use(express.json());
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

// Routes for user authentication
app.use("/api/user",userRoutes);
app.use("/api/chat",chatRoutes);
app.use(notFound);
app.use(errorHandler);


app.listen(PORT, () => {
    connect();
    console.log(`server is running on ${PORT}`);
})