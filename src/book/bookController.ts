import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import bookModel from "./bookModel";
import fs from "node:fs";
import { AuthRequest } from "../middlewares/authenticate";
/*
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

    const _req = req as AuthRequest;
    const newBook = await bookModel.create({
      title,
      genre,
      author: _req.userId,
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

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body;
  const bookId = req.params.bookId;
  const files = req.files as { [filename: string]: Express.Multer.File[] };

  try {
    // Find the existing book
    const book = await bookModel.findById(bookId);
    if (!book) {
      return next(createHttpError(404, "Book not found"));
    }

    // Access userId from the request
    const _req = req as AuthRequest;
    if (book.author.toString() !== _req.userId) {
      return next(
        createHttpError(403, "You are not authorized to update this book")
      );
    }

    // Handle cover image update
    if (files.coverImage && files.coverImage[0]) {
      const coverImage = files.coverImage[0];
      const coverImageMimeType = coverImage.mimetype.split("/").at(-1);
      const coverImageFilePath = path.resolve(
        __dirname,
        "../../public/data/uploads",
        coverImage.filename
      );

      // Upload new cover image
      const uploadResult = await cloudinary.uploader.upload(
        coverImageFilePath,
        {
          filename_override: coverImage.filename,
          folder: "book-covers",
          format: coverImageMimeType,
        }
      );

      // Update cover image URL in the book
      book.coverImage = uploadResult.secure_url;

      // Delete old cover image file from server
      await fs.promises.unlink(coverImageFilePath);
    }

    // Handle book file update
    if (files.bookFile && files.bookFile[0]) {
      const bookFile = files.bookFile[0];
      const bookFilePath = path.resolve(
        __dirname,
        "../../public/data/uploads",
        bookFile.filename
      );

      // Upload new book file
      const bookFileUploadResult = await cloudinary.uploader.upload(
        bookFilePath,
        {
          resource_type: "raw",
          filename_override: bookFile.filename,
          folder: "book-pdf",
          format: "pdf",
        }
      );

      // Update book file URL in the book
      book.file = bookFileUploadResult.secure_url;

      // Delete old book file from server
      await fs.promises.unlink(bookFilePath);
    }

    const updateBook = await bookModel.findOneAndUpdate(
      {
        _id: bookId,
      },
      {}
    );

    return res.status(200).json({ message: "Book updated successfully", book });
  } catch (err) {
    console.error("Error:", err);
    return next(createHttpError(500, "Error while updating book"));
  }
};
*/

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre, description } = req.body;

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  // 'application/pdf'
  const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
  const fileName = files.coverImage[0].filename;
  const filePath = path.resolve(
    __dirname,
    "../../public/data/uploads",
    fileName
  );

  try {
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: fileName,
      folder: "book-covers",
      format: coverImageMimeType,
    });

    const bookFileName = files.file[0].filename;
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
        folder: "book-pdfs",
        format: "pdf",
      }
    );
    const _req = req as AuthRequest;

    const newBook = await bookModel.create({
      title,
      description,
      genre,
      author: _req.userId,
      coverImage: uploadResult.secure_url,
      file: bookFileUploadResult.secure_url,
    });

    // Delete temp.files
    // todo: wrap in try catch...
    await fs.promises.unlink(filePath);
    await fs.promises.unlink(bookFilePath);

    res.status(201).json({ id: newBook._id });
  } catch (err) {
    console.log(err);
    return next(createHttpError(500, "Error while uploading the files."));
  }
};

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, description, genre } = req.body;
  const bookId = req.params.bookId;

  const book = await bookModel.findOne({ _id: bookId });

  if (!book) {
    return next(createHttpError(404, "Book not found"));
  }
  // Check access
  const _req = req as AuthRequest;
  if (book.author.toString() !== _req.userId) {
    return next(createHttpError(403, "You can not update others book."));
  }

  // check if image field is exists.

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  let completeCoverImage = "";
  if (files.coverImage) {
    const filename = files.coverImage[0].filename;
    const converMimeType = files.coverImage[0].mimetype.split("/").at(-1);
    // send files to cloudinary
    const filePath = path.resolve(
      __dirname,
      "../../public/data/uploads/" + filename
    );
    completeCoverImage = filename;
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: completeCoverImage,
      folder: "book-covers",
      format: converMimeType,
    });

    completeCoverImage = uploadResult.secure_url;
    await fs.promises.unlink(filePath);
  }

  // check if file field is exists.
  let completeFileName = "";
  if (files.file) {
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads/" + files.file[0].filename
    );

    const bookFileName = files.file[0].filename;
    completeFileName = bookFileName;

    const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath, {
      resource_type: "raw",
      filename_override: completeFileName,
      folder: "book-pdfs",
      format: "pdf",
    });

    completeFileName = uploadResultPdf.secure_url;
    await fs.promises.unlink(bookFilePath);
  }

  const updatedBook = await bookModel.findOneAndUpdate(
    {
      _id: bookId,
    },
    {
      title: title,
      description: description,
      genre: genre,
      coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
      file: completeFileName ? completeFileName : book.file,
    },
    { new: true }
  );

  res.json(updatedBook);
};

const listBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const books = await bookModel.find();
    res.json(books);
    return;
  } catch (err) {
    return next(createHttpError("500", "Error while fetching books"));
  }
};

export { createBook, updateBook, listBooks };
