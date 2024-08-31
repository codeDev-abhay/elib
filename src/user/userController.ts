import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt";
import { JsonWebTokenError, sign } from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "./userTypes";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  //validation
  if (!name || !email || !password) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }

  //Datebase call
  //const user = await userModel.find({ email: email });
  try {
    const user = await userModel.findOne({ email });

    if (user) {
      const error = createHttpError(400, " User already exits;");
      return next(error);
    }
  } catch (err) {
    return next(createHttpError("500", "Error while getting error"));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let newUser: User;
  try {
    newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });
  } catch (err) {
    return next(createHttpError("500", "Error while creating user"));
  }

  //token generation: JWT 🔐🔐

  try {
    const token = sign(
      {
        sub: newUser._id,
      },
      config.jwtSecret as string,
      { expiresIn: "7d" }
    );

    //Response
    res.status(201).json({
      accessToken: token,
    });
  } catch (err) {
    return next(createHttpError("500", "Error while creating JWT Token"));
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(createHttpError(400, "All fields are required"));
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return next(createHttpError(404, "User not found"));
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(createHttpError(400, "Invalid credentials"));
    }

    // Generate token
    const token = sign({ sub: user._id }, config.jwtSecret as string, {
      expiresIn: "7d",
    });

    // Response
    res.json({
      accessToken: token,
      message: "Login successful",
    });
  } catch (err) {
    return next(createHttpError(500, "Error while processing request"));
  }
};

export { createUser, loginUser };
