import express from "express";
import noteRoutes from "./routes/noteRoutes.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
import { globalErrorHandler } from "./middleware/errorHandler.js";
import morganMiddleware from "./middleware/morganMiddleware.js";



const app = express();

app.use(express.json());

app.use(morganMiddleware)

app.get("/api/v1/health", (req, res) => res.status(200).send("OK"));
app.use("/api/v1/notes", rateLimiter, noteRoutes);



app.use(globalErrorHandler);

export default app;