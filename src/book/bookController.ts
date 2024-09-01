import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import bookModel from "./bookModel";
import fs from "node:fs";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body;
  const files = req.files as { [filename: string]: Express.Multer.File[] };
  const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
  const filename = files.coverImage[0].filename;
  const filepath = path.resolve(
    __dirname,
    "../../public/data/uploads",
    filename
  );

  try {
    const uploadResult = await cloudinary.uploader.upload(filepath, {
      filename_override: filename,
      folder: "bookCovers",
      format: coverImageMimeType,
    });

    const bookFileName = files.coverImage[0].filename;
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      bookFileName
    );

    const bookFileUploadResult = await cloudinary.uploader.upload(
      bookFilePath,
      {
        resource_type: "raw",
        filename_override: bookFileName,
        folder: "book-pdf",
        format: "pdf",
      }
    );

    console.log(uploadResult);
    console.log(bookFileUploadResult);
    //@ts-ignore
    console.log("userId", req.userId);

    const newBook = await bookModel.create({
      title,
      genre,
      author: "66d37047c1fe3d68cbb511be",
      coverImage: uploadResult.secure_url,
      file: bookFileUploadResult.secure_url,
    });

    //Delete temp files

    await fs.promises.unlink(filepath);
    if (files.bookFile && files.bookFile[0]) {
      const bookFile = files.bookFile[0];
      const bookFilePath = path.resolve(
        __dirname,
        "../../public/data/uploads",
        bookFile.filename
      );
      await fs.promises.unlink(bookFilePath);
    }

    return res.status(201).json({ id: newBook._id });
  } catch (err) {
    console.log("err", err);
    return next(createHttpError("500", "Error while uploading files"));
  }
};

export { createBook };
