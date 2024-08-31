import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  //validation
  if (!name || !email || !password) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }

  //Datebase call
  const user = await userModel.find({ email: email });

  if (user) {
    const error = createHttpError(400, " User already exits;");
    return next(error);
  }

  //process

  //Response
  res.json({
    message: "user created",
  });
};

export { createUser };
