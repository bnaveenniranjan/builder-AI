import express from  "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectToDatabase } from "./config/db.js";
import authRouter from "./routes/authRoutes.js";

const app = express();

// DB connection is optional — server starts even if DB is unavailable
try {
  await connectToDatabase();
} catch (err) {
  console.warn(`[DB] no need to connect database: ${err.message}. Running without DB.`);
}

// this will help the installed dependencies and libary to use
app.use(cors({origin:process.env.ORIGINS.split(","),credentials: true}))
app.use(cookieParser)
app.use(express.json())

// to get request and responses
app.get("/" ,(req,res) => res.send("server is live "))
app.use('/api/auth', authRouter)

// Centralized error handler
app.use((err,_req,res,_next)=>{
    console.error(`[Error]${err.message}`);
    res.status(500).json({err:err.message})
})

const port = process.env.PORT || 3000;

//  this function used to listen the particular port
app.listen(port,()=>{
    console.log(`server is running at http://localhost:${port}`);
})