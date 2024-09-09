import express from "express";
import createHttpError from "http-errors";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";
import bookRouter from "./book/bookRouter";
import cors from "cors";
import { config } from "./config/config";

const app = express();

app.use(
  cors({
    origin: config.frontendDomain,
  })
);

app.use(express.json()); // Middleware to parse JSON bodies

//Routes
app.get("/", (req, res, next) => {
  const error = createHttpError("400", "something went wrong");
  throw error;
  res.json({
    message: "Welcome to elib apis",
  });
});

app.use("/api/users", userRouter);
app.use("/api/books", bookRouter);

//(●'◡'●)END(^///^)£🌮

// Global error handler make sure at last
app.use(globalErrorHandler);

export default app;
