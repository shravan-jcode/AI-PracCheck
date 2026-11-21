import express from "express"
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./db/db.js";
import cors from 'cors';

dotenv.config({});
connectDB();
const app=express();


const PORT = process.env.PORT || 3000;


// default middleware
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));





app.listen(PORT, () => {
    console.log(`Server listen at port ${PORT}`);
})
