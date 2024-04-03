import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './DataBase/DbConfig.js';
import userRouter from './Routers/userRouters.js';

dotenv.config()
const app = express();
app.use(cors({
    origin:"https://password-reset-frontend-by-arun.netlify.app"
}));
app.use(express.json());
const port = process.env.PORT || 4000;
connectDB();

app.use("/api/user",userRouter);

app.listen(port,()=>{
    console.log("Server is Running at Port-",port);
});