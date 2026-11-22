import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./db/db.js";
import cors from "cors";
import userRoute from "./routes/user.route.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

app.use("/api/v1/user", userRoute);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server listening at port ${PORT}`);
    });
  } catch (error) {
    console.log("Database connection failed:", error);
    process.exit(1);
  }
};

startServer();