import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import Redis from "ioredis";
import RedisStore from "rate-limit-redis";
import userrouter from "./routes/user.route.js"
import rateLimit from "express-rate-limit";
import errorHandler from "./middlewares/error.middleware.js";

const app=express();


app.use(cors({
    origin:process.env.CORS_ORIGIN || "*",
    credentials:true
}));


app.use(express.json({limit: "16kb"}));
app.use(express.static("public"));  

const redisClient = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: 6379
});



app.use(rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later."
}));


app.use(express.urlencoded({extended:true , limit: "16kb"}));      
app.use(cookieParser());
app.use("/api/v1/user",userrouter);
app.use(errorHandler);
app.all("*", (req, res) => {
    res.status(404).json({ message: "Not Found" });
});
export default app;